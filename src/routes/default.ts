import { FastifyInstance } from "fastify";
import os from "os";

export default async function (fastify: FastifyInstance) {
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
        hostname: os.hostname(),
        arch: os.arch(),
        cpus: os.cpus().length,
        load: os.loadavg(),
        uptime: os.uptime(),
        version: os.version(),
      },
    };
  });
}
