"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const project_files_1 = require("./project-files");
if (worker_threads_1.parentPort) {
    const parentPort = worker_threads_1.parentPort;
    parentPort.on('message', async ({ dir }) => {
        (0, project_files_1.setProjectRoot)(dir);
        const initFileContext = await (0, project_files_1.getProjectFileContext)(dir, {}, []);
        parentPort.postMessage(initFileContext);
    });
}
//# sourceMappingURL=worker-script-project-context.js.map