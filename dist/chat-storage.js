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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatStorage = void 0;
const path = __importStar(require("path"));
const project_files_1 = require("./project-files");
const MANICODE_DIR = '.manicode';
const CHATS_DIR = 'chats';
class ChatStorage {
    baseDir;
    currentChat;
    currentVersionIndex;
    constructor() {
        this.baseDir = path.join((0, project_files_1.getProjectRoot)(), '.manicode', 'chats');
        this.currentChat = this.createChat();
        this.currentVersionIndex = -1;
    }
    getCurrentChat() {
        return this.currentChat;
    }
    addMessage(chat, message, metadata = {}) {
        const enhancedMessage = {
            ...message,
            metadata: {
                ...metadata,
                timestamp: new Date().toISOString()
            }
        };
        chat.messages.push(enhancedMessage);
        chat.updatedAt = new Date().toISOString();
        this.saveChat(chat);
    }
    getCurrentVersion() {
        if (this.currentVersionIndex >= 0 &&
            this.currentVersionIndex < this.currentChat.fileVersions.length) {
            return this.currentChat.fileVersions[this.currentVersionIndex];
        }
        return null;
    }
    navigateVersion(direction) {
        if (direction === 'undo' && this.currentVersionIndex >= 0) {
            this.currentVersionIndex--;
            return true;
        }
        else if (direction === 'redo' &&
            this.currentVersionIndex < this.currentChat.fileVersions.length - 1) {
            this.currentVersionIndex++;
            return true;
        }
        return false;
    }
    saveFilesChanged(filesChanged) {
        let currentVersion = this.getCurrentVersion();
        if (!currentVersion) {
            this.addNewFileState({}, {});
            currentVersion = this.getCurrentVersion();
        }
        const newFilesChanged = filesChanged.filter((f) => !currentVersion.files[f]);
        const updatedFiles = (0, project_files_1.getExistingFiles)(newFilesChanged);
        currentVersion.files = { ...currentVersion.files, ...updatedFiles };
        return Object.keys(currentVersion.files);
    }
    saveCurrentFileState(files) {
        const currentVersion = this.getCurrentVersion();
        if (currentVersion) {
            currentVersion.files = files;
        }
        else {
            this.addNewFileState(files, {});
        }
    }
    addNewFileState(files, metadata = {}) {
        const newVersion = {
            files,
            metadata: {
                ...metadata,
                timestamp: new Date().toISOString()
            }
        };
        this.currentChat.fileVersions.push(newVersion);
        this.currentVersionIndex = this.currentChat.fileVersions.length - 1;
        this.updateChat(this.currentChat);
    }
    createChat(messages = []) {
        const chat = {
            id: this.generateChatId(),
            messages,
            fileVersions: [],
            metadata: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.saveChat(chat);
        return chat;
    }
    updateChat(chat) {
        chat.updatedAt = new Date().toISOString();
        this.saveChat(chat);
    }
    saveChat(chat) {
        const filePath = this.getFilePath(chat.id);
        // fs.writeFileSync(filePath, JSON.stringify(chat, null, 2))
    }
    generateChatId() {
        const now = new Date();
        const datePart = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timePart = now
            .toISOString()
            .split('T')[1]
            .replace(/:/g, '-')
            .split('.')[0]; // HH-MM-SS
        const randomPart = Math.random().toString(36).substr(2, 5);
        return `${datePart}_${timePart}_${randomPart}`;
    }
    getFilePath(chatId) {
        return path.join(this.baseDir, `${chatId}.json`);
    }
    getChatHistory() {
        const chat = this.getCurrentChat();
        return {
            messages: chat.messages,
            metadata: chat.metadata,
            fileVersions: chat.fileVersions
        };
    }
}
exports.ChatStorage = ChatStorage;
//# sourceMappingURL=chat-storage.js.map