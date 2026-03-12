import { Router, type IRouter } from "express";
import { getLatestEpisodes } from "../lib/scraper.js";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  const page = parseInt((req.query["page"] as string) || "1", 10) || 1;
  try {
    const data = await getLatestEpisodes(page);
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "SCRAPE_ERROR", message });
  }
});

export default router;
