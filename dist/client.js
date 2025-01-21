"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const picocolors_1 = require("picocolors");
const websocket_client_1 = require("./common/websockets/websocket-client");
const project_files_1 = require("./project-files");
const changes_1 = require("./common/util/changes");
const credentials_1 = require("./credentials");
const actions_1 = require("./common/actions");
const tool_handlers_1 = require("./tool-handlers");
const constants_1 = require("./common/constants");
const lodash_1 = require("lodash");
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
const ts_pattern_1 = require("ts-pattern");
const fingerprint_1 = require("./fingerprint");
const git_1 = require("./common/util/git");
const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';
const chat_storage_1 = require("./chat-storage");

// Add utility function for JSON formatting
const formatJsonResponse = (data) => {
  try {
    if (typeof data === 'string') {
      // Try to parse string as JSON
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed, null, 2);
    } else if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    return data;
  } catch (e) {
    return data; // Return original if not valid JSON
  }
};

class Client {
    webSocket;
    chatStorage;
    currentUserInputId;
    returnControlToUser;
    fingerprintId;
    costMode;
    fileVersions = [];
    fileContext;
    user;
    lastWarnedPct = 0;
    usage = 0;
    limit = 0;
    subscription_active = false;
    lastRequestCredits = 0;
    sessionCreditsUsed = 0;
    nextQuotaReset = null;
    git;
    openRouter;
    openRouterResponse = null;
    eventCallbacks;
    constructor(websocketUrl, chatStorage, onWebSocketError, onWebSocketReconnect, returnControlToUser, costMode, git, openRouter) {
        this.costMode = costMode;
        this.git = git;
        this.openRouter = openRouter;
        this.eventCallbacks = new Map();
        
        // Create enhanced mock websocket for OpenRouter
        if (this.openRouter) {
            this.webSocket = this.createOpenRouterWebSocket();
        } else {
            this.webSocket = new websocket_client_1.APIRealtimeClient(websocketUrl, onWebSocketError, onWebSocketReconnect);
        }
        
        this.chatStorage = chatStorage;
        this.user = this.getUser();
        this.getFingerprintId();
        this.returnControlToUser = returnControlToUser;
    }

    createOpenRouterWebSocket() {
        return {
            connect: async () => {
                console.log('[DEBUG] Mock WebSocket connected');
                // Handle init action
                this.eventCallbacks.get('init')?.forEach(callback => callback());
            },
            sendAction: async (action) => {
                switch (action.type) {
                    case 'user-input':
                        await this.handleOpenRouterRequest(action);
                        break;
                    case 'stop-response':
                        this.handleStopResponse();
                        break;
                    case 'init':
                        // Handle init silently
                        break;
                    case 'response-chunk':
                        // Handle response chunks internally
                        break;
                    case 'response-complete':
                        // Handle response complete internally
                        break;
                    default:
                        console.log('[DEBUG] Unhandled action type:', action.type);
                }
            },
            subscribe: (event, callback) => {
                if (!this.eventCallbacks.has(event)) {
                    this.eventCallbacks.set(event, new Set());
                }
                this.eventCallbacks.get(event).add(callback);
                return () => {
                    this.eventCallbacks.get(event).delete(callback);
                };
            },
            disconnect: () => {
                console.log('[DEBUG] Mock WebSocket disconnected');
            }
        };
    }

    handleError(error, userInputId) {
        console.error('[ERROR]', error);
        
        // Notify all error subscribers
        this.eventCallbacks.get('action-error')?.forEach(callback => {
            callback({
                message: error.message,
                userInputId,
                type: 'error',
                details: {
                    timestamp: new Date().toISOString(),
                    model: this.openRouter?.model,
                    errorType: error.name,
                    application: 'codebullet'
                }
            });
        });

        // Log error to chat history
        const errorMessage = {
            role: 'system',
            content: `Error: ${error.message}`,
            metadata: {
                error: true,
                timestamp: new Date().toISOString(),
                model: this.openRouter?.model
            }
        };
        this.chatStorage.addMessage(this.chatStorage.getCurrentChat(), errorMessage);
    }

    handleStopResponse() {
        this.eventCallbacks.get('response-stopped')?.forEach(callback => {
            callback({
                timestamp: new Date().toISOString(),
                model: this.openRouter?.model
            });
        });
    }

