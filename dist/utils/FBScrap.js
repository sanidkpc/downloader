"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeFacebookVideoInfo = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const scrapeFacebookVideoInfo = async (url) => {
    const browser = await puppeteer_1.default.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
        const info = await page.evaluate(() => {
            const getMeta = (prop) => {
                var _a;
                return ((_a = document.querySelector(`meta[property="${prop}"]`)) === null || _a === void 0 ? void 0 : _a.content) || null;
            };
            const video = document.querySelector("video");
            const duration = (video === null || video === void 0 ? void 0 : video.duration) || null;
            return {
                title: getMeta("og:title") || document.title || null,
                thumbnail: getMeta("og:image") || null,
                duration,
            };
        });
        await browser.close();
        return info;
    }
    catch (error) {
        await browser.close();
        throw new Error("Failed to fetch video info");
    }
};
exports.scrapeFacebookVideoInfo = scrapeFacebookVideoInfo;
