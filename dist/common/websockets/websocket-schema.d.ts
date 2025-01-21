import { z } from 'zod';
export declare const CLIENT_MESSAGE_SCHEMAS: {
    readonly identify: z.ZodObject<{
        type: z.ZodLiteral<"identify">;
        txid: z.ZodNumber;
        clientSessionId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "identify";
        txid: number;
        clientSessionId: string;
    }, {
        type: "identify";
        txid: number;
        clientSessionId: string;
    }>;
    readonly subscribe: z.ZodObject<{
        type: z.ZodLiteral<"subscribe">;
        txid: z.ZodNumber;
        topics: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "subscribe";
        txid: number;
        topics: string[];
    }, {
        type: "subscribe";
        txid: number;
        topics: string[];
    }>;
    readonly unsubscribe: z.ZodObject<{
        type: z.ZodLiteral<"unsubscribe">;
        txid: z.ZodNumber;
        topics: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "unsubscribe";
        txid: number;
        topics: string[];
    }, {
        type: "unsubscribe";
        txid: number;
        topics: string[];
    }>;
    readonly ping: z.ZodObject<{
        type: z.ZodLiteral<"ping">;
        txid: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: "ping";
        txid: number;
    }, {
        type: "ping";
        txid: number;
    }>;
    readonly action: z.ZodObject<{
        type: z.ZodLiteral<"action">;
        txid: z.ZodNumber;
        data: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
            type: z.ZodLiteral<"user-input">;
            fingerprintId: z.ZodString;
            authToken: z.ZodOptional<z.ZodString>;
            userInputId: z.ZodString;
            messages: z.ZodArray<z.ZodObject<{
                role: z.ZodUnion<[z.ZodLiteral<"user">, z.ZodLiteral<"assistant">]>;
                content: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"text">;
                    text: z.ZodString;
                    cache_control: z.ZodOptional<z.ZodObject<{
                        type: z.ZodLiteral<"ephemeral">;
                    }, "strip", z.ZodTypeAny, {
                        type: "ephemeral";
                    }, {
                        type: "ephemeral";
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    type: "text";
                    text: string;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                }, {
                    type: "text";
                    text: string;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                }>, z.ZodObject<{
                    type: z.ZodLiteral<"tool_use">;
                    id: z.ZodString;
                    name: z.ZodString;
                    input: z.ZodRecord<z.ZodString, z.ZodAny>;
                    cache_control: z.ZodOptional<z.ZodObject<{
                        type: z.ZodLiteral<"ephemeral">;
                    }, "strip", z.ZodTypeAny, {
                        type: "ephemeral";
                    }, {
                        type: "ephemeral";
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    type: "tool_use";
                    id: string;
                    name: string;
                    input: Record<string, any>;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                }, {
                    type: "tool_use";
                    id: string;
                    name: string;
                    input: Record<string, any>;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                }>, z.ZodObject<{
                    type: z.ZodLiteral<"tool_result">;
                    tool_use_id: z.ZodString;
                    content: z.ZodString;
                    cache_control: z.ZodOptional<z.ZodObject<{
                        type: z.ZodLiteral<"ephemeral">;
                    }, "strip", z.ZodTypeAny, {
                        type: "ephemeral";
                    }, {
                        type: "ephemeral";
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    type: "tool_result";
                    tool_use_id: string;
                    content: string;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                }, {
                    type: "tool_result";
                    tool_use_id: string;
                    content: string;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                }>]>, "many">]>;
            }, "strip", z.ZodTypeAny, {
                content: string | ({
                    type: "text";
                    text: string;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                } | {
                    type: "tool_use";
                    id: string;
                    name: string;
                    input: Record<string, any>;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                } | {
                    type: "tool_result";
                    tool_use_id: string;
                    content: string;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                })[];
                role: "user" | "assistant";
            }, {
                content: string | ({
                    type: "text";
                    text: string;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                } | {
                    type: "tool_use";
                    id: string;
                    name: string;
                    input: Record<string, any>;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                } | {
                    type: "tool_result";
                    tool_use_id: string;
                    content: string;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                })[];
                role: "user" | "assistant";
            }>, "many">;
            fileContext: z.ZodObject<{
                currentWorkingDirectory: z.ZodString;
                fileTree: z.ZodArray<z.ZodType<import("../util/file").FileTreeNode, z.ZodTypeDef, import("../util/file").FileTreeNode>, "many">;
                fileTokenScores: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodNumber>>;
                knowledgeFiles: z.ZodRecord<z.ZodString, z.ZodString>;
                gitChanges: z.ZodObject<{
                    status: z.ZodString;
                    diff: z.ZodString;
                    diffCached: z.ZodString;
                    lastCommitMessages: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    diff: string;
                    status: string;
                    diffCached: string;
                    lastCommitMessages: string;
                }, {
                    diff: string;
                    status: string;
                    diffCached: string;
                    lastCommitMessages: string;
                }>;
                changesSinceLastChat: z.ZodRecord<z.ZodString, z.ZodString>;
                shellConfigFiles: z.ZodRecord<z.ZodString, z.ZodString>;
                systemInfo: z.ZodObject<{
                    platform: z.ZodString;
                    shell: z.ZodString;
                    nodeVersion: z.ZodString;
                    arch: z.ZodString;
                    homedir: z.ZodString;
                    cpus: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    platform: string;
                    shell: string;
                    nodeVersion: string;
                    arch: string;
                    homedir: string;
                    cpus: number;
                }, {
                    platform: string;
                    shell: string;
                    nodeVersion: string;
                    arch: string;
                    homedir: string;
                    cpus: number;
                }>;
                fileVersions: z.ZodArray<z.ZodArray<z.ZodObject<{
                    path: z.ZodString;
                    content: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    path: string;
                    content: string;
                }, {
                    path: string;
                    content: string;
                }>, "many">, "many">;
            }, "strip", z.ZodTypeAny, {
                currentWorkingDirectory: string;
                fileTree: import("../util/file").FileTreeNode[];
                fileTokenScores: Record<string, Record<string, number>>;
                knowledgeFiles: Record<string, string>;
                gitChanges: {
                    diff: string;
                    status: string;
                    diffCached: string;
                    lastCommitMessages: string;
                };
                changesSinceLastChat: Record<string, string>;
                shellConfigFiles: Record<string, string>;
                systemInfo: {
                    platform: string;
                    shell: string;
                    nodeVersion: string;
                    arch: string;
                    homedir: string;
                    cpus: number;
                };
                fileVersions: {
                    path: string;
                    content: string;
                }[][];
            }, {
                currentWorkingDirectory: string;
                fileTree: import("../util/file").FileTreeNode[];
                fileTokenScores: Record<string, Record<string, number>>;
                knowledgeFiles: Record<string, string>;
                gitChanges: {
                    diff: string;
                    status: string;
                    diffCached: string;
                    lastCommitMessages: string;
                };
                changesSinceLastChat: Record<string, string>;
                shellConfigFiles: Record<string, string>;
                systemInfo: {
                    platform: string;
                    shell: string;
                    nodeVersion: string;
                    arch: string;
                    homedir: string;
                    cpus: number;
                };
                fileVersions: {
                    path: string;
                    content: string;
                }[][];
            }>;
            changesAlreadyApplied: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<["patch", "file"]>;
                filePath: z.ZodString;
                content: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }, {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }>, "many">;
            costMode: z.ZodDefault<z.ZodOptional<z.ZodEnum<["lite", "normal", "max"]>>>;
        }, "strip", z.ZodTypeAny, {
            type: "user-input";
            fingerprintId: string;
            userInputId: string;
            messages: {
                content: string | ({
                    type: "text";
                    text: string;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                } | {
                    type: "tool_use";
                    id: string;
                    name: string;
                    input: Record<string, any>;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                } | {
                    type: "tool_result";
                    tool_use_id: string;
                    content: string;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                })[];
                role: "user" | "assistant";
            }[];
            fileContext: {
                currentWorkingDirectory: string;
                fileTree: import("../util/file").FileTreeNode[];
                fileTokenScores: Record<string, Record<string, number>>;
                knowledgeFiles: Record<string, string>;
                gitChanges: {
                    diff: string;
                    status: string;
                    diffCached: string;
                    lastCommitMessages: string;
                };
                changesSinceLastChat: Record<string, string>;
                shellConfigFiles: Record<string, string>;
                systemInfo: {
                    platform: string;
                    shell: string;
                    nodeVersion: string;
                    arch: string;
                    homedir: string;
                    cpus: number;
                };
                fileVersions: {
                    path: string;
                    content: string;
                }[][];
            };
            changesAlreadyApplied: {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }[];
            costMode: "lite" | "normal" | "max";
            authToken?: string | undefined;
        }, {
            type: "user-input";
            fingerprintId: string;
            userInputId: string;
            messages: {
                content: string | ({
                    type: "text";
                    text: string;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                } | {
                    type: "tool_use";
                    id: string;
                    name: string;
                    input: Record<string, any>;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                } | {
                    type: "tool_result";
                    tool_use_id: string;
                    content: string;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                })[];
                role: "user" | "assistant";
            }[];
            fileContext: {
                currentWorkingDirectory: string;
                fileTree: import("../util/file").FileTreeNode[];
                fileTokenScores: Record<string, Record<string, number>>;
                knowledgeFiles: Record<string, string>;
                gitChanges: {
                    diff: string;
                    status: string;
                    diffCached: string;
                    lastCommitMessages: string;
                };
                changesSinceLastChat: Record<string, string>;
                shellConfigFiles: Record<string, string>;
                systemInfo: {
                    platform: string;
                    shell: string;
                    nodeVersion: string;
                    arch: string;
                    homedir: string;
                    cpus: number;
                };
                fileVersions: {
                    path: string;
                    content: string;
                }[][];
            };
            changesAlreadyApplied: {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }[];
            authToken?: string | undefined;
            costMode?: "lite" | "normal" | "max" | undefined;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"read-files-response">;
            files: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNull]>>;
        }, "strip", z.ZodTypeAny, {
            type: "read-files-response";
            files: Record<string, string | null>;
        }, {
            type: "read-files-response";
            files: Record<string, string | null>;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"init">;
            fingerprintId: z.ZodString;
            authToken: z.ZodOptional<z.ZodString>;
            fileContext: z.ZodObject<{
                currentWorkingDirectory: z.ZodString;
                fileTree: z.ZodArray<z.ZodType<import("../util/file").FileTreeNode, z.ZodTypeDef, import("../util/file").FileTreeNode>, "many">;
                fileTokenScores: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodNumber>>;
                knowledgeFiles: z.ZodRecord<z.ZodString, z.ZodString>;
                gitChanges: z.ZodObject<{
                    status: z.ZodString;
                    diff: z.ZodString;
                    diffCached: z.ZodString;
                    lastCommitMessages: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    diff: string;
                    status: string;
                    diffCached: string;
                    lastCommitMessages: string;
                }, {
                    diff: string;
                    status: string;
                    diffCached: string;
                    lastCommitMessages: string;
                }>;
                changesSinceLastChat: z.ZodRecord<z.ZodString, z.ZodString>;
                shellConfigFiles: z.ZodRecord<z.ZodString, z.ZodString>;
                systemInfo: z.ZodObject<{
                    platform: z.ZodString;
                    shell: z.ZodString;
                    nodeVersion: z.ZodString;
                    arch: z.ZodString;
                    homedir: z.ZodString;
                    cpus: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    platform: string;
                    shell: string;
                    nodeVersion: string;
                    arch: string;
                    homedir: string;
                    cpus: number;
                }, {
                    platform: string;
                    shell: string;
                    nodeVersion: string;
                    arch: string;
                    homedir: string;
                    cpus: number;
                }>;
                fileVersions: z.ZodArray<z.ZodArray<z.ZodObject<{
                    path: z.ZodString;
                    content: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    path: string;
                    content: string;
                }, {
                    path: string;
                    content: string;
                }>, "many">, "many">;
            }, "strip", z.ZodTypeAny, {
                currentWorkingDirectory: string;
                fileTree: import("../util/file").FileTreeNode[];
                fileTokenScores: Record<string, Record<string, number>>;
                knowledgeFiles: Record<string, string>;
                gitChanges: {
                    diff: string;
                    status: string;
                    diffCached: string;
                    lastCommitMessages: string;
                };
                changesSinceLastChat: Record<string, string>;
                shellConfigFiles: Record<string, string>;
                systemInfo: {
                    platform: string;
                    shell: string;
                    nodeVersion: string;
                    arch: string;
                    homedir: string;
                    cpus: number;
                };
                fileVersions: {
                    path: string;
                    content: string;
                }[][];
            }, {
                currentWorkingDirectory: string;
                fileTree: import("../util/file").FileTreeNode[];
                fileTokenScores: Record<string, Record<string, number>>;
                knowledgeFiles: Record<string, string>;
                gitChanges: {
                    diff: string;
                    status: string;
                    diffCached: string;
                    lastCommitMessages: string;
                };
                changesSinceLastChat: Record<string, string>;
                shellConfigFiles: Record<string, string>;
                systemInfo: {
                    platform: string;
                    shell: string;
                    nodeVersion: string;
                    arch: string;
                    homedir: string;
                    cpus: number;
                };
                fileVersions: {
                    path: string;
                    content: string;
                }[][];
            }>;
        }, "strip", z.ZodTypeAny, {
            type: "init";
            fingerprintId: string;
            fileContext: {
                currentWorkingDirectory: string;
                fileTree: import("../util/file").FileTreeNode[];
                fileTokenScores: Record<string, Record<string, number>>;
                knowledgeFiles: Record<string, string>;
                gitChanges: {
                    diff: string;
                    status: string;
                    diffCached: string;
                    lastCommitMessages: string;
                };
                changesSinceLastChat: Record<string, string>;
                shellConfigFiles: Record<string, string>;
                systemInfo: {
                    platform: string;
                    shell: string;
                    nodeVersion: string;
                    arch: string;
                    homedir: string;
                    cpus: number;
                };
                fileVersions: {
                    path: string;
                    content: string;
                }[][];
            };
            authToken?: string | undefined;
        }, {
            type: "init";
            fingerprintId: string;
            fileContext: {
                currentWorkingDirectory: string;
                fileTree: import("../util/file").FileTreeNode[];
                fileTokenScores: Record<string, Record<string, number>>;
                knowledgeFiles: Record<string, string>;
                gitChanges: {
                    diff: string;
                    status: string;
                    diffCached: string;
                    lastCommitMessages: string;
                };
                changesSinceLastChat: Record<string, string>;
                shellConfigFiles: Record<string, string>;
                systemInfo: {
                    platform: string;
                    shell: string;
                    nodeVersion: string;
                    arch: string;
                    homedir: string;
                    cpus: number;
                };
                fileVersions: {
                    path: string;
                    content: string;
                }[][];
            };
            authToken?: string | undefined;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"usage">;
            fingerprintId: z.ZodString;
            authToken: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "usage";
            fingerprintId: string;
            authToken?: string | undefined;
        }, {
            type: "usage";
            fingerprintId: string;
            authToken?: string | undefined;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"login-code-request">;
            fingerprintId: z.ZodString;
            referralCode: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "login-code-request";
            fingerprintId: string;
            referralCode?: string | undefined;
        }, {
            type: "login-code-request";
            fingerprintId: string;
            referralCode?: string | undefined;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"login-status-request">;
            fingerprintId: z.ZodString;
            fingerprintHash: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "login-status-request";
            fingerprintId: string;
            fingerprintHash: string;
        }, {
            type: "login-status-request";
            fingerprintId: string;
            fingerprintHash: string;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"clear-auth-token">;
            authToken: z.ZodString;
            fingerprintId: z.ZodString;
            userId: z.ZodString;
            fingerprintHash: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "clear-auth-token";
            fingerprintId: string;
            authToken: string;
            fingerprintHash: string;
            userId: string;
        }, {
            type: "clear-auth-token";
            fingerprintId: string;
            authToken: string;
            fingerprintHash: string;
            userId: string;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"generate-commit-message">;
            fingerprintId: z.ZodString;
            authToken: z.ZodOptional<z.ZodString>;
            stagedChanges: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "generate-commit-message";
            fingerprintId: string;
            stagedChanges: string;
            authToken?: string | undefined;
        }, {
            type: "generate-commit-message";
            fingerprintId: string;
            stagedChanges: string;
            authToken?: string | undefined;
        }>]>;
    }, "strip", z.ZodTypeAny, {
        type: "action";
        data: {
            type: "user-input";
            fingerprintId: string;
            userInputId: string;
            messages: {
                content: string | ({
                    type: "text";
                    text: string;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                } | {
                    type: "tool_use";
                    id: string;
                    name: string;
                    input: Record<string, any>;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                } | {
                    type: "tool_result";
                    tool_use_id: string;
                    content: string;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                })[];
                role: "user" | "assistant";
            }[];
            fileContext: {
                currentWorkingDirectory: string;
                fileTree: import("../util/file").FileTreeNode[];
                fileTokenScores: Record<string, Record<string, number>>;
                knowledgeFiles: Record<string, string>;
                gitChanges: {
                    diff: string;
                    status: string;
                    diffCached: string;
                    lastCommitMessages: string;
                };
                changesSinceLastChat: Record<string, string>;
                shellConfigFiles: Record<string, string>;
                systemInfo: {
                    platform: string;
                    shell: string;
                    nodeVersion: string;
                    arch: string;
                    homedir: string;
                    cpus: number;
                };
                fileVersions: {
                    path: string;
                    content: string;
                }[][];
            };
            changesAlreadyApplied: {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }[];
            costMode: "lite" | "normal" | "max";
            authToken?: string | undefined;
        } | {
            type: "read-files-response";
            files: Record<string, string | null>;
        } | {
            type: "init";
            fingerprintId: string;
            fileContext: {
                currentWorkingDirectory: string;
                fileTree: import("../util/file").FileTreeNode[];
                fileTokenScores: Record<string, Record<string, number>>;
                knowledgeFiles: Record<string, string>;
                gitChanges: {
                    diff: string;
                    status: string;
                    diffCached: string;
                    lastCommitMessages: string;
                };
                changesSinceLastChat: Record<string, string>;
                shellConfigFiles: Record<string, string>;
                systemInfo: {
                    platform: string;
                    shell: string;
                    nodeVersion: string;
                    arch: string;
                    homedir: string;
                    cpus: number;
                };
                fileVersions: {
                    path: string;
                    content: string;
                }[][];
            };
            authToken?: string | undefined;
        } | {
            type: "usage";
            fingerprintId: string;
            authToken?: string | undefined;
        } | {
            type: "login-code-request";
            fingerprintId: string;
            referralCode?: string | undefined;
        } | {
            type: "login-status-request";
            fingerprintId: string;
            fingerprintHash: string;
        } | {
            type: "clear-auth-token";
            fingerprintId: string;
            authToken: string;
            fingerprintHash: string;
            userId: string;
        } | {
            type: "generate-commit-message";
            fingerprintId: string;
            stagedChanges: string;
            authToken?: string | undefined;
        };
        txid: number;
    }, {
        type: "action";
        data: {
            type: "user-input";
            fingerprintId: string;
            userInputId: string;
            messages: {
                content: string | ({
                    type: "text";
                    text: string;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                } | {
                    type: "tool_use";
                    id: string;
                    name: string;
                    input: Record<string, any>;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                } | {
                    type: "tool_result";
                    tool_use_id: string;
                    content: string;
                    cache_control?: {
                        type: "ephemeral";
                    } | undefined;
                })[];
                role: "user" | "assistant";
            }[];
            fileContext: {
                currentWorkingDirectory: string;
                fileTree: import("../util/file").FileTreeNode[];
                fileTokenScores: Record<string, Record<string, number>>;
                knowledgeFiles: Record<string, string>;
                gitChanges: {
                    diff: string;
                    status: string;
                    diffCached: string;
                    lastCommitMessages: string;
                };
                changesSinceLastChat: Record<string, string>;
                shellConfigFiles: Record<string, string>;
                systemInfo: {
                    platform: string;
                    shell: string;
                    nodeVersion: string;
                    arch: string;
                    homedir: string;
                    cpus: number;
                };
                fileVersions: {
                    path: string;
                    content: string;
                }[][];
            };
            changesAlreadyApplied: {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }[];
            authToken?: string | undefined;
            costMode?: "lite" | "normal" | "max" | undefined;
        } | {
            type: "read-files-response";
            files: Record<string, string | null>;
        } | {
            type: "init";
            fingerprintId: string;
            fileContext: {
                currentWorkingDirectory: string;
                fileTree: import("../util/file").FileTreeNode[];
                fileTokenScores: Record<string, Record<string, number>>;
                knowledgeFiles: Record<string, string>;
                gitChanges: {
                    diff: string;
                    status: string;
                    diffCached: string;
                    lastCommitMessages: string;
                };
                changesSinceLastChat: Record<string, string>;
                shellConfigFiles: Record<string, string>;
                systemInfo: {
                    platform: string;
                    shell: string;
                    nodeVersion: string;
                    arch: string;
                    homedir: string;
                    cpus: number;
                };
                fileVersions: {
                    path: string;
                    content: string;
                }[][];
            };
            authToken?: string | undefined;
        } | {
            type: "usage";
            fingerprintId: string;
            authToken?: string | undefined;
        } | {
            type: "login-code-request";
            fingerprintId: string;
            referralCode?: string | undefined;
        } | {
            type: "login-status-request";
            fingerprintId: string;
            fingerprintHash: string;
        } | {
            type: "clear-auth-token";
            fingerprintId: string;
            authToken: string;
            fingerprintHash: string;
            userId: string;
        } | {
            type: "generate-commit-message";
            fingerprintId: string;
            stagedChanges: string;
            authToken?: string | undefined;
        };
        txid: number;
    }>;
};
export declare const CLIENT_MESSAGE_SCHEMA: z.ZodUnion<[z.ZodObject<{
    type: z.ZodLiteral<"identify">;
    txid: z.ZodNumber;
    clientSessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "identify";
    txid: number;
    clientSessionId: string;
}, {
    type: "identify";
    txid: number;
    clientSessionId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"subscribe">;
    txid: z.ZodNumber;
    topics: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    type: "subscribe";
    txid: number;
    topics: string[];
}, {
    type: "subscribe";
    txid: number;
    topics: string[];
}>, z.ZodObject<{
    type: z.ZodLiteral<"unsubscribe">;
    txid: z.ZodNumber;
    topics: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    type: "unsubscribe";
    txid: number;
    topics: string[];
}, {
    type: "unsubscribe";
    txid: number;
    topics: string[];
}>, z.ZodObject<{
    type: z.ZodLiteral<"ping">;
    txid: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "ping";
    txid: number;
}, {
    type: "ping";
    txid: number;
}>, z.ZodObject<{
    type: z.ZodLiteral<"action">;
    txid: z.ZodNumber;
    data: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        type: z.ZodLiteral<"user-input">;
        fingerprintId: z.ZodString;
        authToken: z.ZodOptional<z.ZodString>;
        userInputId: z.ZodString;
        messages: z.ZodArray<z.ZodObject<{
            role: z.ZodUnion<[z.ZodLiteral<"user">, z.ZodLiteral<"assistant">]>;
            content: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodUnion<[z.ZodObject<{
                type: z.ZodLiteral<"text">;
                text: z.ZodString;
                cache_control: z.ZodOptional<z.ZodObject<{
                    type: z.ZodLiteral<"ephemeral">;
                }, "strip", z.ZodTypeAny, {
                    type: "ephemeral";
                }, {
                    type: "ephemeral";
                }>>;
            }, "strip", z.ZodTypeAny, {
                type: "text";
                text: string;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            }, {
                type: "text";
                text: string;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            }>, z.ZodObject<{
                type: z.ZodLiteral<"tool_use">;
                id: z.ZodString;
                name: z.ZodString;
                input: z.ZodRecord<z.ZodString, z.ZodAny>;
                cache_control: z.ZodOptional<z.ZodObject<{
                    type: z.ZodLiteral<"ephemeral">;
                }, "strip", z.ZodTypeAny, {
                    type: "ephemeral";
                }, {
                    type: "ephemeral";
                }>>;
            }, "strip", z.ZodTypeAny, {
                type: "tool_use";
                id: string;
                name: string;
                input: Record<string, any>;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            }, {
                type: "tool_use";
                id: string;
                name: string;
                input: Record<string, any>;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            }>, z.ZodObject<{
                type: z.ZodLiteral<"tool_result">;
                tool_use_id: z.ZodString;
                content: z.ZodString;
                cache_control: z.ZodOptional<z.ZodObject<{
                    type: z.ZodLiteral<"ephemeral">;
                }, "strip", z.ZodTypeAny, {
                    type: "ephemeral";
                }, {
                    type: "ephemeral";
                }>>;
            }, "strip", z.ZodTypeAny, {
                type: "tool_result";
                tool_use_id: string;
                content: string;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            }, {
                type: "tool_result";
                tool_use_id: string;
                content: string;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            }>]>, "many">]>;
        }, "strip", z.ZodTypeAny, {
            content: string | ({
                type: "text";
                text: string;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            } | {
                type: "tool_use";
                id: string;
                name: string;
                input: Record<string, any>;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            } | {
                type: "tool_result";
                tool_use_id: string;
                content: string;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            })[];
            role: "user" | "assistant";
        }, {
            content: string | ({
                type: "text";
                text: string;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            } | {
                type: "tool_use";
                id: string;
                name: string;
                input: Record<string, any>;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            } | {
                type: "tool_result";
                tool_use_id: string;
                content: string;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            })[];
            role: "user" | "assistant";
        }>, "many">;
        fileContext: z.ZodObject<{
            currentWorkingDirectory: z.ZodString;
            fileTree: z.ZodArray<z.ZodType<import("../util/file").FileTreeNode, z.ZodTypeDef, import("../util/file").FileTreeNode>, "many">;
            fileTokenScores: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodNumber>>;
            knowledgeFiles: z.ZodRecord<z.ZodString, z.ZodString>;
            gitChanges: z.ZodObject<{
                status: z.ZodString;
                diff: z.ZodString;
                diffCached: z.ZodString;
                lastCommitMessages: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                diff: string;
                status: string;
                diffCached: string;
                lastCommitMessages: string;
            }, {
                diff: string;
                status: string;
                diffCached: string;
                lastCommitMessages: string;
            }>;
            changesSinceLastChat: z.ZodRecord<z.ZodString, z.ZodString>;
            shellConfigFiles: z.ZodRecord<z.ZodString, z.ZodString>;
            systemInfo: z.ZodObject<{
                platform: z.ZodString;
                shell: z.ZodString;
                nodeVersion: z.ZodString;
                arch: z.ZodString;
                homedir: z.ZodString;
                cpus: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                platform: string;
                shell: string;
                nodeVersion: string;
                arch: string;
                homedir: string;
                cpus: number;
            }, {
                platform: string;
                shell: string;
                nodeVersion: string;
                arch: string;
                homedir: string;
                cpus: number;
            }>;
            fileVersions: z.ZodArray<z.ZodArray<z.ZodObject<{
                path: z.ZodString;
                content: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                path: string;
                content: string;
            }, {
                path: string;
                content: string;
            }>, "many">, "many">;
        }, "strip", z.ZodTypeAny, {
            currentWorkingDirectory: string;
            fileTree: import("../util/file").FileTreeNode[];
            fileTokenScores: Record<string, Record<string, number>>;
            knowledgeFiles: Record<string, string>;
            gitChanges: {
                diff: string;
                status: string;
                diffCached: string;
                lastCommitMessages: string;
            };
            changesSinceLastChat: Record<string, string>;
            shellConfigFiles: Record<string, string>;
            systemInfo: {
                platform: string;
                shell: string;
                nodeVersion: string;
                arch: string;
                homedir: string;
                cpus: number;
            };
            fileVersions: {
                path: string;
                content: string;
            }[][];
        }, {
            currentWorkingDirectory: string;
            fileTree: import("../util/file").FileTreeNode[];
            fileTokenScores: Record<string, Record<string, number>>;
            knowledgeFiles: Record<string, string>;
            gitChanges: {
                diff: string;
                status: string;
                diffCached: string;
                lastCommitMessages: string;
            };
            changesSinceLastChat: Record<string, string>;
            shellConfigFiles: Record<string, string>;
            systemInfo: {
                platform: string;
                shell: string;
                nodeVersion: string;
                arch: string;
                homedir: string;
                cpus: number;
            };
            fileVersions: {
                path: string;
                content: string;
            }[][];
        }>;
        changesAlreadyApplied: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["patch", "file"]>;
            filePath: z.ZodString;
            content: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }, {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }>, "many">;
        costMode: z.ZodDefault<z.ZodOptional<z.ZodEnum<["lite", "normal", "max"]>>>;
    }, "strip", z.ZodTypeAny, {
        type: "user-input";
        fingerprintId: string;
        userInputId: string;
        messages: {
            content: string | ({
                type: "text";
                text: string;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            } | {
                type: "tool_use";
                id: string;
                name: string;
                input: Record<string, any>;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            } | {
                type: "tool_result";
                tool_use_id: string;
                content: string;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            })[];
            role: "user" | "assistant";
        }[];
        fileContext: {
            currentWorkingDirectory: string;
            fileTree: import("../util/file").FileTreeNode[];
            fileTokenScores: Record<string, Record<string, number>>;
            knowledgeFiles: Record<string, string>;
            gitChanges: {
                diff: string;
                status: string;
                diffCached: string;
                lastCommitMessages: string;
            };
            changesSinceLastChat: Record<string, string>;
            shellConfigFiles: Record<string, string>;
            systemInfo: {
                platform: string;
                shell: string;
                nodeVersion: string;
                arch: string;
                homedir: string;
                cpus: number;
            };
            fileVersions: {
                path: string;
                content: string;
            }[][];
        };
        changesAlreadyApplied: {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }[];
        costMode: "lite" | "normal" | "max";
        authToken?: string | undefined;
    }, {
        type: "user-input";
        fingerprintId: string;
        userInputId: string;
        messages: {
            content: string | ({
                type: "text";
                text: string;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            } | {
                type: "tool_use";
                id: string;
                name: string;
                input: Record<string, any>;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            } | {
                type: "tool_result";
                tool_use_id: string;
                content: string;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            })[];
            role: "user" | "assistant";
        }[];
        fileContext: {
            currentWorkingDirectory: string;
            fileTree: import("../util/file").FileTreeNode[];
            fileTokenScores: Record<string, Record<string, number>>;
            knowledgeFiles: Record<string, string>;
            gitChanges: {
                diff: string;
                status: string;
                diffCached: string;
                lastCommitMessages: string;
            };
            changesSinceLastChat: Record<string, string>;
            shellConfigFiles: Record<string, string>;
            systemInfo: {
                platform: string;
                shell: string;
                nodeVersion: string;
                arch: string;
                homedir: string;
                cpus: number;
            };
            fileVersions: {
                path: string;
                content: string;
            }[][];
        };
        changesAlreadyApplied: {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }[];
        authToken?: string | undefined;
        costMode?: "lite" | "normal" | "max" | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"read-files-response">;
        files: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNull]>>;
    }, "strip", z.ZodTypeAny, {
        type: "read-files-response";
        files: Record<string, string | null>;
    }, {
        type: "read-files-response";
        files: Record<string, string | null>;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"init">;
        fingerprintId: z.ZodString;
        authToken: z.ZodOptional<z.ZodString>;
        fileContext: z.ZodObject<{
            currentWorkingDirectory: z.ZodString;
            fileTree: z.ZodArray<z.ZodType<import("../util/file").FileTreeNode, z.ZodTypeDef, import("../util/file").FileTreeNode>, "many">;
            fileTokenScores: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodNumber>>;
            knowledgeFiles: z.ZodRecord<z.ZodString, z.ZodString>;
            gitChanges: z.ZodObject<{
                status: z.ZodString;
                diff: z.ZodString;
                diffCached: z.ZodString;
                lastCommitMessages: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                diff: string;
                status: string;
                diffCached: string;
                lastCommitMessages: string;
            }, {
                diff: string;
                status: string;
                diffCached: string;
                lastCommitMessages: string;
            }>;
            changesSinceLastChat: z.ZodRecord<z.ZodString, z.ZodString>;
            shellConfigFiles: z.ZodRecord<z.ZodString, z.ZodString>;
            systemInfo: z.ZodObject<{
                platform: z.ZodString;
                shell: z.ZodString;
                nodeVersion: z.ZodString;
                arch: z.ZodString;
                homedir: z.ZodString;
                cpus: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                platform: string;
                shell: string;
                nodeVersion: string;
                arch: string;
                homedir: string;
                cpus: number;
            }, {
                platform: string;
                shell: string;
                nodeVersion: string;
                arch: string;
                homedir: string;
                cpus: number;
            }>;
            fileVersions: z.ZodArray<z.ZodArray<z.ZodObject<{
                path: z.ZodString;
                content: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                path: string;
                content: string;
            }, {
                path: string;
                content: string;
            }>, "many">, "many">;
        }, "strip", z.ZodTypeAny, {
            currentWorkingDirectory: string;
            fileTree: import("../util/file").FileTreeNode[];
            fileTokenScores: Record<string, Record<string, number>>;
            knowledgeFiles: Record<string, string>;
            gitChanges: {
                diff: string;
                status: string;
                diffCached: string;
                lastCommitMessages: string;
            };
            changesSinceLastChat: Record<string, string>;
            shellConfigFiles: Record<string, string>;
            systemInfo: {
                platform: string;
                shell: string;
                nodeVersion: string;
                arch: string;
                homedir: string;
                cpus: number;
            };
            fileVersions: {
                path: string;
                content: string;
            }[][];
        }, {
            currentWorkingDirectory: string;
            fileTree: import("../util/file").FileTreeNode[];
            fileTokenScores: Record<string, Record<string, number>>;
            knowledgeFiles: Record<string, string>;
            gitChanges: {
                diff: string;
                status: string;
                diffCached: string;
                lastCommitMessages: string;
            };
            changesSinceLastChat: Record<string, string>;
            shellConfigFiles: Record<string, string>;
            systemInfo: {
                platform: string;
                shell: string;
                nodeVersion: string;
                arch: string;
                homedir: string;
                cpus: number;
            };
            fileVersions: {
                path: string;
                content: string;
            }[][];
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "init";
        fingerprintId: string;
        fileContext: {
            currentWorkingDirectory: string;
            fileTree: import("../util/file").FileTreeNode[];
            fileTokenScores: Record<string, Record<string, number>>;
            knowledgeFiles: Record<string, string>;
            gitChanges: {
                diff: string;
                status: string;
                diffCached: string;
                lastCommitMessages: string;
            };
            changesSinceLastChat: Record<string, string>;
            shellConfigFiles: Record<string, string>;
            systemInfo: {
                platform: string;
                shell: string;
                nodeVersion: string;
                arch: string;
                homedir: string;
                cpus: number;
            };
            fileVersions: {
                path: string;
                content: string;
            }[][];
        };
        authToken?: string | undefined;
    }, {
        type: "init";
        fingerprintId: string;
        fileContext: {
            currentWorkingDirectory: string;
            fileTree: import("../util/file").FileTreeNode[];
            fileTokenScores: Record<string, Record<string, number>>;
            knowledgeFiles: Record<string, string>;
            gitChanges: {
                diff: string;
                status: string;
                diffCached: string;
                lastCommitMessages: string;
            };
            changesSinceLastChat: Record<string, string>;
            shellConfigFiles: Record<string, string>;
            systemInfo: {
                platform: string;
                shell: string;
                nodeVersion: string;
                arch: string;
                homedir: string;
                cpus: number;
            };
            fileVersions: {
                path: string;
                content: string;
            }[][];
        };
        authToken?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"usage">;
        fingerprintId: z.ZodString;
        authToken: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "usage";
        fingerprintId: string;
        authToken?: string | undefined;
    }, {
        type: "usage";
        fingerprintId: string;
        authToken?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"login-code-request">;
        fingerprintId: z.ZodString;
        referralCode: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "login-code-request";
        fingerprintId: string;
        referralCode?: string | undefined;
    }, {
        type: "login-code-request";
        fingerprintId: string;
        referralCode?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"login-status-request">;
        fingerprintId: z.ZodString;
        fingerprintHash: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "login-status-request";
        fingerprintId: string;
        fingerprintHash: string;
    }, {
        type: "login-status-request";
        fingerprintId: string;
        fingerprintHash: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"clear-auth-token">;
        authToken: z.ZodString;
        fingerprintId: z.ZodString;
        userId: z.ZodString;
        fingerprintHash: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "clear-auth-token";
        fingerprintId: string;
        authToken: string;
        fingerprintHash: string;
        userId: string;
    }, {
        type: "clear-auth-token";
        fingerprintId: string;
        authToken: string;
        fingerprintHash: string;
        userId: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"generate-commit-message">;
        fingerprintId: z.ZodString;
        authToken: z.ZodOptional<z.ZodString>;
        stagedChanges: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "generate-commit-message";
        fingerprintId: string;
        stagedChanges: string;
        authToken?: string | undefined;
    }, {
        type: "generate-commit-message";
        fingerprintId: string;
        stagedChanges: string;
        authToken?: string | undefined;
    }>]>;
}, "strip", z.ZodTypeAny, {
    type: "action";
    data: {
        type: "user-input";
        fingerprintId: string;
        userInputId: string;
        messages: {
            content: string | ({
                type: "text";
                text: string;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            } | {
                type: "tool_use";
                id: string;
                name: string;
                input: Record<string, any>;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            } | {
                type: "tool_result";
                tool_use_id: string;
                content: string;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            })[];
            role: "user" | "assistant";
        }[];
        fileContext: {
            currentWorkingDirectory: string;
            fileTree: import("../util/file").FileTreeNode[];
            fileTokenScores: Record<string, Record<string, number>>;
            knowledgeFiles: Record<string, string>;
            gitChanges: {
                diff: string;
                status: string;
                diffCached: string;
                lastCommitMessages: string;
            };
            changesSinceLastChat: Record<string, string>;
            shellConfigFiles: Record<string, string>;
            systemInfo: {
                platform: string;
                shell: string;
                nodeVersion: string;
                arch: string;
                homedir: string;
                cpus: number;
            };
            fileVersions: {
                path: string;
                content: string;
            }[][];
        };
        changesAlreadyApplied: {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }[];
        costMode: "lite" | "normal" | "max";
        authToken?: string | undefined;
    } | {
        type: "read-files-response";
        files: Record<string, string | null>;
    } | {
        type: "init";
        fingerprintId: string;
        fileContext: {
            currentWorkingDirectory: string;
            fileTree: import("../util/file").FileTreeNode[];
            fileTokenScores: Record<string, Record<string, number>>;
            knowledgeFiles: Record<string, string>;
            gitChanges: {
                diff: string;
                status: string;
                diffCached: string;
                lastCommitMessages: string;
            };
            changesSinceLastChat: Record<string, string>;
            shellConfigFiles: Record<string, string>;
            systemInfo: {
                platform: string;
                shell: string;
                nodeVersion: string;
                arch: string;
                homedir: string;
                cpus: number;
            };
            fileVersions: {
                path: string;
                content: string;
            }[][];
        };
        authToken?: string | undefined;
    } | {
        type: "usage";
        fingerprintId: string;
        authToken?: string | undefined;
    } | {
        type: "login-code-request";
        fingerprintId: string;
        referralCode?: string | undefined;
    } | {
        type: "login-status-request";
        fingerprintId: string;
        fingerprintHash: string;
    } | {
        type: "clear-auth-token";
        fingerprintId: string;
        authToken: string;
        fingerprintHash: string;
        userId: string;
    } | {
        type: "generate-commit-message";
        fingerprintId: string;
        stagedChanges: string;
        authToken?: string | undefined;
    };
    txid: number;
}, {
    type: "action";
    data: {
        type: "user-input";
        fingerprintId: string;
        userInputId: string;
        messages: {
            content: string | ({
                type: "text";
                text: string;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            } | {
                type: "tool_use";
                id: string;
                name: string;
                input: Record<string, any>;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            } | {
                type: "tool_result";
                tool_use_id: string;
                content: string;
                cache_control?: {
                    type: "ephemeral";
                } | undefined;
            })[];
            role: "user" | "assistant";
        }[];
        fileContext: {
            currentWorkingDirectory: string;
            fileTree: import("../util/file").FileTreeNode[];
            fileTokenScores: Record<string, Record<string, number>>;
            knowledgeFiles: Record<string, string>;
            gitChanges: {
                diff: string;
                status: string;
                diffCached: string;
                lastCommitMessages: string;
            };
            changesSinceLastChat: Record<string, string>;
            shellConfigFiles: Record<string, string>;
            systemInfo: {
                platform: string;
                shell: string;
                nodeVersion: string;
                arch: string;
                homedir: string;
                cpus: number;
            };
            fileVersions: {
                path: string;
                content: string;
            }[][];
        };
        changesAlreadyApplied: {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }[];
        authToken?: string | undefined;
        costMode?: "lite" | "normal" | "max" | undefined;
    } | {
        type: "read-files-response";
        files: Record<string, string | null>;
    } | {
        type: "init";
        fingerprintId: string;
        fileContext: {
            currentWorkingDirectory: string;
            fileTree: import("../util/file").FileTreeNode[];
            fileTokenScores: Record<string, Record<string, number>>;
            knowledgeFiles: Record<string, string>;
            gitChanges: {
                diff: string;
                status: string;
                diffCached: string;
                lastCommitMessages: string;
            };
            changesSinceLastChat: Record<string, string>;
            shellConfigFiles: Record<string, string>;
            systemInfo: {
                platform: string;
                shell: string;
                nodeVersion: string;
                arch: string;
                homedir: string;
                cpus: number;
            };
            fileVersions: {
                path: string;
                content: string;
            }[][];
        };
        authToken?: string | undefined;
    } | {
        type: "usage";
        fingerprintId: string;
        authToken?: string | undefined;
    } | {
        type: "login-code-request";
        fingerprintId: string;
        referralCode?: string | undefined;
    } | {
        type: "login-status-request";
        fingerprintId: string;
        fingerprintHash: string;
    } | {
        type: "clear-auth-token";
        fingerprintId: string;
        authToken: string;
        fingerprintHash: string;
        userId: string;
    } | {
        type: "generate-commit-message";
        fingerprintId: string;
        stagedChanges: string;
        authToken?: string | undefined;
    };
    txid: number;
}>]>;
export type ClientMessageType = keyof typeof CLIENT_MESSAGE_SCHEMAS;
export type ClientMessage<T extends ClientMessageType = ClientMessageType> = z.infer<(typeof CLIENT_MESSAGE_SCHEMAS)[T]>;
export declare const SERVER_MESSAGE_SCHEMAS: {
    ack: z.ZodObject<{
        type: z.ZodLiteral<"ack">;
        txid: z.ZodOptional<z.ZodNumber>;
        success: z.ZodBoolean;
        error: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "ack";
        success: boolean;
        txid?: number | undefined;
        error?: string | undefined;
    }, {
        type: "ack";
        success: boolean;
        txid?: number | undefined;
        error?: string | undefined;
    }>;
    action: z.ZodObject<{
        type: z.ZodLiteral<"action">;
        data: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
            type: z.ZodLiteral<"response-chunk">;
            userInputId: z.ZodString;
            chunk: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "response-chunk";
            userInputId: string;
            chunk: string;
        }, {
            type: "response-chunk";
            userInputId: string;
            chunk: string;
        }>, z.ZodObject<z.objectUtil.extendShape<{
            type: z.ZodLiteral<"response-complete">;
            userInputId: z.ZodString;
            response: z.ZodString;
            changes: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<["patch", "file"]>;
                filePath: z.ZodString;
                content: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }, {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }>, "many">;
            changesAlreadyApplied: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<["patch", "file"]>;
                filePath: z.ZodString;
                content: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }, {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }>, "many">;
            addedFileVersions: z.ZodArray<z.ZodObject<{
                path: z.ZodString;
                content: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                path: string;
                content: string;
            }, {
                path: string;
                content: string;
            }>, "many">;
            resetFileVersions: z.ZodBoolean;
        }, {
            usage: z.ZodOptional<z.ZodNumber>;
            limit: z.ZodOptional<z.ZodNumber>;
            referralLink: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            subscription_active: z.ZodOptional<z.ZodBoolean>;
            next_quota_reset: z.ZodOptional<z.ZodDate>;
            session_credits_used: z.ZodOptional<z.ZodNumber>;
        }>, "strip", z.ZodTypeAny, {
            type: "response-complete";
            userInputId: string;
            changesAlreadyApplied: {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }[];
            response: string;
            changes: {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }[];
            addedFileVersions: {
                path: string;
                content: string;
            }[];
            resetFileVersions: boolean;
            usage?: number | undefined;
            limit?: number | undefined;
            referralLink?: string | undefined;
            subscription_active?: boolean | undefined;
            next_quota_reset?: Date | undefined;
            session_credits_used?: number | undefined;
        }, {
            type: "response-complete";
            userInputId: string;
            changesAlreadyApplied: {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }[];
            response: string;
            changes: {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }[];
            addedFileVersions: {
                path: string;
                content: string;
            }[];
            resetFileVersions: boolean;
            usage?: number | undefined;
            limit?: number | undefined;
            referralLink?: string | undefined;
            subscription_active?: boolean | undefined;
            next_quota_reset?: Date | undefined;
            session_credits_used?: number | undefined;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"read-files">;
            filePaths: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            type: "read-files";
            filePaths: string[];
        }, {
            type: "read-files";
            filePaths: string[];
        }>, z.ZodObject<{
            type: z.ZodLiteral<"tool-call">;
            userInputId: z.ZodString;
            response: z.ZodString;
            data: z.ZodObject<{
                name: z.ZodString;
                id: z.ZodString;
                input: z.ZodRecord<z.ZodString, z.ZodAny>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                input: Record<string, any>;
            }, {
                id: string;
                name: string;
                input: Record<string, any>;
            }>;
            changes: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<["patch", "file"]>;
                filePath: z.ZodString;
                content: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }, {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }>, "many">;
            changesAlreadyApplied: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<["patch", "file"]>;
                filePath: z.ZodString;
                content: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }, {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }>, "many">;
            addedFileVersions: z.ZodArray<z.ZodObject<{
                path: z.ZodString;
                content: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                path: string;
                content: string;
            }, {
                path: string;
                content: string;
            }>, "many">;
            resetFileVersions: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            type: "tool-call";
            userInputId: string;
            changesAlreadyApplied: {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }[];
            response: string;
            changes: {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }[];
            addedFileVersions: {
                path: string;
                content: string;
            }[];
            resetFileVersions: boolean;
            data: {
                id: string;
                name: string;
                input: Record<string, any>;
            };
        }, {
            type: "tool-call";
            userInputId: string;
            changesAlreadyApplied: {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }[];
            response: string;
            changes: {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }[];
            addedFileVersions: {
                path: string;
                content: string;
            }[];
            resetFileVersions: boolean;
            data: {
                id: string;
                name: string;
                input: Record<string, any>;
            };
        }>, z.ZodObject<{
            type: z.ZodLiteral<"terminal-command-result">;
            userInputId: z.ZodString;
            result: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "terminal-command-result";
            userInputId: string;
            result: string;
        }, {
            type: "terminal-command-result";
            userInputId: string;
            result: string;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"npm-version-status">;
            isUpToDate: z.ZodBoolean;
            latestVersion: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "npm-version-status";
            isUpToDate: boolean;
            latestVersion: string;
        }, {
            type: "npm-version-status";
            isUpToDate: boolean;
            latestVersion: string;
        }>, z.ZodObject<z.objectUtil.extendShape<{
            type: z.ZodLiteral<"init-response">;
        }, Omit<{
            type: z.ZodLiteral<"usage-response">;
            usage: z.ZodNumber;
            limit: z.ZodNumber;
            referralLink: z.ZodOptional<z.ZodString>;
            subscription_active: z.ZodBoolean;
            next_quota_reset: z.ZodDate;
            session_credits_used: z.ZodNumber;
        }, "type">>, "strip", z.ZodTypeAny, {
            type: "init-response";
            usage: number;
            limit: number;
            subscription_active: boolean;
            next_quota_reset: Date;
            session_credits_used: number;
            referralLink?: string | undefined;
        }, {
            type: "init-response";
            usage: number;
            limit: number;
            subscription_active: boolean;
            next_quota_reset: Date;
            session_credits_used: number;
            referralLink?: string | undefined;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"auth-result">;
            user: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                email: z.ZodString;
                name: z.ZodNullable<z.ZodString>;
                authToken: z.ZodString;
                fingerprintId: z.ZodString;
                fingerprintHash: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string | null;
                fingerprintId: string;
                authToken: string;
                email: string;
                fingerprintHash: string;
            }, {
                id: string;
                name: string | null;
                fingerprintId: string;
                authToken: string;
                email: string;
                fingerprintHash: string;
            }>>;
            message: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "auth-result";
            message: string;
            user?: {
                id: string;
                name: string | null;
                fingerprintId: string;
                authToken: string;
                email: string;
                fingerprintHash: string;
            } | undefined;
        }, {
            type: "auth-result";
            message: string;
            user?: {
                id: string;
                name: string | null;
                fingerprintId: string;
                authToken: string;
                email: string;
                fingerprintHash: string;
            } | undefined;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"login-code-response">;
            fingerprintId: z.ZodString;
            fingerprintHash: z.ZodString;
            loginUrl: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "login-code-response";
            fingerprintId: string;
            fingerprintHash: string;
            loginUrl: string;
        }, {
            type: "login-code-response";
            fingerprintId: string;
            fingerprintHash: string;
            loginUrl: string;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"usage-response">;
            usage: z.ZodNumber;
            limit: z.ZodNumber;
            referralLink: z.ZodOptional<z.ZodString>;
            subscription_active: z.ZodBoolean;
            next_quota_reset: z.ZodDate;
            session_credits_used: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            type: "usage-response";
            usage: number;
            limit: number;
            subscription_active: boolean;
            next_quota_reset: Date;
            session_credits_used: number;
            referralLink?: string | undefined;
        }, {
            type: "usage-response";
            usage: number;
            limit: number;
            subscription_active: boolean;
            next_quota_reset: Date;
            session_credits_used: number;
            referralLink?: string | undefined;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"action-error">;
            message: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "action-error";
            message: string;
        }, {
            type: "action-error";
            message: string;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"commit-message-response">;
            commitMessage: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "commit-message-response";
            commitMessage: string;
        }, {
            type: "commit-message-response";
            commitMessage: string;
        }>]>;
    }, "strip", z.ZodTypeAny, {
        type: "action";
        data: {
            type: "usage-response";
            usage: number;
            limit: number;
            subscription_active: boolean;
            next_quota_reset: Date;
            session_credits_used: number;
            referralLink?: string | undefined;
        } | {
            type: "init-response";
            usage: number;
            limit: number;
            subscription_active: boolean;
            next_quota_reset: Date;
            session_credits_used: number;
            referralLink?: string | undefined;
        } | {
            type: "response-complete";
            userInputId: string;
            changesAlreadyApplied: {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }[];
            response: string;
            changes: {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }[];
            addedFileVersions: {
                path: string;
                content: string;
            }[];
            resetFileVersions: boolean;
            usage?: number | undefined;
            limit?: number | undefined;
            referralLink?: string | undefined;
            subscription_active?: boolean | undefined;
            next_quota_reset?: Date | undefined;
            session_credits_used?: number | undefined;
        } | {
            type: "response-chunk";
            userInputId: string;
            chunk: string;
        } | {
            type: "read-files";
            filePaths: string[];
        } | {
            type: "tool-call";
            userInputId: string;
            changesAlreadyApplied: {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }[];
            response: string;
            changes: {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }[];
            addedFileVersions: {
                path: string;
                content: string;
            }[];
            resetFileVersions: boolean;
            data: {
                id: string;
                name: string;
                input: Record<string, any>;
            };
        } | {
            type: "terminal-command-result";
            userInputId: string;
            result: string;
        } | {
            type: "npm-version-status";
            isUpToDate: boolean;
            latestVersion: string;
        } | {
            type: "auth-result";
            message: string;
            user?: {
                id: string;
                name: string | null;
                fingerprintId: string;
                authToken: string;
                email: string;
                fingerprintHash: string;
            } | undefined;
        } | {
            type: "login-code-response";
            fingerprintId: string;
            fingerprintHash: string;
            loginUrl: string;
        } | {
            type: "action-error";
            message: string;
        } | {
            type: "commit-message-response";
            commitMessage: string;
        };
    }, {
        type: "action";
        data: {
            type: "usage-response";
            usage: number;
            limit: number;
            subscription_active: boolean;
            next_quota_reset: Date;
            session_credits_used: number;
            referralLink?: string | undefined;
        } | {
            type: "init-response";
            usage: number;
            limit: number;
            subscription_active: boolean;
            next_quota_reset: Date;
            session_credits_used: number;
            referralLink?: string | undefined;
        } | {
            type: "response-complete";
            userInputId: string;
            changesAlreadyApplied: {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }[];
            response: string;
            changes: {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }[];
            addedFileVersions: {
                path: string;
                content: string;
            }[];
            resetFileVersions: boolean;
            usage?: number | undefined;
            limit?: number | undefined;
            referralLink?: string | undefined;
            subscription_active?: boolean | undefined;
            next_quota_reset?: Date | undefined;
            session_credits_used?: number | undefined;
        } | {
            type: "response-chunk";
            userInputId: string;
            chunk: string;
        } | {
            type: "read-files";
            filePaths: string[];
        } | {
            type: "tool-call";
            userInputId: string;
            changesAlreadyApplied: {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }[];
            response: string;
            changes: {
                type: "patch" | "file";
                content: string;
                filePath: string;
            }[];
            addedFileVersions: {
                path: string;
                content: string;
            }[];
            resetFileVersions: boolean;
            data: {
                id: string;
                name: string;
                input: Record<string, any>;
            };
        } | {
            type: "terminal-command-result";
            userInputId: string;
            result: string;
        } | {
            type: "npm-version-status";
            isUpToDate: boolean;
            latestVersion: string;
        } | {
            type: "auth-result";
            message: string;
            user?: {
                id: string;
                name: string | null;
                fingerprintId: string;
                authToken: string;
                email: string;
                fingerprintHash: string;
            } | undefined;
        } | {
            type: "login-code-response";
            fingerprintId: string;
            fingerprintHash: string;
            loginUrl: string;
        } | {
            type: "action-error";
            message: string;
        } | {
            type: "commit-message-response";
            commitMessage: string;
        };
    }>;
};
export declare const SERVER_MESSAGE_SCHEMA: z.ZodUnion<[z.ZodObject<{
    type: z.ZodLiteral<"ack">;
    txid: z.ZodOptional<z.ZodNumber>;
    success: z.ZodBoolean;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "ack";
    success: boolean;
    txid?: number | undefined;
    error?: string | undefined;
}, {
    type: "ack";
    success: boolean;
    txid?: number | undefined;
    error?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"action">;
    data: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        type: z.ZodLiteral<"response-chunk">;
        userInputId: z.ZodString;
        chunk: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "response-chunk";
        userInputId: string;
        chunk: string;
    }, {
        type: "response-chunk";
        userInputId: string;
        chunk: string;
    }>, z.ZodObject<z.objectUtil.extendShape<{
        type: z.ZodLiteral<"response-complete">;
        userInputId: z.ZodString;
        response: z.ZodString;
        changes: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["patch", "file"]>;
            filePath: z.ZodString;
            content: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }, {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }>, "many">;
        changesAlreadyApplied: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["patch", "file"]>;
            filePath: z.ZodString;
            content: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }, {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }>, "many">;
        addedFileVersions: z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            content: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path: string;
            content: string;
        }, {
            path: string;
            content: string;
        }>, "many">;
        resetFileVersions: z.ZodBoolean;
    }, {
        usage: z.ZodOptional<z.ZodNumber>;
        limit: z.ZodOptional<z.ZodNumber>;
        referralLink: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        subscription_active: z.ZodOptional<z.ZodBoolean>;
        next_quota_reset: z.ZodOptional<z.ZodDate>;
        session_credits_used: z.ZodOptional<z.ZodNumber>;
    }>, "strip", z.ZodTypeAny, {
        type: "response-complete";
        userInputId: string;
        changesAlreadyApplied: {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }[];
        response: string;
        changes: {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }[];
        addedFileVersions: {
            path: string;
            content: string;
        }[];
        resetFileVersions: boolean;
        usage?: number | undefined;
        limit?: number | undefined;
        referralLink?: string | undefined;
        subscription_active?: boolean | undefined;
        next_quota_reset?: Date | undefined;
        session_credits_used?: number | undefined;
    }, {
        type: "response-complete";
        userInputId: string;
        changesAlreadyApplied: {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }[];
        response: string;
        changes: {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }[];
        addedFileVersions: {
            path: string;
            content: string;
        }[];
        resetFileVersions: boolean;
        usage?: number | undefined;
        limit?: number | undefined;
        referralLink?: string | undefined;
        subscription_active?: boolean | undefined;
        next_quota_reset?: Date | undefined;
        session_credits_used?: number | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"read-files">;
        filePaths: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "read-files";
        filePaths: string[];
    }, {
        type: "read-files";
        filePaths: string[];
    }>, z.ZodObject<{
        type: z.ZodLiteral<"tool-call">;
        userInputId: z.ZodString;
        response: z.ZodString;
        data: z.ZodObject<{
            name: z.ZodString;
            id: z.ZodString;
            input: z.ZodRecord<z.ZodString, z.ZodAny>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            input: Record<string, any>;
        }, {
            id: string;
            name: string;
            input: Record<string, any>;
        }>;
        changes: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["patch", "file"]>;
            filePath: z.ZodString;
            content: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }, {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }>, "many">;
        changesAlreadyApplied: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["patch", "file"]>;
            filePath: z.ZodString;
            content: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }, {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }>, "many">;
        addedFileVersions: z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            content: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path: string;
            content: string;
        }, {
            path: string;
            content: string;
        }>, "many">;
        resetFileVersions: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        type: "tool-call";
        userInputId: string;
        changesAlreadyApplied: {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }[];
        response: string;
        changes: {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }[];
        addedFileVersions: {
            path: string;
            content: string;
        }[];
        resetFileVersions: boolean;
        data: {
            id: string;
            name: string;
            input: Record<string, any>;
        };
    }, {
        type: "tool-call";
        userInputId: string;
        changesAlreadyApplied: {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }[];
        response: string;
        changes: {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }[];
        addedFileVersions: {
            path: string;
            content: string;
        }[];
        resetFileVersions: boolean;
        data: {
            id: string;
            name: string;
            input: Record<string, any>;
        };
    }>, z.ZodObject<{
        type: z.ZodLiteral<"terminal-command-result">;
        userInputId: z.ZodString;
        result: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "terminal-command-result";
        userInputId: string;
        result: string;
    }, {
        type: "terminal-command-result";
        userInputId: string;
        result: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"npm-version-status">;
        isUpToDate: z.ZodBoolean;
        latestVersion: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "npm-version-status";
        isUpToDate: boolean;
        latestVersion: string;
    }, {
        type: "npm-version-status";
        isUpToDate: boolean;
        latestVersion: string;
    }>, z.ZodObject<z.objectUtil.extendShape<{
        type: z.ZodLiteral<"init-response">;
    }, Omit<{
        type: z.ZodLiteral<"usage-response">;
        usage: z.ZodNumber;
        limit: z.ZodNumber;
        referralLink: z.ZodOptional<z.ZodString>;
        subscription_active: z.ZodBoolean;
        next_quota_reset: z.ZodDate;
        session_credits_used: z.ZodNumber;
    }, "type">>, "strip", z.ZodTypeAny, {
        type: "init-response";
        usage: number;
        limit: number;
        subscription_active: boolean;
        next_quota_reset: Date;
        session_credits_used: number;
        referralLink?: string | undefined;
    }, {
        type: "init-response";
        usage: number;
        limit: number;
        subscription_active: boolean;
        next_quota_reset: Date;
        session_credits_used: number;
        referralLink?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"auth-result">;
        user: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            name: z.ZodNullable<z.ZodString>;
            authToken: z.ZodString;
            fingerprintId: z.ZodString;
            fingerprintHash: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string | null;
            fingerprintId: string;
            authToken: string;
            email: string;
            fingerprintHash: string;
        }, {
            id: string;
            name: string | null;
            fingerprintId: string;
            authToken: string;
            email: string;
            fingerprintHash: string;
        }>>;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "auth-result";
        message: string;
        user?: {
            id: string;
            name: string | null;
            fingerprintId: string;
            authToken: string;
            email: string;
            fingerprintHash: string;
        } | undefined;
    }, {
        type: "auth-result";
        message: string;
        user?: {
            id: string;
            name: string | null;
            fingerprintId: string;
            authToken: string;
            email: string;
            fingerprintHash: string;
        } | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"login-code-response">;
        fingerprintId: z.ZodString;
        fingerprintHash: z.ZodString;
        loginUrl: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "login-code-response";
        fingerprintId: string;
        fingerprintHash: string;
        loginUrl: string;
    }, {
        type: "login-code-response";
        fingerprintId: string;
        fingerprintHash: string;
        loginUrl: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"usage-response">;
        usage: z.ZodNumber;
        limit: z.ZodNumber;
        referralLink: z.ZodOptional<z.ZodString>;
        subscription_active: z.ZodBoolean;
        next_quota_reset: z.ZodDate;
        session_credits_used: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: "usage-response";
        usage: number;
        limit: number;
        subscription_active: boolean;
        next_quota_reset: Date;
        session_credits_used: number;
        referralLink?: string | undefined;
    }, {
        type: "usage-response";
        usage: number;
        limit: number;
        subscription_active: boolean;
        next_quota_reset: Date;
        session_credits_used: number;
        referralLink?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"action-error">;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "action-error";
        message: string;
    }, {
        type: "action-error";
        message: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"commit-message-response">;
        commitMessage: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "commit-message-response";
        commitMessage: string;
    }, {
        type: "commit-message-response";
        commitMessage: string;
    }>]>;
}, "strip", z.ZodTypeAny, {
    type: "action";
    data: {
        type: "usage-response";
        usage: number;
        limit: number;
        subscription_active: boolean;
        next_quota_reset: Date;
        session_credits_used: number;
        referralLink?: string | undefined;
    } | {
        type: "init-response";
        usage: number;
        limit: number;
        subscription_active: boolean;
        next_quota_reset: Date;
        session_credits_used: number;
        referralLink?: string | undefined;
    } | {
        type: "response-complete";
        userInputId: string;
        changesAlreadyApplied: {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }[];
        response: string;
        changes: {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }[];
        addedFileVersions: {
            path: string;
            content: string;
        }[];
        resetFileVersions: boolean;
        usage?: number | undefined;
        limit?: number | undefined;
        referralLink?: string | undefined;
        subscription_active?: boolean | undefined;
        next_quota_reset?: Date | undefined;
        session_credits_used?: number | undefined;
    } | {
        type: "response-chunk";
        userInputId: string;
        chunk: string;
    } | {
        type: "read-files";
        filePaths: string[];
    } | {
        type: "tool-call";
        userInputId: string;
        changesAlreadyApplied: {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }[];
        response: string;
        changes: {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }[];
        addedFileVersions: {
            path: string;
            content: string;
        }[];
        resetFileVersions: boolean;
        data: {
            id: string;
            name: string;
            input: Record<string, any>;
        };
    } | {
        type: "terminal-command-result";
        userInputId: string;
        result: string;
    } | {
        type: "npm-version-status";
        isUpToDate: boolean;
        latestVersion: string;
    } | {
        type: "auth-result";
        message: string;
        user?: {
            id: string;
            name: string | null;
            fingerprintId: string;
            authToken: string;
            email: string;
            fingerprintHash: string;
        } | undefined;
    } | {
        type: "login-code-response";
        fingerprintId: string;
        fingerprintHash: string;
        loginUrl: string;
    } | {
        type: "action-error";
        message: string;
    } | {
        type: "commit-message-response";
        commitMessage: string;
    };
}, {
    type: "action";
    data: {
        type: "usage-response";
        usage: number;
        limit: number;
        subscription_active: boolean;
        next_quota_reset: Date;
        session_credits_used: number;
        referralLink?: string | undefined;
    } | {
        type: "init-response";
        usage: number;
        limit: number;
        subscription_active: boolean;
        next_quota_reset: Date;
        session_credits_used: number;
        referralLink?: string | undefined;
    } | {
        type: "response-complete";
        userInputId: string;
        changesAlreadyApplied: {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }[];
        response: string;
        changes: {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }[];
        addedFileVersions: {
            path: string;
            content: string;
        }[];
        resetFileVersions: boolean;
        usage?: number | undefined;
        limit?: number | undefined;
        referralLink?: string | undefined;
        subscription_active?: boolean | undefined;
        next_quota_reset?: Date | undefined;
        session_credits_used?: number | undefined;
    } | {
        type: "response-chunk";
        userInputId: string;
        chunk: string;
    } | {
        type: "read-files";
        filePaths: string[];
    } | {
        type: "tool-call";
        userInputId: string;
        changesAlreadyApplied: {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }[];
        response: string;
        changes: {
            type: "patch" | "file";
            content: string;
            filePath: string;
        }[];
        addedFileVersions: {
            path: string;
            content: string;
        }[];
        resetFileVersions: boolean;
        data: {
            id: string;
            name: string;
            input: Record<string, any>;
        };
    } | {
        type: "terminal-command-result";
        userInputId: string;
        result: string;
    } | {
        type: "npm-version-status";
        isUpToDate: boolean;
        latestVersion: string;
    } | {
        type: "auth-result";
        message: string;
        user?: {
            id: string;
            name: string | null;
            fingerprintId: string;
            authToken: string;
            email: string;
            fingerprintHash: string;
        } | undefined;
    } | {
        type: "login-code-response";
        fingerprintId: string;
        fingerprintHash: string;
        loginUrl: string;
    } | {
        type: "action-error";
        message: string;
    } | {
        type: "commit-message-response";
        commitMessage: string;
    };
}>]>;
export type ServerMessageType = keyof typeof SERVER_MESSAGE_SCHEMAS;
export type ServerMessage<T extends ServerMessageType = ServerMessageType> = z.infer<(typeof SERVER_MESSAGE_SCHEMAS)[T]>;
