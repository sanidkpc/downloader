"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const fb_downloader_scrapper_1 = require("fb-downloader-scrapper");
const FBScrap_1 = require("../../utils/FBScrap");
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
            const meta = await (0, FBScrap_1.scrapeFacebookVideoInfo)(url);
            return reply.send(Object.assign(Object.assign({}, meta), { title: meta.title || result.title, quality: result.hd ? "HD" : "SD", videoUrl }));
        }
        catch (err) {
            request.log.error({ err }, "Error in /fb/video");
            return reply.status(500).send({ error: "Failed to fetch video info" });
        }
    });
}
