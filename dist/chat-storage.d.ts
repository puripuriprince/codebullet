import { Message } from './common/actions';
interface Chat {
    id: string;
    messages: Message[];
    fileVersions: FileVersion[];
    createdAt: string;
    updatedAt: string;
}
interface FileVersion {
    files: Record<string, string>;
}
export declare class ChatStorage {
    private baseDir;
    private currentChat;
    private currentVersionIndex;
    constructor();
    getCurrentChat(): Chat;
    addMessage(chat: Chat, message: Message): void;
    getCurrentVersion(): FileVersion | null;
    navigateVersion(direction: 'undo' | 'redo'): boolean;
    saveFilesChanged(filesChanged: string[]): string[];
    saveCurrentFileState(files: Record<string, string>): void;
    addNewFileState(files: Record<string, string>): void;
    private createChat;
    private saveChat;
    private generateChatId;
    private getFilePath;
}
export {};
