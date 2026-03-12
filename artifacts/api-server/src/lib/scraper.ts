import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://oppai.stream";
const CDN_BASE = "https://myspacecat.pictures";
const RESULTS_API = `${BASE_URL}/actions/results.php`;

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: BASE_URL,
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

async function fetchHtml(url: string, params?: Record<string, string>): Promise<cheerio.CheerioAPI> {
  const response = await axios.get(url, {
    headers: HEADERS,
    params,
    timeout: 15000,
  });
  return cheerio.load(response.data as string);
}

export interface StreamQuality {
  quality: string;
  url: string;
  type: string;
}

export interface EpisodeStreams {
  animeSlug: string;
  animeName: string;
  episodeNumber: number;
  episodeTitle?: string;
  thumbnail?: string;
  streams: StreamQuality[];
  subtitles: { language: string; url: string }[];
}

export interface EpisodeSummary {
  number: number;
  title?: string;
  thumbnail?: string;
  url: string;
}

export interface AnimeInfo {
  slug: string;
  title: string;
  titleJapanese?: string;
  coverImage?: string;
  bannerImage?: string;
  synopsis?: string;
  genres: string[];
  status?: string;
  type?: string;
  studio?: string;
  releaseYear?: string;
  season?: string;
  rating?: string;
  episodeCount: number;
  episodes: EpisodeSummary[];
}

export interface SearchResult {
  slug: string;
  title: string;
  coverImage?: string;
  genres: string[];
  status?: string;
  type?: string;
  episodeCount?: number;
  url: string;
}

export interface LatestEpisodeEntry {
  animeSlug: string;
  animeName: string;
  episodeNumber: number;
  episodeTitle?: string;
  thumbnail?: string;
  coverImage?: string;
  releasedAt?: string;
  url: string;
}

