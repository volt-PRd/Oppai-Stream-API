import { Router, type IRouter } from "express";
import { searchAnime } from "../lib/scraper.js";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  const q = req.query["q"] as string;
  const page = parseInt((req.query["page"] as string) || "1", 10) || 1;

  if (!q || !q.trim()) {
    res.status(400).json({ error: "MISSING_PARAM", message: "Query parameter 'q' is required" });
    return;
  }

  try {
    const data = await searchAnime(q.trim(), page);
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "SCRAPE_ERROR", message });
  }
});

export default router;
