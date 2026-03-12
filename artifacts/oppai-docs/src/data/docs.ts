export interface Parameter {
  name: string;
  type: string;
  in: string;
  required: boolean;
  description: string;
}

export interface EndpointDoc {
  id: string;
  method: string;
  path: string;
  title: string;
  description: string;
  parameters?: Parameter[];
  examples: {
    python: string;
    java: string;
    json: string;
  };
}

export interface SidebarCategory {
  label: string;
  items: { id: string; title: string }[];
}

export const sidebarCategories: SidebarCategory[] = [
  {
    label: "Introduction",
    items: [
      { id: "getting-started", title: "Getting Started" },
      { id: "quick-start", title: "Quick Start Guide" },
      { id: "base-url", title: "Base URL & Responses" },
    ],
  },
  {
    label: "Anime",
    items: [
      { id: "get-anime-info", title: "Get Anime Info" },
      { id: "get-episodes-list", title: "List All Episodes" },
    ],
  },
  {
    label: "Streaming",
    items: [
      { id: "get-episode-streams", title: "Get Episode Streams" },
      { id: "proxy-video", title: "Proxy Video (Direct Play)" },
    ],
  },
  {
    label: "Discovery",
    items: [
      { id: "search-anime", title: "Search Anime" },
      { id: "get-latest-episodes", title: "Latest Episodes" },
    ],
  },
  {
    label: "Utilities",
    items: [{ id: "health-check", title: "Health Check" }],
  },
];

