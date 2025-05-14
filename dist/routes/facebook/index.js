"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const fb_downloader_scrapper_1 = require("fb-downloader-scrapper");
async function default_1(fastify) {
    fastify.get("/fb/video", async (request, reply) => {
        const { url } = request.query;
        if (!url) {
            return reply.status(400).send({ error: "Missing Facebook video URL" });
        }
        try {
            const result = await (0, fb_downloader_scrapper_1.getFbVideoInfo)(url);
            request.log.info({ result }, "Facebook video info fetched");
            const videoUrl = (result === null || result === void 0 ? void 0 : result.hd) || (result === null || result === void 0 ? void 0 : result.sd);
            if (!videoUrl) {
                return reply.status(404).send({ error: "Video not found" });
            }
            return reply.send(Object.assign({}, result));
        }
        catch (err) {
            request.log.error({ err }, "Error in /fb/video");
            return reply.status(500).send({ error: "Failed to fetch video info" });
        }
    });
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
    fastify.get("/fb/video/download", async (request, reply) => {
        const { url } = request.query;
        if (!url) {
            return reply.status(400).send({ error: "Missing video URL" });
        }
        try {
            const headers = {};
            if (request.headers.range) {
                headers.Range = request.headers.range;
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
                .header("Content-Disposition", 'attachment; filename="facebook-video.mp4"')
                .header("Content-Type", fbResponse.headers.get("content-type") || "video/mp4");
            const contentLength = fbResponse.headers.get("content-length");
            if (contentLength) {
                reply.header("Content-Length", contentLength);
            }
            // Use Fastify's stream handling to properly respect headers
            return reply.send(fbResponse.body);
        }
        catch (err) {
            console.error("Error in /download:", err);
            return reply.status(500).send({ error: "Internal server error" });
        }
    });
}
