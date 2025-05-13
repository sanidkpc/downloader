"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const os_1 = __importDefault(require("os"));
async function default_1(fastify) {
    fastify.get("/", async (request, reply) => {
        const uptime = process.uptime();
        const memoryUsage = process.memoryUsage();
        return {
            timestamp: new Date().toISOString(),
            uptime: `${Math.floor(uptime)}s`,
            pid: process.pid,
            platform: process.platform,
            version: fastify.version,
            memory: {
                rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
                heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
                heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            },
            system: {
                hostname: os_1.default.hostname(),
                arch: os_1.default.arch(),
                cpus: os_1.default.cpus().length,
                load: os_1.default.loadavg(),
                uptime: os_1.default.uptime(),
                version: os_1.default.version(),
            },
        };
    });
}
