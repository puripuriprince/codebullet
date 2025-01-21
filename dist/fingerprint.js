"use strict";
// Modified from: https://github.com/andsmedeiros/hw-fingerprint
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFingerprint = calculateFingerprint;
const node_crypto_1 = require("node:crypto");
const node_os_1 = require("node:os");
const systeminformation_1 = require("systeminformation");
const getFingerprintInfo = async () => {
    const { manufacturer, model, serial, uuid } = await (0, systeminformation_1.system)();
    const { vendor, version: biosVersion, releaseDate } = await (0, systeminformation_1.bios)();
    const { manufacturer: boardManufacturer, model: boardModel, serial: boardSerial, } = await (0, systeminformation_1.baseboard)();
    const { manufacturer: cpuManufacturer, brand, speedMax, cores, physicalCores, socket, } = await (0, systeminformation_1.cpu)();
    const { platform, arch } = await (0, systeminformation_1.osInfo)();
    const salt = 6;
    return {
        EOL: node_os_1.EOL,
        endianness: (0, node_os_1.endianness)(),
        manufacturer,
        model,
        serial,
        uuid,
        vendor,
        biosVersion,
        releaseDate,
        boardManufacturer,
        boardModel,
        boardSerial,
        cpuManufacturer,
        brand,
        speedMax: speedMax.toFixed(2),
        salt,
        physicalCores,
        socket,
        platform,
        arch,
    };
};
async function calculateFingerprint() {
    const fingerprintInfo = await getFingerprintInfo();
    const fingerprintString = JSON.stringify(fingerprintInfo);
    const fingerprintHash = (0, node_crypto_1.createHash)('sha256').update(fingerprintString);
    return fingerprintHash.digest().toString('base64url');
}
//# sourceMappingURL=fingerprint.js.map