export declare const resetPtyShell: (dir: string) => void;
export declare const runTerminalCommand: (command: string, mode: "user" | "assistant") => Promise<{
    result: string;
    stdout: string;
}>;
