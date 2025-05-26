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
    if (
      !origin || // allow server-to-server or non-browser requests
      origin === "http://localhost:8080" ||
      /^https:\/\/.*\.lovable\.app$/.test(origin) || // allow all subdomains of lovable.app
      /^https:\/\/.*\.web\.app$/.test(origin) // allow all subdomains of web.app
    ) {
      cb(null, true);
    } else {
      cb(new Error("Not allowed by CORS"), false);
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
