import fastify from "fastify";

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

server.get("/ping", async (request, reply) => {
  request.log.info({ request });
  return "pong\n";
});

server.register(require("./routes/default"));
server.register(require("./routes/facebook"));

const start = async () => {
  try {
    await server.listen({ port: 3000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