function folderToSlug(folder: string): string {
  return folder.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function slugToSearch(slug: string): string {
  return slug.replace(/-/g, " ");
}

function padEp(ep: number): string {
  return String(ep).padStart(2, "0");
}

function buildWatchUrl(folder: string, ep: number): string {
  const eName = folder.replace(/\s+/g, "-") + "-" + ep;
  return `${BASE_URL}/watch?e=${encodeURIComponent(eName)}`;
}

function buildStreamUrls(folder: string, ep: number): StreamQuality[] {
  const padded = padEp(ep);
  const streams: StreamQuality[] = [
    {
      quality: "4K",
      url: `${CDN_BASE}/${folder}/4k/E${padded}.webm`,
      type: "webm",
    },
    {
      quality: "1080p",
      url: `${CDN_BASE}/${folder}/1080/E${padded}.mp4`,
      type: "mp4",
    },
    {
      quality: "720p",
      url: `${CDN_BASE}/${folder}/720/E${padded}.mp4`,
      type: "mp4",
    },
  ];
  return streams;
}

function buildSubtitleUrl(folder: string, ep: number): string {
  const padded = padEp(ep);
  return `${CDN_BASE}/${folder}/720/E${padded}_SUB_1.vtt`;
}

function parseEpisodeDivs(
  $: cheerio.CheerioAPI,
  folderFilter?: string
): {
  folder: string;
  ep: number;
  name: string;
  desc: string;
  tags: string;
  thumbnail: string;
  watchUrl: string;
  releasedAt?: string;
}[] {
  const results: ReturnType<typeof parseEpisodeDivs> = [];

  $(".in-grid.episode-shown").each((_, el) => {
    const div = $(el);
    const folder = div.attr("folder") || "";
    const epStr = div.attr("ep") || "0";
    const ep = parseInt(epStr, 10);
    const name = div.attr("name") || folder;
    const desc = div.attr("desc") || "";
    const tags = div.attr("tags") || "";
    const thumbnailEl = div.find("img.cover-img-in");
    const thumbnail =
      thumbnailEl.attr("src") ||
      thumbnailEl.attr("original") ||
      `${CDN_BASE}/${folder}/thumbnail_${ep}.png`;
    const href = div.find("a").first().attr("href") || "";
    const watchUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
    const releasedAt = div.find("h6.gray.extra-line").first().text().trim() || undefined;

    if (!folderFilter || folder.toLowerCase() === folderFilter.toLowerCase()) {
      results.push({ folder, ep, name, desc, tags, thumbnail, watchUrl, releasedAt });
    }
  });

  return results;
}

async function searchRaw(
  query: string,
  amount = 50,
  offset = 0
): Promise<ReturnType<typeof parseEpisodeDivs>> {
  const $ = await fetchHtml(RESULTS_API, {
    sc: "search",
    am: String(amount),
    of: String(offset),
    sts: "0",
    ibt: "0",
    t: query,
  });
  return parseEpisodeDivs($);
}

async function latestRaw(
  amount = 20,
  offset = 0
): Promise<ReturnType<typeof parseEpisodeDivs>> {
  const $ = await fetchHtml(RESULTS_API, {
    sc: "recent",
    am: String(amount),
    of: String(offset),
    sts: "0",
    ibt: "0",
  });
  return parseEpisodeDivs($);
}

export async function getAnimeInfo(animeSlug: string): Promise<AnimeInfo> {
  const searchQuery = slugToSearch(animeSlug);
  const rawResults = await searchRaw(searchQuery, 100);

  const matching = rawResults.filter(
    (r) => folderToSlug(r.folder) === animeSlug || r.folder.toLowerCase() === searchQuery.toLowerCase()
  );

  if (matching.length === 0) {
    const looseMatch = rawResults.find(
      (r) => r.folder.toLowerCase().includes(searchQuery.toLowerCase().split("-").join(" ").slice(0, 8))
    );
    if (!looseMatch) {
      throw new Error(`Anime '${animeSlug}' not found`);
    }
    const folder = looseMatch.folder;
    return buildAnimeInfo(folder, rawResults.filter((r) => r.folder === folder));
  }

  const folder = matching[0].folder;
  return buildAnimeInfo(folder, matching);
}

function buildAnimeInfo(
  folder: string,
  items: ReturnType<typeof parseEpisodeDivs>
): AnimeInfo {
  const first = items[0];
  const slug = folderToSlug(folder);
  const tags = first.tags.split(",").map((t) => t.trim()).filter(Boolean);

  const genres = tags.filter((t) => !["4k", "hd", "censored", "uncensored"].includes(t));

  const episodes: EpisodeSummary[] = items
    .sort((a, b) => a.ep - b.ep)
    .map((item) => ({
      number: item.ep,
      thumbnail: item.thumbnail,
      url: item.watchUrl,
    }));

  const coverImage = `${CDN_BASE}/${folder}/thumbnail_${episodes[0]?.number ?? 1}.png`;

  return {
    slug,
    title: first.name,
    coverImage,
    synopsis: first.desc || undefined,
    genres,
    episodeCount: episodes.length,
    episodes,
  };
}

export async function getEpisodeStreams(
  animeSlug: string,
  episodeNumber: number
): Promise<EpisodeStreams> {
  const searchQuery = slugToSearch(animeSlug);
  const rawResults = await searchRaw(searchQuery, 100);

  const matching = rawResults.filter(
    (r) => folderToSlug(r.folder) === animeSlug || r.folder.toLowerCase() === searchQuery.toLowerCase()
  );

  let folder: string;
  let animeName: string;

  if (matching.length === 0) {
    const fallback = rawResults[0];
    if (!fallback) throw new Error(`Anime '${animeSlug}' not found`);
    folder = fallback.folder;
    animeName = fallback.name;
  } else {
    folder = matching[0].folder;
    animeName = matching[0].name;
  }

  const thumbnail = `${CDN_BASE}/${folder}/thumbnail_${episodeNumber}.png`;
  const streams = buildStreamUrls(folder, episodeNumber);
  const subtitleUrl = buildSubtitleUrl(folder, episodeNumber);

  const subtitles = [{ language: "en", url: subtitleUrl }];

  return {
    animeSlug,
    animeName,
    episodeNumber,
    thumbnail,
    streams,
    subtitles,
  };
}

export async function searchAnime(
  query: string,
  page = 1
): Promise<{ query: string; page: number; results: SearchResult[]; hasNextPage: boolean }> {
  const offset = (page - 1) * 20;
  const rawResults = await searchRaw(query, 20, offset);

  const folderSeen = new Map<string, SearchResult>();

  for (const item of rawResults) {
    const slug = folderToSlug(item.folder);
    if (!folderSeen.has(item.folder)) {
      const tags = item.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const genres = tags.filter((t) => !["4k", "hd", "censored", "uncensored"].includes(t));

      folderSeen.set(item.folder, {
        slug,
        title: item.name,
        coverImage: `${CDN_BASE}/${item.folder}/thumbnail_1.png`,
        genres,
        url: `${BASE_URL}/search?t=${encodeURIComponent(item.name)}`,
      });
    }
  }

  const results = Array.from(folderSeen.values());
  const hasNextPage = rawResults.length >= 20;

  return { query, page, results, hasNextPage };
}

export async function getAnimeEpisodes(
  animeSlug: string
): Promise<{ animeSlug: string; animeName: string; episodeCount: number; episodes: EpisodeSummary[] }> {
  const info = await getAnimeInfo(animeSlug);
  return {
    animeSlug: info.slug,
    animeName: info.title,
    episodeCount: info.episodeCount,
    episodes: info.episodes,
  };
}

export async function getLatestEpisodes(
  page = 1
): Promise<{ page: number; episodes: LatestEpisodeEntry[]; hasNextPage: boolean }> {
  const amount = 20;
  const offset = (page - 1) * amount;
  const rawResults = await latestRaw(amount, offset);

  const episodes: LatestEpisodeEntry[] = rawResults.map((item) => ({
    animeSlug: folderToSlug(item.folder),
    animeName: item.name,
    episodeNumber: item.ep,
    thumbnail: item.thumbnail,
    coverImage: `${CDN_BASE}/${item.folder}/thumbnail_${item.ep}.png`,
    releasedAt: item.releasedAt,
    url: item.watchUrl,
  }));

  const hasNextPage = rawResults.length >= amount;

  return { page, episodes, hasNextPage };
}
