export type ToolHandler = (input: any, id: string) => Promise<string>;
export declare const handleScrapeWebPage: ToolHandler;
export declare const handleRunTerminalCommand: (input: {
    command: string;
}, id: string, mode: "user" | "assistant") => Promise<{
    result: string;
    stdout: string;
}>;
export declare const handleCodeSearch: ToolHandler;
export declare const toolHandlers: Record<string, ToolHandler>;