export const apiDocs: EndpointDoc[] = [
  {
    id: "get-anime-info",
    method: "GET",
    path: "/api/anime/{animeSlug}",
    title: "Get Anime Info",
    description:
      "Returns metadata for a specific anime: title, synopsis, genres, episode count, and cover image. The slug is the URL identifier from oppai.stream (e.g. 'sister-breeder', 'eroriman').",
    parameters: [
      {
        name: "animeSlug",
        type: "string",
        in: "path",
        required: true,
        description: "Anime slug from oppai.stream (e.g. 'sister-breeder')",
      },
    ],
    examples: {
      python: `import requests

BASE_URL = "https://your-api.replit.app"

resp = requests.get(f"{BASE_URL}/api/anime/sister-breeder")
resp.raise_for_status()
data = resp.json()

print(data["title"])       # Sister Breeder
print(data["episodeCount"])  # 3
print(data["genres"])      # ['schoolgirl', 'bigboobs', ...]`,
      java: `import java.net.URI;
import java.net.http.*;

HttpClient client = HttpClient.newHttpClient();
HttpRequest req = HttpRequest.newBuilder()
    .uri(URI.create("https://your-api.replit.app/api/anime/sister-breeder"))
    .header("Accept", "application/json")
    .GET().build();

HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
System.out.println(resp.body());`,
      json: `{
  "slug": "sister-breeder",
  "title": "Sister Breeder",
  "synopsis": "...",
  "genres": ["schoolgirl", "bigboobs", "blondehair", "incest"],
  "episodeCount": 3,
  "folder": "Sister Breeder"
}`,
    },
  },
  {
    id: "get-episodes-list",
    method: "GET",
    path: "/api/anime/{animeSlug}/episodes",
    title: "List All Episodes",
    description:
      "Returns a list of all available episodes for an anime with their numbers and watch page URLs on oppai.stream.",
    parameters: [
      {
        name: "animeSlug",
        type: "string",
        in: "path",
        required: true,
        description: "Anime slug (e.g. 'sister-breeder')",
      },
    ],
    examples: {
      python: `import requests

BASE_URL = "https://your-api.replit.app"

resp = requests.get(f"{BASE_URL}/api/anime/sister-breeder/episodes")
data = resp.json()

print(f"Total: {data['episodeCount']} episodes")
for ep in data["episodes"]:
    print(f"  Ep {ep['number']}: {ep['url']}")`,
      java: `import java.net.URI;
import java.net.http.*;

HttpClient client = HttpClient.newHttpClient();
HttpRequest req = HttpRequest.newBuilder()
    .uri(URI.create("https://your-api.replit.app/api/anime/sister-breeder/episodes"))
    .GET().build();

HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
System.out.println(resp.body());`,
      json: `{
  "animeName": "Sister Breeder",
  "animeSlug": "sister-breeder",
  "episodeCount": 3,
  "episodes": [
    { "number": 1, "url": "https://oppai.stream/watch?e=Sister-Breeder-1" },
    { "number": 2, "url": "https://oppai.stream/watch?e=Sister-Breeder-2" },
    { "number": 3, "url": "https://oppai.stream/watch?e=Sister-Breeder-3" }
  ]
}`,
    },
  },
  {
    id: "get-episode-streams",
    method: "GET",
    path: "/api/anime/{animeSlug}/episode/{episodeNumber}",
    title: "Get Episode Streams",
    description:
      "Returns all available stream qualities for a specific episode (4K webm, 1080p mp4, 720p mp4) plus English subtitle URL. Each stream includes both 'url' (direct CDN — needs Referer header) and 'proxyUrl' (works in any browser/player, no extra setup needed).",
    parameters: [
      {
        name: "animeSlug",
        type: "string",
        in: "path",
        required: true,
        description: "Anime slug (e.g. 'sister-breeder')",
      },
      {
        name: "episodeNumber",
        type: "integer",
        in: "path",
        required: true,
        description: "Episode number, starts from 1",
      },
    ],
    examples: {
      python: `import requests

BASE_URL = "https://your-api.replit.app"

resp = requests.get(f"{BASE_URL}/api/anime/sister-breeder/episode/1")
data = resp.json()

for stream in data["streams"]:
    print(f"{stream['quality']} ({stream['type']})")
    # Always use proxyUrl — works everywhere
    print(f"  -> {stream['proxyUrl']}")

# Subtitles (.vtt)
for sub in data.get("subtitles", []):
    print(f"Subtitle: {sub['url']}")`,
      java: `import java.net.URI;
import java.net.http.*;

HttpClient client = HttpClient.newHttpClient();
HttpRequest req = HttpRequest.newBuilder()
    .uri(URI.create(
        "https://your-api.replit.app/api/anime/sister-breeder/episode/1"
    ))
    .GET().build();

HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
// Parse JSON and use streams[i].proxyUrl for playback
System.out.println(resp.body());`,
      json: `{
  "animeSlug": "sister-breeder",
  "animeName": "Sister Breeder",
  "episodeNumber": 1,
  "streams": [
    {
      "quality": "4K",
      "type": "webm",
      "url": "https://myspacecat.pictures/Sister Breeder/4k/E01.webm",
      "proxyUrl": "https://your-api.replit.app/api/proxy/video?url=...",
      "note": "Use proxyUrl for direct playback."
    },
    {
      "quality": "1080p",
      "type": "mp4",
      "url": "https://myspacecat.pictures/Sister Breeder/1080/E01.mp4",
      "proxyUrl": "https://your-api.replit.app/api/proxy/video?url=...",
      "note": "Use proxyUrl for direct playback."
    },
    {
      "quality": "720p",
      "type": "mp4",
      "url": "https://myspacecat.pictures/Sister Breeder/720/E01.mp4",
      "proxyUrl": "https://your-api.replit.app/api/proxy/video?url=...",
      "note": "Use proxyUrl for direct playback."
    }
  ],
  "subtitles": [
    {
      "language": "en",
      "url": "https://myspacecat.pictures/Sister Breeder/720/E01_SUB_1.vtt",
      "format": "vtt"
    }
  ]
}`,
    },
  },
  {
    id: "proxy-video",
    method: "GET",
    path: "/api/proxy/video",
    title: "Proxy Video (Direct Play)",
    description:
      "Streams a CDN video through the API server with the correct Referer header so it plays anywhere. The CDN (myspacecat.pictures) blocks direct access — if you open the raw URL in a browser or player you get 403 Forbidden. Use proxyUrl from the episode streams endpoint instead of constructing this URL yourself. Supports Range requests so seeking/skipping works.",
    parameters: [
      {
        name: "url",
        type: "string",
        in: "query",
        required: true,
        description: "Full encoded CDN URL (must be from myspacecat.pictures)",
      },
    ],
    examples: {
      python: `import requests

BASE_URL = "https://your-api.replit.app"

# Step 1: get stream URLs
ep = requests.get(f"{BASE_URL}/api/anime/sister-breeder/episode/1").json()

# Step 2: use proxyUrl — no extra headers needed
for s in ep["streams"]:
    print(f"{s['quality']}: {s['proxyUrl']}")

# Step 3 (optional): download the video
best = ep["streams"][0]  # highest quality first
video = requests.get(best["proxyUrl"], stream=True)
with open("episode.mp4", "wb") as f:
    for chunk in video.iter_content(chunk_size=8192):
        f.write(chunk)`,
      java: `import java.net.URI;
import java.net.http.*;

// The proxyUrl returned by /episode/{n} is ready to use.
// No extra headers needed — just open it directly.

String proxyUrl = "https://your-api.replit.app/api/proxy/video"
    + "?url=" + URLEncoder.encode(cdnUrl, StandardCharsets.UTF_8);

HttpClient client = HttpClient.newHttpClient();
HttpRequest req = HttpRequest.newBuilder()
    .uri(URI.create(proxyUrl))
    // Optional: add Range for seeking
    .header("Range", "bytes=0-")
    .GET().build();

HttpResponse<byte[]> resp = client.send(req, HttpResponse.BodyHandlers.ofByteArray());`,
      json: `// Successful full response
HTTP/1.1 200 OK
Content-Type: video/mp4
Accept-Ranges: bytes
Content-Length: 247832576
Access-Control-Allow-Origin: *

[binary stream...]

// Seeking (Range request)
Request:  Range: bytes=10485760-20971519
Response: HTTP/1.1 206 Partial Content
          Content-Range: bytes 10485760-20971519/247832576
          Content-Length: 10485760`,
    },
  },
  {
    id: "search-anime",
    method: "GET",
    path: "/api/search",
    title: "Search Anime",
    description:
      "Search for anime by name. Returns up to 50 results with slug, title, and genres. The slug in results is what you pass to /api/anime/{slug} for more details.",
    parameters: [
      {
        name: "q",
        type: "string",
        in: "query",
        required: true,
        description: "Search query string (e.g. 'sister breeder')",
      },
      {
        name: "limit",
        type: "integer",
        in: "query",
        required: false,
        description: "Max results (default 50)",
      },
      {
        name: "offset",
        type: "integer",
        in: "query",
        required: false,
        description: "Pagination offset (default 0)",
      },
    ],
    examples: {
      python: `import requests

BASE_URL = "https://your-api.replit.app"

resp = requests.get(f"{BASE_URL}/api/search", params={"q": "sister breeder"})
data = resp.json()

print(f"Found {len(data['results'])} results")
for anime in data["results"]:
    print(f"  {anime['title']} -> slug: {anime['slug']}")
    print(f"  Genres: {', '.join(anime['genres'][:3])}")`,
      java: `import java.net.URI;
import java.net.http.*;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

String query = URLEncoder.encode("sister breeder", StandardCharsets.UTF_8);
String url = "https://your-api.replit.app/api/search?q=" + query;

HttpClient client = HttpClient.newHttpClient();
HttpRequest req = HttpRequest.newBuilder()
    .uri(URI.create(url))
    .GET().build();

HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
System.out.println(resp.body());`,
      json: `{
  "query": "sister breeder",
  "total": 18,
  "results": [
    {
      "slug": "sister-breeder",
      "title": "Sister Breeder",
      "genres": ["schoolgirl", "bigboobs", "blondehair"],
      "folder": "Sister Breeder"
    },
    {
      "slug": "eroriman",
      "title": "Eroriman",
      "genres": ["blondehair", "bigboobs", "incest"],
      "folder": "Eroriman"
    }
  ]
}`,
    },
  },
  {
    id: "get-latest-episodes",
    method: "GET",
    path: "/api/latest",
    title: "Latest Episodes",
    description:
      "Returns the 20 most recently released episodes, sorted newest first. Useful for building a home feed or checking for updates.",
    parameters: [
      {
        name: "page",
        type: "integer",
        in: "query",
        required: false,
        description: "Page number for pagination (default 1)",
      },
    ],
    examples: {
      python: `import requests

BASE_URL = "https://your-api.replit.app"

resp = requests.get(f"{BASE_URL}/api/latest")
data = resp.json()

print(f"Page {data['page']} — {len(data['episodes'])} episodes")
for ep in data["episodes"]:
    print(f"  {ep['animeName']} Ep.{ep['episodeNumber']} ({ep['releasedAt']})")
    print(f"  Slug: {ep['animeSlug']}")`,
      java: `import java.net.URI;
import java.net.http.*;

HttpClient client = HttpClient.newHttpClient();
HttpRequest req = HttpRequest.newBuilder()
    .uri(URI.create("https://your-api.replit.app/api/latest"))
    .GET().build();

HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
System.out.println(resp.body());`,
      json: `{
  "page": 1,
  "episodes": [
    {
      "animeName": "Sister Breeder",
      "animeSlug": "sister-breeder",
      "episodeNumber": 3,
      "releasedAt": "4 days ago",
      "folder": "Sister Breeder"
    },
    {
      "animeName": "Seikon no Aria",
      "animeSlug": "seikon-no-aria",
      "episodeNumber": 2,
      "releasedAt": "2 weeks ago",
      "folder": "Seikon no Aria"
    }
  ]
}`,
    },
  },
  {
    id: "health-check",
    method: "GET",
    path: "/api/healthz",
    title: "Health Check",
    description: "Check if the API server is online. Useful for monitoring and uptime checks.",
    parameters: [],
    examples: {
      python: `import requests

resp = requests.get("https://your-api.replit.app/api/healthz")
data = resp.json()
print("Online!" if data["status"] == "ok" else "Down")`,
      java: `import java.net.URI;
import java.net.http.*;

HttpClient client = HttpClient.newHttpClient();
HttpRequest req = HttpRequest.newBuilder()
    .uri(URI.create("https://your-api.replit.app/api/healthz"))
    .GET().build();

HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
System.out.println(resp.statusCode()); // 200`,
      json: `{ "status": "ok" }`,
    },
  },
];
