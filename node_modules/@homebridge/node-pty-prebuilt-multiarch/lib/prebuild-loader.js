"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prebuild_file_path_1 = require("./prebuild-file-path");
var pty;
try {
    pty = require(prebuild_file_path_1.ptyPath || '../build/Release/pty.node');
}
catch (outerError) {
    try {
        pty = require(prebuild_file_path_1.ptyPath ? '../build/Release/pty.node' : '../build/Debug/pty.node');
    }
    catch (innerError) {
        console.error('innerError', innerError);
        // Re-throw the exception from the Release require if the Debug require fails as well
        throw outerError;
    }
}
exports.default = pty;
//# sourceMappingURL=prebuild-loader.js.map