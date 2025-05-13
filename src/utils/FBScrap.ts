import puppeteer from "puppeteer";

export const scrapeFacebookVideoInfo = async (url: string) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    const info = await page.evaluate(() => {
      const getMeta = (prop: string) =>
        (document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement)
          ?.content || null;

      const video = document.querySelector("video");
      const duration = video?.duration || null;

      return {
        title: getMeta("og:title") || document.title || null,
        thumbnail: getMeta("og:image") || null,
        duration,
      };
    });

    await browser.close();
    return info;
  } catch (error) {
    await browser.close();
    throw new Error("Failed to fetch video info");
  }
};
