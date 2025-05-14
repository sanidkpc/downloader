"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const getFbVideoInfo_1 = require("../../utils/getFbVideoInfo");
// import { getFbVideoInfo } from "fb-downloader-scrapper";
// import fetch from "node-fetch";
// import { pipeline } from "stream/promises";
const promises_1 = require("node:fs/promises");
const node_os_1 = require("node:os");
const node_path_1 = require("node:path");
const node_crypto_1 = require("node:crypto");
const node_child_process_1 = require("node:child_process");
async function default_1(fastify) {
    fastify.get("/fb/video", async (request, reply) => {
        const { url } = request.query;
        if (!url) {
            return reply.status(400).send({ error: "Missing Facebook video URL" });
        }
        try {
            const result = await (0, getFbVideoInfo_1.getFbVideoInfo)(url);
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
    fastify.get("/fb/audio/download", async (request, reply) => {
        const { url } = request.query;
        if (!url) {
            return reply.status(400).send({ error: "Missing video URL" });
        }
        try {
            // Step 1: Fetch the video
            const response = await fetch(url);
            if (!response.ok || !response.body) {
                return reply.status(502).send({ error: "Failed to fetch video" });
            }
            const buffer = Buffer.from(await response.arrayBuffer());
            // Step 2: Write to a temp .mp4 file
            const tempInput = (0, node_path_1.join)((0, node_os_1.tmpdir)(), `${(0, node_crypto_1.randomUUID)()}.mp4`);
            const tempOutput = tempInput.replace(".mp4", ".mp3");
            await (0, promises_1.writeFile)(tempInput, buffer);
            // Step 3: Run ffmpeg to extract MP3 audio
            await new Promise((resolve, reject) => {
                const ffmpeg = (0, node_child_process_1.spawn)("ffmpeg", [
                    "-i",
                    tempInput,
                    "-vn",
                    "-acodec",
                    "libmp3lame",
                    "-ab",
                    "192k",
                    "-f",
                    "mp3",
                    tempOutput,
                ]);
                ffmpeg.on("close", (code) => {
                    code === 0
                        ? resolve()
                        : reject(new Error(`ffmpeg exited with code ${code}`));
                });
            });
            // Step 4: Read output file and respond
            const audioBuffer = await (0, promises_1.readFile)(tempOutput);
            reply
                .header("Content-Type", "audio/mpeg")
                .header("Content-Disposition", "attachment; filename=facebook-audio.mp3")
                .header("Content-Length", audioBuffer.length)
                .send(audioBuffer);
            // Step 5: Cleanup
            await (0, promises_1.unlink)(tempInput).catch(() => { });
            await (0, promises_1.unlink)(tempOutput).catch(() => { });
        }
        catch (err) {
            request.log.error({ err }, "Failed to process audio");
            return reply.status(500).send({ error: "Internal server error" });
        }
    });
}
