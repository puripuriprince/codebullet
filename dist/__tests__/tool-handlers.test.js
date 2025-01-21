"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tool_handlers_1 = require("../tool-handlers");
const terminal_1 = require("../utils/terminal");
// Set up test directory
beforeAll(() => {
    (0, terminal_1.resetPtyShell)(process.cwd());
});
describe('handleRunTerminalCommand', () => {
    afterEach(() => {
        // Clean up after each test
        (0, terminal_1.resetPtyShell)(process.cwd());
    });
    it('should preserve shell state between commands', async () => {
        // First command: Create a test variable
        const result1 = await (0, tool_handlers_1.handleRunTerminalCommand)({ command: 'TEST_VAR=hello' }, 'test-id', 'user');
        // Second command: Echo the test variable
        const result2 = await (0, tool_handlers_1.handleRunTerminalCommand)({ command: 'echo $TEST_VAR' }, 'test-id', 'user');
        expect(result2.stdout.trim()).toBe('hello');
    });
    it('should handle command timeout by restarting shell', async () => {
        // Start a command that will definitely timeout
        const longRunningCommand = (0, tool_handlers_1.handleRunTerminalCommand)({ command: 'sleep 15' }, // Longer than MAX_EXECUTION_TIME
        'test-id', 'assistant');
        const result = await longRunningCommand;
        // Verify the shell was restarted
        expect(result.result).toContain('Shell has been restarted');
        // Verify we can still run commands after restart
        const subsequentCommand = await (0, tool_handlers_1.handleRunTerminalCommand)({ command: 'echo "test"' }, 'test-id', 'assistant');
        expect(subsequentCommand.stdout).toContain('test');
    });
});
//# sourceMappingURL=tool-handlers.test.js.map