    // Enhanced response handling with retries
    async makeOpenRouterRequest(endpoint, options, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(`${OPENROUTER_API_BASE}${endpoint}`, {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': `Bearer ${this.openRouter.key}`,
                        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL,
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}\n${errorText}`);
                }

                return response;
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
            }
        }
    }

    // Add method to handle response cleanup
    cleanup() {
        this.eventCallbacks.clear();
        if (this.openRouter) {
            console.log('[DEBUG] Cleaning up OpenRouter session');
        }
    }

    initFileVersions(projectFileContext) {
        const { knowledgeFiles } = projectFileContext;
        this.fileContext = projectFileContext;
        this.fileVersions = [
            Object.entries(knowledgeFiles).map(([path, content]) => ({
                path,
                content,
            })),
        ];
    }
    async getFingerprintId() {
        if (this.fingerprintId) {
            return this.fingerprintId;
        }
        this.fingerprintId =
            this.user?.fingerprintId ?? (await (0, fingerprint_1.calculateFingerprint)());
        return this.fingerprintId;
    }
    getUser() {
        if (!fs.existsSync(credentials_1.CREDENTIALS_PATH)) {
            return;
        }
        const credentialsFile = fs.readFileSync(credentials_1.CREDENTIALS_PATH, 'utf8');
        const user = (0, credentials_1.userFromJson)(credentialsFile);
        return user;
    }
    async connect() {
        await this.webSocket.connect();
        this.setupSubscriptions();
    }
    async handleReferralCode(referralCode) {
        if (this.user) {
            // User is logged in, so attempt to redeem referral code directly
            try {
                const redeemReferralResp = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/referrals`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Cookie: `next-auth.session-token=${this.user.authToken};`,
                    },
                    body: JSON.stringify({
                        referralCode,
                        authToken: this.user.authToken,
                    }),
                });
                const respJson = await redeemReferralResp.json();
                if (redeemReferralResp.ok) {
                    console.log([
                        (0, picocolors_1.green)(`Noice, you've earned an extra ${respJson.credits_redeemed} credits!`),
                        `(pssst: you can also refer new users and earn ${constants_1.CREDITS_REFERRAL_BONUS} credits for each referral at: ${process.env.NEXT_PUBLIC_APP_URL}/referrals)`,
                    ].join('\n'));
                    this.getUsage();
                }
                else {
                    throw new Error(respJson.error);
                }
            }
            catch (e) {
                const error = e;
                console.error((0, picocolors_1.red)('Error: ' + error.message));
                this.returnControlToUser();
            }
        }
        else {
            await this.login(referralCode);
        }
    }
    async logout() {
        if (this.user) {
            // If there was an existing user, clear their existing state
            this.webSocket.sendAction({
                type: 'clear-auth-token',
                authToken: this.user.authToken,
                userId: this.user.id,
                fingerprintId: this.user.fingerprintId,
                fingerprintHash: this.user.fingerprintHash,
            });
            // delete credentials file
            fs.unlinkSync(credentials_1.CREDENTIALS_PATH);
            console.log(`Logged you out of your account (${this.user.name})`);
            this.user = undefined;
        }
    }
    async login(referralCode) {
        this.logout();
        this.webSocket.sendAction({
            type: 'login-code-request',
            fingerprintId: await this.getFingerprintId(),
            referralCode,
        });
    }
    setUsage({ usage, limit, subscription_active, next_quota_reset, referralLink, session_credits_used, }) {
        this.usage = usage;
        this.limit = limit;
        this.subscription_active = subscription_active;
        this.nextQuotaReset = next_quota_reset;
        if (!!session_credits_used) {
            this.lastRequestCredits = Math.max(session_credits_used - this.sessionCreditsUsed, 0);
            this.sessionCreditsUsed = session_credits_used;
        }
        // this.showUsageWarning(referralLink)
    }
    setupSubscriptions() {
        this.webSocket.subscribe('action-error', (action) => {
            console.error(['', (0, picocolors_1.red)(`Error: ${action.message}`)].join('\n'));
            this.returnControlToUser();
            return;
        });
        this.webSocket.subscribe('tool-call', async (a) => {
            const { response, changes, changesAlreadyApplied, data, userInputId, addedFileVersions, resetFileVersions, } = a;
            if (userInputId !== this.currentUserInputId) {
                return;
            }
            if (resetFileVersions) {
                this.fileVersions = [addedFileVersions];
            }
            else {
                this.fileVersions.push(addedFileVersions);
            }
            const filesChanged = (0, lodash_1.uniq)(changes.map((change) => change.filePath));
            this.chatStorage.saveFilesChanged(filesChanged);
            // Stage files about to be changed if flag was set
            if (this.git === 'stage' && changes.length > 0) {
                const didStage = (0, git_1.stagePatches)((0, project_files_1.getProjectRoot)(), changes);
                if (didStage) {
                    console.log((0, picocolors_1.green)('\nStaged previous changes'));
                }
            }
            (0, changes_1.applyChanges)((0, project_files_1.getProjectRoot)(), changes);
            const { id, name, input } = data;
            const currentChat = this.chatStorage.getCurrentChat();
            const messages = currentChat.messages;
            if (messages[messages.length - 1].role === 'assistant') {
                // Probably the last response from the assistant was cancelled and added immediately.
                return;
            }
            const assistantMessage = {
                role: 'assistant',
                content: response,
            };
            this.chatStorage.addMessage(this.chatStorage.getCurrentChat(), assistantMessage);
            const handler = tool_handlers_1.toolHandlers[name];
            if (handler) {
                const content = await handler(input, id);
                const toolResultMessage = {
                    role: 'user',
                    content: `${constants_1.TOOL_RESULT_MARKER}\n${content}`,
                };
                this.chatStorage.addMessage(this.chatStorage.getCurrentChat(), toolResultMessage);
                await this.sendUserInput([...changesAlreadyApplied, ...changes], userInputId);
            }
            else {
                console.error(`No handler found for tool: ${name}`);
            }
        });
        this.webSocket.subscribe('read-files', (a) => {
            const { filePaths } = a;
            const files = (0, project_files_1.getFiles)(filePaths);
            this.webSocket.sendAction({
                type: 'read-files-response',
                files,
            });
        });
        this.webSocket.subscribe('npm-version-status', (action) => {
            const { isUpToDate } = action;
            if (!isUpToDate) {
                console.warn((0, picocolors_1.yellow)(`\nThere's a new version of Codebuff! Please update to ensure proper functionality.\nUpdate now by running: npm install -g codebuff`));
            }
        });
        let shouldRequestLogin = false;
        this.webSocket.subscribe('login-code-response', async ({ loginUrl, fingerprintHash }) => {
            const responseToUser = [
                'Please visit the following URL to log in:',
                '\n',
                loginUrl,
                '\n',
                'See you back here after you finish logging in 👋',
            ];
            console.log(responseToUser.join('\n'));
            // call backend every few seconds to check if user has been created yet, using our fingerprintId, for up to 5 minutes
            const initialTime = Date.now();
            shouldRequestLogin = true;
            const handler = setInterval(async () => {
                if (Date.now() - initialTime > 300000 || !shouldRequestLogin) {
                    shouldRequestLogin = false;
                    clearInterval(handler);
                    return;
                }
                this.webSocket.sendAction({
                    type: 'login-status-request',
                    fingerprintId: await this.getFingerprintId(),
                    fingerprintHash,
                });
            }, 5000);
        });
        this.webSocket.subscribe('auth-result', (action) => {
            shouldRequestLogin = false;
            if (action.user) {
                this.user = action.user;
                // Store in config file
                const credentialsPathDir = path_1.default.dirname(credentials_1.CREDENTIALS_PATH);
                fs.mkdirSync(credentialsPathDir, { recursive: true });
                fs.writeFileSync(credentials_1.CREDENTIALS_PATH, JSON.stringify({ default: action.user }));
                const responseToUser = [
                    'Authentication successful!',
                    `Welcome, ${action.user.name}. Your credits have been increased by ${constants_1.CREDITS_USAGE_LIMITS.FREE / constants_1.CREDITS_USAGE_LIMITS.ANON}x to ${constants_1.CREDITS_USAGE_LIMITS.FREE.toLocaleString()} per month. Happy coding!`,
                    `Refer new users and earn ${constants_1.CREDITS_REFERRAL_BONUS} credits per month each: ${process.env.NEXT_PUBLIC_APP_URL}/referrals`,
                ];
                console.log(responseToUser.join('\n'));
                this.lastWarnedPct = 0;
                this.getUsage();
                // this.returnControlToUser()
            }
            else {
                console.warn(`Authentication failed: ${action.message}. Please try again in a few minutes or contact support at ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}.`);
            }
        });
        this.webSocket.subscribe('usage-response', (action) => {
            const parsedAction = actions_1.UsageReponseSchema.safeParse(action);
            if (!parsedAction.success)
                return;
            const a = parsedAction.data;
            console.log(`Usage: ${a.usage} / ${a.limit} credits`);
            this.setUsage(a);
            this.returnControlToUser();
        });
    }
    showUsageWarning(referralLink) {
        const errorCopy = [
            this.user
                ? (0, picocolors_1.green)(`Visit ${process.env.NEXT_PUBLIC_APP_URL}/pricing to upgrade.`)
                : (0, picocolors_1.green)('Type "login" below to sign up and get more credits!'),
            referralLink
                ? (0, picocolors_1.green)(`Refer friends by sharing this link and you'll ${(0, picocolors_1.bold)(`each earn ${constants_1.CREDITS_REFERRAL_BONUS} credits per month`)}: ${referralLink}`)
                : '',
        ].join('\n');
        const pct = (0, ts_pattern_1.match)(Math.floor((this.usage / this.limit) * 100))
            .with(ts_pattern_1.P.number.gte(100), () => 100)
            .with(ts_pattern_1.P.number.gte(75), () => 75)
            .otherwise(() => 0);
        // User has used all their allotted credits, but they haven't been notified yet
        if (pct >= 100 && this.lastWarnedPct < 100) {
            if (this.subscription_active) {
                console.warn((0, picocolors_1.yellow)(`You have exceeded your monthly quota, but feel free to keep using Codebuff! We'll continue to charge you for the overage until your next billing cycle. See ${process.env.NEXT_PUBLIC_APP_URL}/usage for more details.`));
                this.lastWarnedPct = 100;
                return;
            }
            console.error([(0, picocolors_1.red)('You have reached your monthly usage limit.'), errorCopy].join('\n'));
            this.returnControlToUser();
            this.lastWarnedPct = 100;
            return;
        }
        if (pct > 0 && pct > this.lastWarnedPct) {
            console.warn([
                '',
                (0, picocolors_1.yellow)(`You have used over ${pct}% of your monthly usage limit (${this.usage}/${this.limit} credits).`),
                errorCopy,
            ].join('\n'));
            this.lastWarnedPct = pct;
        }
    }
    async generateCommitMessage(stagedChanges) {
        return new Promise(async (resolve, reject) => {
            const unsubscribe = this.webSocket.subscribe('commit-message-response', (action) => {
                unsubscribe();
                resolve(action.commitMessage);
            });
            this.webSocket.sendAction({
                type: 'generate-commit-message',
                fingerprintId: await this.getFingerprintId(),
                authToken: this.user?.authToken,
                stagedChanges,
            });
        });
    }
    async sendUserInput(previousChanges, userInputId) {
        console.log('\n[DEBUG] sendUserInput called');
        this.currentUserInputId = userInputId;
        const currentChat = this.chatStorage.getCurrentChat();
        const { messages, fileVersions: messageFileVersions } = currentChat;
        const currentFileVersion = messageFileVersions[messageFileVersions.length - 1]?.files ?? {};
        const fileContext = await (0, project_files_1.getProjectFileContext)((0, project_files_1.getProjectRoot)(), currentFileVersion, this.fileVersions);
        this.fileContext = fileContext;

        // If using OpenRouter, make API call but send response through websocket
        if (this.openRouter) {
            console.log('[DEBUG] Using OpenRouter with websocket pipeline');
            try {
                const response = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.openRouter.key}`,
                        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL,
                    },
                    body: JSON.stringify({
                        model: this.openRouter.model,
                        messages: messages.map(m => ({
                            role: m.role,
                            content: m.content
                        })),
                        stream: true
                    })
                });

                if (!response.ok) {
                    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
                }

                // Add metadata about the model to the chat
                currentChat.metadata = {
                    ...currentChat.metadata,
                    model: this.openRouter.model,
                    provider: 'openrouter'
                };
                this.chatStorage.updateChat(currentChat);

                // Send initial action to websocket to set up streaming
                this.webSocket.sendAction({
                    type: 'user-input',
                    userInputId,
                    messages,
                    fileContext,
                    changesAlreadyApplied: previousChanges,
                    fingerprintId: await this.getFingerprintId(),
                    authToken: this.user?.authToken,
                    costMode: this.costMode,
                    openRouterStream: true // Signal that this is an OpenRouter stream
                });

                // Process stream and forward chunks through websocket
                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (!line.trim() || !line.startsWith('data: ')) continue;
                        
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const json = JSON.parse(data);
                            const content = json.choices?.[0]?.delta?.content;
                            
                            if (content) {
                                // Forward content through websocket
                                this.webSocket.sendAction({
                                    type: 'response-chunk',
                                    userInputId,
                                    chunk: content
                                });
                            }
                        } catch (e) {
                            console.error('[DEBUG] Error parsing JSON:', e);
                        }
                    }
                }

                // Send completion action
                this.webSocket.sendAction({
                    type: 'response-complete',
                    userInputId,
                    response: '',
                    changes: [],
                    changesAlreadyApplied: [],
                    addedFileVersions: [],
                    resetFileVersions: false
                });

            } catch (error) {
                console.error('[DEBUG] OpenRouter error:', error);
                this.webSocket.sendAction({
                    type: 'action-error',
                    message: error.message
                });
            }
            return;
        }

        // Default websocket behavior
        this.webSocket.sendAction({
            type: 'user-input',
            userInputId,
            messages,
            fileContext,
            changesAlreadyApplied: previousChanges,
            fingerprintId: await this.getFingerprintId(),
            authToken: this.user?.authToken,
            costMode: this.costMode,
        });
    }
    subscribeToResponse(onChunk, userInputId, onStreamStart) {
        console.log('[DEBUG] Setting up response subscription');
        let responseBuffer = '';
        let resolveResponse;
        let rejectResponse;
        let unsubscribeChunks;
        let unsubscribeComplete;
        let streamStarted = false;

        const responsePromise = new Promise((resolve, reject) => {
            resolveResponse = resolve;
            rejectResponse = reject;
        });

        // Subscribe to stream start events
        const unsubscribeStreamStart = this.webSocket.subscribe('stream-start', (a) => {
            if (a.userInputId !== userInputId) return;
            if (!streamStarted) {
                streamStarted = true;
                console.log('[DEBUG] Stream started, model:', a.model);
                // Pass model to the onStreamStart callback
                onStreamStart(a.model);
            }
        });

        unsubscribeChunks = this.webSocket.subscribe('response-chunk', (a) => {
            if (a.userInputId !== userInputId) return;
            
            if (!streamStarted && this.openRouter) {
                streamStarted = true;
                console.log('[DEBUG] First chunk received');
                // Pass model name from OpenRouter config if not already started
                onStreamStart(this.openRouter.model);
            }
            
            responseBuffer += a.chunk;
            onChunk(a.chunk);
        });

        unsubscribeComplete = this.webSocket.subscribe('response-complete', (action) => {
            if (action.userInputId !== userInputId) return;
            console.log('[DEBUG] Response complete');
            unsubscribeStreamStart();
            unsubscribeChunks();
            unsubscribeComplete();
            resolveResponse({
                ...action,
                response: responseBuffer,
                wasStoppedByUser: false
            });
        });

        return {
            responsePromise,
            stopResponse: () => {
                console.log('[DEBUG] Stop response triggered');
                unsubscribeStreamStart();
                unsubscribeChunks();
                unsubscribeComplete();
                resolveResponse({
                    type: 'response-complete',
                    userInputId,
                    response: responseBuffer + '\n[RESPONSE_STOPPED_BY_USER]',
                    changes: [],
                    changesAlreadyApplied: [],
                    addedFileVersions: [],
                    resetFileVersions: false,
                    wasStoppedByUser: true
                });
            }
        };
    }
    async getUsage() {
        this.webSocket.sendAction({
            type: 'usage',
            fingerprintId: await this.getFingerprintId(),
            authToken: this.user?.authToken,
        });
    }
    async warmContextCache() {
        const fileContext = await (0, project_files_1.getProjectFileContext)((0, project_files_1.getProjectRoot)(), {}, this.fileVersions);
        // Don't wait for response anymore.
        this.webSocket.subscribe('init-response', (a) => {
            const parsedAction = actions_1.InitResponseSchema.safeParse(a);
            if (!parsedAction.success)
                return;
            this.setUsage(parsedAction.data);
        });
        this.webSocket
            .sendAction({
            type: 'init',
            fingerprintId: await this.getFingerprintId(),
            authToken: this.user?.authToken,
            fileContext,
        })
            .catch((e) => {
            // console.error('Error warming context cache', e)
        });
    }
    async handleOpenRouterRequest(action) {
        const { userInputId, messages, fileContext } = action;
        const currentChat = this.chatStorage.getCurrentChat();

        try {
            const messagesWithContext = messages.map(m => ({
                role: m.role,
                content: m.role === 'user' 
                    ? `${fileContext ? `Project Context:\n${JSON.stringify(fileContext, null, 2)}\n\n` : ''}${m.content}`
                    : m.content
            }));

            const response = await this.makeOpenRouterRequest('/chat/completions', {
                method: 'POST',
                body: JSON.stringify({
                    model: this.openRouter.model,
                    messages: messagesWithContext,
                    stream: true
                })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let isFirstChunk = true;
            let responseBuffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.trim() || !line.startsWith('data: ')) continue;
                    
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const json = JSON.parse(data);
                        const content = json.choices?.[0]?.delta?.content;
                        
                        if (content) {
                            if (isFirstChunk) {
                                this.eventCallbacks.get('stream-start')?.forEach(callback => {
                                    callback({ 
                                        userInputId,
                                        model: this.openRouter.model 
                                    });
                                });
                                isFirstChunk = false;
                            }
                            
                            responseBuffer += content;
                            this.eventCallbacks.get('response-chunk')?.forEach(callback => {
                                callback({ userInputId, chunk: content });
                            });
                        }
                    } catch (e) {
                        console.error('[DEBUG] JSON parsing error:', e);
                    }
                }
            }

            // Send completion event
            this.eventCallbacks.get('response-complete')?.forEach(callback => {
                callback({
                    type: 'response-complete',
                    userInputId,
                    response: responseBuffer,
                    changes: [],
                    changesAlreadyApplied: [],
                    addedFileVersions: [],
                    resetFileVersions: false,
                    wasStoppedByUser: false
                });
            });

        } catch (error) {
            console.error('[DEBUG] OpenRouter error:', error);
            this.handleError(error, userInputId);
        }
    }
    async handleCommand(command, args) {
        // Handle commands consistently for both OpenRouter and regular mode
        switch (command) {
            case '/clear':
                this.chatStorage = new chat_storage_1.ChatStorage();
                return { success: true, message: 'Chat history cleared.' };
                
            case '/undo':
                if (this.chatStorage.navigateVersion('undo')) {
                    const files = this.chatStorage.getCurrentVersion()?.files ?? {};
                    (0, project_files_1.setFiles)(files);
                    return { success: true, message: 'Undid last changes.' };
                }
                return { success: false, message: 'Nothing to undo.' };
                
            case '/redo':
                if (this.chatStorage.navigateVersion('redo')) {
                    const files = this.chatStorage.getCurrentVersion()?.files ?? {};
                    (0, project_files_1.setFiles)(files);
                    return { success: true, message: 'Redid last changes.' };
                }
                return { success: false, message: 'Nothing to redo.' };
                
            case '/save':
                const saveName = args[0] || new Date().toISOString();
                this.chatStorage.saveCurrentState(saveName);
                return { success: true, message: `Saved current state as "${saveName}"` };
                
            case '/load':
                const loadName = args[0];
                if (!loadName) {
                    return { success: false, message: 'Please specify a save name to load.' };
                }
                if (this.chatStorage.loadState(loadName)) {
                    return { success: true, message: `Loaded state "${loadName}"` };
                }
                return { success: false, message: `No save found with name "${loadName}"` };
                
            case '/diff':
                const changes = (0, project_files_1.getChangesSinceLastFileVersion)(
                    this.chatStorage.getCurrentVersion()?.files ?? {}
                );
                return { 
                    success: true, 
                    message: 'Current changes:',
                    data: changes
                };
        }
    }
}
exports.Client = Client;
//# sourceMappingURL=client.js.map