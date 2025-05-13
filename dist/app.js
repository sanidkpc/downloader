"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const port = Number(process.env.PORT) || 3000;
const server = (0, fastify_1.default)({
    logger: {
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
            },
        },
    },
});
server.get("/ping", async (request, reply) => {
    request.log.info({ request });
    return "pong\n";
});
server.register(require("./routes/default"));
server.register(require("./routes/facebook"));
const start = async () => {
    try {
        await server.listen({ port: port || 3000, host: "0.0.0.0" });
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
