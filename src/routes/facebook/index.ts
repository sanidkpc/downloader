import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getFbVideoInfo } from "fb-downloader-scrapper";
// import fetch from "node-fetch";
// import { pipeline } from "stream/promises";

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
        return reply.send({
          ...result,
        });
      } catch (err) {
        request.log.error({ err }, "Error in /fb/video");
        return reply.status(500).send({ error: "Failed to fetch video info" });
      }
    }
  );

  // fastify.get(
  //   "/fb/video/download",
  //   async (
  //     request: FastifyRequest<{ Querystring: InfoQuery }>,
  //     reply: FastifyReply
  //   ) => {
  //     const { url } = request.query;
  //     if (!url) {
  //       return reply.status(400).send({ error: "Missing video URL" });
  //     }

  //     try {
  //       const headers: Record<string, string> = {};
  //       if (request.headers.range) {
  //         headers.Range = request.headers.range as string;
  //       }

  //       const fbResponse = await fetch(url, { headers, redirect: "follow" });

  //       if (!fbResponse.ok || !fbResponse.body) {
  //         return reply
  //           .status(502)
  //           .send({ error: "Failed to fetch video from Facebook" });
  //       }

  //       // Force file download with correct filename
  //       reply
  //         .code(fbResponse.status)
  //         .header(
  //           "Content-Disposition",
  //           'attachment; filename="facebook-video.mp4"'
  //         )
  //         .header(
  //           "Content-Type",
  //           fbResponse.headers.get("content-type") || "video/mp4"
  //         );

  //       const contentLength = fbResponse.headers.get("content-length");
  //       if (contentLength) {
  //         reply.header("Content-Length", contentLength);
  //       }

  //       // Pipe stream without using writeHead
  //       await pipeline(fbResponse.body as any, reply.raw);
  //     } catch (err) {
  //       console.error("Error in /download:", err);
  //       return reply.status(500).send({ error: "Internal server error" });
  //     }
  //   }
  // );

  fastify.get(
    "/fb/video/download",
    async (
      request: FastifyRequest<{ Querystring: InfoQuery }>,
      reply: FastifyReply
    ) => {
      const { url } = request.query;
      if (!url) {
        return reply.status(400).send({ error: "Missing video URL" });
      }

      try {
        const headers: Record<string, string> = {};
        if (request.headers.range) {
          headers.Range = request.headers.range as string;
        }

        const fbResponse = await fetch(url, { headers, redirect: "follow" });

        if (!fbResponse.ok || !fbResponse.body) {
          return reply
            .status(502)
            .send({ error: "Failed to fetch video from Facebook" });
        }

        // Important: Send headers BEFORE starting to stream the response
        reply
          .status(fbResponse.status)
          .header(
            "Content-Disposition",
            'attachment; filename="facebook-video.mp4"'
          )
          .header(
            "Content-Type",
            fbResponse.headers.get("content-type") || "video/mp4"
          );

        const contentLength = fbResponse.headers.get("content-length");
        if (contentLength) {
          reply.header("Content-Length", contentLength);
        }

        // Use Fastify's stream handling to properly respect headers
        return reply.send(fbResponse.body);
      } catch (err) {
        console.error("Error in /download:", err);
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );
}
