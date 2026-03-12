import { Router, type IRouter } from "express";
import type { Request } from "express";
import {
  getAnimeInfo,
  getEpisodeStreams,
  getAnimeEpisodes,
} from "../lib/scraper.js";

const router: IRouter = Router();

function getBaseUrl(req: Request): string {
  const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
  const host = (req.headers["x-forwarded-host"] as string) || req.headers["host"] || "localhost";
  return `${proto}://${host}`;
}

router.get("/:animeSlug", async (req, res) => {
  const { animeSlug } = req.params as { animeSlug: string };
  try {
    const data = await getAnimeInfo(animeSlug);
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("not found")) {
      res.status(404).json({ error: "NOT_FOUND", message: `Anime '${animeSlug}' not found` });
    } else {
      res.status(500).json({ error: "SCRAPE_ERROR", message });
    }
  }
});

router.get("/:animeSlug/episodes", async (req, res) => {
  const { animeSlug } = req.params as { animeSlug: string };
  try {
    const data = await getAnimeEpisodes(animeSlug);
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("not found")) {
      res.status(404).json({ error: "NOT_FOUND", message: `Anime '${animeSlug}' not found` });
    } else {
      res.status(500).json({ error: "SCRAPE_ERROR", message });
    }
  }
});

router.get("/:animeSlug/episode/:episodeNumber", async (req, res) => {
  const { animeSlug, episodeNumber } = req.params as {
    animeSlug: string;
    episodeNumber: string;
  };
  const epNum = parseInt(episodeNumber, 10);
  if (isNaN(epNum) || epNum < 1) {
    res
      .status(400)
      .json({ error: "INVALID_PARAM", message: "Episode number must be a positive integer" });
    return;
  }
  try {
    const data = await getEpisodeStreams(animeSlug, epNum);
    const baseUrl = getBaseUrl(req);

    const enrichedStreams = data.streams.map((stream) => ({
      ...stream,
      proxyUrl: `${baseUrl}/api/proxy/video?url=${encodeURIComponent(stream.url)}`,
      note: "Use proxyUrl for direct playback. Direct url requires Referer: https://oppai.stream/",
    }));

    res.json({ ...data, streams: enrichedStreams });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("not found")) {
      res
        .status(404)
        .json({ error: "NOT_FOUND", message: `Episode ${epNum} of '${animeSlug}' not found` });
    } else {
      res.status(500).json({ error: "SCRAPE_ERROR", message });
    }
  }
});

export default router;
