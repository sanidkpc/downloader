import fastify from "fastify";
import cors from "@fastify/cors";

const port = Number(process.env.PORT) || 3000;
const server = fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  },
});

server.register(cors, {
  origin: (origin, cb) => {
    const allowedOrigins = [
      "http://localhost:8080",
      "https://preview-cae05e89--glassy-vid-grabber.lovable.app",
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true); // allow request
    } else {
      cb(new Error("Not allowed by CORS"), false); // deny request
    }
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
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
