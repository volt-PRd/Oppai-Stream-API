import { Router, type IRouter } from "express";
import axios from "axios";
import type { IncomingMessage } from "http";

const router: IRouter = Router();

const CDN_ALLOWED_HOSTS = ["myspacecat.pictures"];

const PROXY_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer: "https://oppai.stream/",
  Origin: "https://oppai.stream",
};

router.get("/video", async (req, res) => {
  const rawUrl = req.query["url"] as string;

  if (!rawUrl) {
    res.status(400).json({ error: "MISSING_PARAM", message: "Query parameter 'url' is required" });
    return;
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(rawUrl);
  } catch {
    res.status(400).json({ error: "INVALID_URL", message: "Invalid URL provided" });
    return;
  }

  if (!CDN_ALLOWED_HOSTS.includes(targetUrl.hostname)) {
    res.status(403).json({
      error: "FORBIDDEN",
      message: `Only CDN URLs from ${CDN_ALLOWED_HOSTS.join(", ")} are allowed`,
    });
    return;
  }

  const rangeHeader = req.headers["range"];

  try {
    const upstream = await axios.get(rawUrl, {
      headers: {
        ...PROXY_HEADERS,
        ...(rangeHeader ? { Range: rangeHeader } : {}),
      },
      responseType: "stream",
      timeout: 30000,
      validateStatus: (s) => s < 500,
    });

    const statusCode = upstream.status;
    const upstreamHeaders = upstream.headers as Record<string, string>;

    const passHeaders = [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
      "last-modified",
      "etag",
      "cache-control",
    ];

    res.status(statusCode);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Range");
    res.setHeader("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");

    for (const h of passHeaders) {
      if (upstreamHeaders[h]) {
        res.setHeader(h, upstreamHeaders[h]);
      }
    }

    (upstream.data as IncomingMessage).pipe(res);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(502).json({ error: "PROXY_ERROR", message });
  }
});

export default router;
