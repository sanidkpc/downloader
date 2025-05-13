import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getFbVideoInfo } from "fb-downloader-scrapper";
import { scrapeFacebookVideoInfo } from "../../utils/FBScrap";

interface InfoQuery {
  url?: string;
}

export default async function (fastify: FastifyInstance) {
  fastify.get(
    "/fb/video",
    async (
      request: FastifyRequest<{ Querystring: InfoQuery }>,
      reply: FastifyReply
    ) => {
      const { url } = request.query;
      if (!url) {
        return reply.status(400).send({ error: "Missing Facebook video URL" });
      }
      try {
        const result = await getFbVideoInfo(url);
        request.log.info({ result }, "Facebook video info fetched");

        const videoUrl = result?.hd || result?.sd;
        if (!videoUrl) {
          return reply.status(404).send({ error: "Video not found" });
        }

        const meta = await scrapeFacebookVideoInfo(url);

        return reply.send({
          ...meta,
          title: meta.title || result.title,
          quality: result.hd ? "HD" : "SD",
          videoUrl,
        });
      } catch (err) {
        request.log.error({ err }, "Error in /fb/video");
        return reply.status(500).send({ error: "Failed to fetch video info" });
      }
    }
  );
}
