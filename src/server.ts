import "./lib/error-capture";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
// import yts from "yt-search";
// const { default: yts } = await import("yt-search");
type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

let CLIENT_ID: string | null = null;
let OAUTH_TOKEN: string | null = process.env.SOUNDCLOUD_OAUTH_TOKEN || null;
const BASE_URL = "https://api-mobi.soundcloud.com";

async function fetchClientId(): Promise<string> {
  try {
    const res = await fetch("https://soundcloud.com", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const text = await res.text();
    const patterns = [
      /client_id\s*:\s*"([a-zA-Z0-9]{32})"/,
      /client_id=([a-zA-Z0-9]{32})/,
      /"clientId"\s*:\s*"([a-zA-Z0-9]{32})"/,
      /client_id":"([a-zA-Z0-9]{32})"/,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        CLIENT_ID = match[1];
        return CLIENT_ID;
      }
    }
    const scriptUrls = text.match(/https:\/\/[^"]*\.js/g) || [];
    for (const scriptUrl of scriptUrls.slice(0, 5)) {
      try {
        const scriptRes = await fetch(scriptUrl);
        const scriptText = await scriptRes.text();
        for (const pattern of patterns) {
          const match = scriptText.match(pattern);
          if (match) {
            CLIENT_ID = match[1];
            return CLIENT_ID;
          }
        }
      } catch {
        continue;
      }
    }
  } catch {}
  CLIENT_ID = "KKzJxmw11tYpCs6T24P4uUYhqmjalG6M";
  return CLIENT_ID;
}

async function getClientId(): Promise<string> {
  if (!CLIENT_ID) await fetchClientId();
  return CLIENT_ID!;
}

async function scFetch(url: string, useOAuth: boolean = false): Promise<any> {
  const clientId = await getClientId();
  const headers: Record<string, string> = {
    Accept: "application/json, text/javascript, */*; q=0.1",
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  };
  if (useOAuth && OAUTH_TOKEN) headers["Authorization"] = `OAuth ${OAUTH_TOKEN}`;
  const sep = url.includes("?") ? "&" : "?";
  const finalUrl = useOAuth ? url : `${url}${sep}client_id=${clientId}`;
  let res = await fetch(finalUrl, { headers });
  if (res.status === 401 || res.status === 403) {
    await fetchClientId();
    const retryUrl = useOAuth ? url : `${url}${sep}client_id=${CLIENT_ID}`;
    res = await fetch(retryUrl, { headers });
  }
  return res.json();
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function searchSoundCloudAll(query: string, limit: string, offset: string): Promise<Response> {
  try {
    if (!query) {
      return Response.json({ success: false, error: 'Query parameter "q" is required' }, { status: 400 });
    }
    const data = await scFetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}&limit=100&offset=${offset}`);
    const collection = data.collection || [];
    
    const tracks = shuffleArray(
      collection
        .filter((item: any) => item.kind === "track")
        .map((t: any) => {
          const cover = t.artwork_url
            ? t.artwork_url.replace("-large.jpg", "-t500x500.jpg")
            : "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=60";
          return {
            id: `soundcloud-${t.id}`,
            title: t.title,
            artist: t.user?.username || "Unknown Artist",
            cover: cover,
            src: `/api/soundcloud/stream?id=${t.id}`,
            duration: Math.floor((t.duration ?? 0) / 1000),
            plays: t.playback_count ? `${(t.playback_count / 1000000).toFixed(1)}M` : "Stream",
          };
        })
    );

    const playlists = shuffleArray(
      collection
        .filter((item: any) => item.kind === "playlist")
        .map((p: any) => {
          const cover = p.artwork_url || (p.tracks?.[0]?.artwork_url)
            ? (p.artwork_url || p.tracks[0].artwork_url).replace("-large.jpg", "-t500x500.jpg")
            : "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=60";
          return {
            id: p.id,
            title: p.title,
            description: p.description || "",
            track_count: p.track_count || p.tracks?.length || 0,
            cover: cover,
            artist: p.user?.username || "Unknown Curator",
          };
        })
    );

    const artists = shuffleArray(
      collection
        .filter((item: any) => item.kind === "user")
        .map((u: any) => {
          return {
            id: u.id,
            username: u.username,
            full_name: u.full_name || u.username,
            avatar_url: u.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=60",
            followers_count: u.followers_count || 0,
          };
        })
    );

    return Response.json({
      success: true,
      query,
      tracks,
      playlists,
      artists,
    });
  } catch (error) {
    return Response.json({ success: false, error: "Failed to search" }, { status: 500 });
  }
}

async function searchSoundCloudTracks(query: string, limit: string, offset: string): Promise<Response> {
  try {
    if (!query) {
      return Response.json({ success: false, error: 'Query parameter "q" is required' }, { status: 400 });
    }
    const data = await scFetch(
      `${BASE_URL}/search/tracks?q=${encodeURIComponent(query)}&limit=100&offset=${offset}`
    );
    const tracks = shuffleArray(
      data.collection?.map((t: any) => ({
        id: t.id,
        title: t.title,
        artist: t.user?.username,
        duration_ms: t.duration,
        duration_min: (t.duration / 60000).toFixed(2),
        artwork_url: t.artwork_url,
        permalink_url: t.permalink_url,
        playback_count: t.playback_count,
        likes_count: t.likes_count,
        genre: t.genre,
        created_at: t.created_at,
      })) || []
    );
    return Response.json({ success: true, query, total: tracks.length, tracks });
  } catch (error) {
    return Response.json({ success: false, error: "Failed to search tracks" }, { status: 500 });
  }
}

async function getSoundCloudTrack(id: string): Promise<Response> {
  try {
    if (!id) return Response.json({ success: false, error: "ID is required" }, { status: 400 });
    const data = await scFetch(`${BASE_URL}/tracks/${id}`);
    return Response.json({
      success: true,
      track: {
        id: data.id,
        title: data.title,
        description: data.description,
        artist: { id: data.user?.id, username: data.user?.username, avatar_url: data.user?.avatar_url },
        duration_ms: data.duration,
        duration_min: (data.duration / 60000).toFixed(2),
        artwork_url: data.artwork_url,
        waveform_url: data.waveform_url,
        permalink_url: data.permalink_url,
        playback_count: data.playback_count,
        likes_count: data.likes_count,
        genre: data.genre,
        created_at: data.created_at,
      },
    });
  } catch (error) {
    return Response.json({ success: false, error: "Failed to get track" }, { status: 500 });
  }
}

async function streamSoundCloud(id: string): Promise<Response> {
  try {
    if (!id) return Response.json({ success: false, error: "ID is required" }, { status: 400 });
    const trackData = await scFetch(`${BASE_URL}/tracks/${id}`);
    if (!trackData?.media) {
      return Response.json({ success: false, error: "Track not found or not streamable" }, { status: 404 });
    }
    const transcodings = trackData.media.transcodings || [];
    const progressive = transcodings.find((t: any) => t.format?.protocol === "progressive");
    const hls = transcodings.find((t: any) => t.format?.protocol === "hls");
    const transcoding = progressive || hls;
    if (!transcoding) return Response.json({ success: false, error: "No stream available" }, { status: 404 });
    const streamData = await scFetch(transcoding.url);
    if (!streamData?.url) return Response.json({ success: false, error: "No stream URL available" }, { status: 404 });

    return new Response(null, {
      status: 302,
      headers: {
        Location: streamData.url,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return Response.json({ success: false, error: "Failed to get stream" }, { status: 500 });
  }
}

async function getSoundCloudUser(id: string): Promise<Response> {
  try {
    if (!id) return Response.json({ success: false, error: "ID is required" }, { status: 400 });
    const data = await scFetch(`${BASE_URL}/users/${id}`);
    return Response.json({
      success: true,
      user: {
        id: data.id,
        username: data.username,
        full_name: data.full_name,
        description: data.description,
        avatar_url: data.avatar_url,
        city: data.city,
        country_code: data.country_code,
        followers_count: data.followers_count,
        followings_count: data.followings_count,
        track_count: data.track_count,
        playlist_count: data.playlist_count,
        permalink_url: data.permalink_url,
        created_at: data.created_at,
      },
    });
  } catch (error) {
    return Response.json({ success: false, error: "Failed to get user" }, { status: 500 });
  }
}

async function getSoundCloudUserTracks(id: string, limit: string, offset: string): Promise<Response> {
  try {
    if (!id) return Response.json({ success: false, error: "ID is required" }, { status: 400 });
    const data = await scFetch(`${BASE_URL}/users/${id}/tracks?limit=${limit}&offset=${offset}`);
    const tracks =
      data.collection?.map((t: any) => ({
        id: t.id,
        title: t.title,
        duration_ms: t.duration,
        artwork_url: t.artwork_url,
        playback_count: t.playback_count,
        likes_count: t.likes_count,
        created_at: t.created_at,
      })) || [];
    return Response.json({ success: true, total: tracks.length, tracks });
  } catch (error) {
    return Response.json({ success: false, error: "Failed to get user tracks" }, { status: 500 });
  }
}

async function getSoundCloudPlaylist(id: string): Promise<Response> {
  try {
    if (!id) return Response.json({ success: false, error: "ID is required" }, { status: 400 });
    const data = await scFetch(`${BASE_URL}/playlists/${id}`);
    return Response.json({
      success: true,
      playlist: {
        id: data.id,
        title: data.title,
        description: data.description,
        artwork_url: data.artwork_url,
        user: { id: data.user?.id, username: data.user?.username },
        track_count: data.track_count,
        duration: data.duration,
        likes_count: data.likes_count,
        permalink_url: data.permalink_url,
        created_at: data.created_at,
        tracks:
          data.tracks?.map((t: any) => ({
            id: t.id,
            title: t.title,
            artist: t.user?.username,
            duration: t.duration,
            artwork_url: t.artwork_url,
          })) || [],
      },
    });
  } catch (error) {
    return Response.json({ success: false, error: "Failed to get playlist" }, { status: 500 });
  }
}

function getServerEnvValue(env: unknown, key: string) {
  if (env && typeof env === "object" && key in env) {
    const value = (env as Record<string, unknown>)[key];
    if (typeof value === "string") return value;
  }

  return process.env[key] || "";
}

function extractJsonObject(value: string) {
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  try {
    return JSON.parse(value.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function getBotResponse(request: Request, env: unknown): Promise<Response> {
  const botKey = getServerEnvValue(env, "BOT_KEY");
  const botApiUrl = getServerEnvValue(env, "BOT_API_URL") || "https://api.openai.com/v1/chat/completions";
  const botModel = getServerEnvValue(env, "BOT_MODEL") || "gpt-4o-mini";

  if (!botKey) {
    return Response.json(
      {
        success: false,
        error: "BOT_KEY is missing",
        reply: "Bot key is not configured yet.",
      },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const command = String(body.command || "").slice(0, 500);
    const currentSong = body.currentSong
      ? `${body.currentSong.title || ""} by ${body.currentSong.artist || ""}`.trim()
      : "nothing playing";

    const aiResponse = await fetch(botApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${botKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: botModel,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are Auralis, a music app voice assistant. Convert the user's natural language into JSON only. Valid actions: play, pause, resume, next, previous, like, volume, help. Use play with a query for song searches. Schema: {\"reply\":\"short friendly response\",\"action\":\"play|pause|resume|next|previous|like|volume|help\",\"query\":\"song or artist query\",\"volume\":0-100}.",
          },
          {
            role: "user",
            content: `Current song: ${currentSong}\nUser command: ${command}`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      return Response.json(
        {
          success: false,
          error: "Bot provider request failed",
          reply: "I could not reach the bot service. I will try the basic music command instead.",
        },
        { status: 502 },
      );
    }

    const data = await aiResponse.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const parsed = extractJsonObject(content);

    if (!parsed) {
      return Response.json({
        success: true,
        reply: content || "I understood. Let me try that.",
        action: "help",
      });
    }

    return Response.json({
      success: true,
      reply: String(parsed.reply || "I understood. Let me try that."),
      action: String(parsed.action || "help"),
      query: String(parsed.query || ""),
      volume: typeof parsed.volume === "number" ? parsed.volume : undefined,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Bot response failed",
        reply: "I could not process that with the bot service.",
      },
      { status: 500 },
    );
  }
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
function buildMusicSearchQuery(query: string): string {
  const q = query.toLowerCase();

  if (
    q.includes("hindi") ||
    q.includes("bollywood") ||
    q.includes("arijit") ||
    q.includes("jubin") ||
    q.includes("neha") ||
    q.includes("shreya") ||
    q.includes("atif")
  ) {
    return `${query} Hindi Bollywood song official audio -shorts`;
  }

  if (
    q.includes("nepali") ||
    q.includes("nepal") ||
    q.includes("sajjan") ||
    q.includes("sushant") ||
    q.includes("samir") ||
    q.includes("tribal rain") ||
    q.includes("bekcha") ||
    q.includes("nabin")
  ) {
    return `${query} Nepali song official audio -shorts`;
  }

  return `${query} Hindi Nepali Bollywood song official audio -shorts`;
}

async function searchYouTubeTracks(query: string): Promise<any[]> {
  try {
    const { default: yts } = await import("yt-search");
    const searchQuery = buildMusicSearchQuery(query);
    const r = await yts(searchQuery);

    const videos = r.videos || [];
    const tracks: any[] = [];

    for (const video of videos) {
      if (video.seconds > 0 && video.seconds < 60) {
        continue;
      }

      const title = video.title || "";
      const desc = video.description || "";
      const fullText = `${title} ${desc} ${video.author?.name || ""}`.toLowerCase();

      if (
        fullText.includes("shorts") ||
        fullText.includes("#shorts") ||
        fullText.includes("trailer") ||
        fullText.includes("reaction")
      ) {
        continue;
      }

      tracks.push({
        id: `
        
        -${video.videoId}`,
        title,
        artist: video.author?.name || "Unknown Channel",
        cover: video.image || video.thumbnail || "",
        src: `/api/youtube/stream?id=${video.videoId}`,
        duration: video.seconds || 0,
        plays: `${(video.views / 1000).toFixed(0)}K views`,
      });
    }

    return tracks;
  } catch (error) {
    console.error("YouTube search error:", error);
    return [];
  }
}
// async function searchYouTubeTracks(query: string): Promise<any[]> {
//   try {
//     const r = await yts(query + " -shorts");
//     const videos = r.videos || [];
//     const tracks: any[] = [];

//     for (const video of videos) {
//       if (video.seconds > 0 && video.seconds < 60) {
//         continue;
//       }

//       const title = video.title || "";
//       const desc = video.description || "";
//       if (
//         title.toLowerCase().includes("short") ||
//         desc.toLowerCase().includes("short")
//       ) {
//         continue;
//       }

//       tracks.push({
//         id: `youtube-${video.videoId}`,
//         title: title,
//         artist: video.author?.name || "Unknown Channel",
//         cover: video.image || video.thumbnail || "",
//         src: `/api/youtube/stream?id=${video.videoId}`,
//         duration: video.seconds || 0,
//         plays: `${(video.views / 1000).toFixed(0)}K views`,
//       });
//     }

//     return shuffleArray(tracks);
//   } catch (error) {
//     console.error("YouTube search error:", error);
//     return [];
//   }
// }

async function streamYouTube(id: string): Promise<Response> {
  try {
    if (!id) return Response.json({ success: false, error: "ID is required" }, { status: 400 });

    let streamUrl = "";

    try {
      const zenithUrl = `https://api.zenithapi.qzz.io/alldl?url=https://www.youtube.com/watch?v=${id}`;
      const res = await fetch(zenithUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.medias && Array.isArray(data.medias)) {
          const audioStreams = data.medias.filter(
            (m: any) => m.type === "audio" || m.is_audio === true
          );
          audioStreams.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));
          if (audioStreams.length > 0 && audioStreams[0].url) {
            streamUrl = audioStreams[0].url;
          }
        }
      }
    } catch (e) {
      console.error("Zenith API stream fetch failed, trying fallbacks:", e);
    }

    if (!streamUrl) {
      const cobaltInstances = [
        "https://cobalt.tools/api/json",
        "https://co.wuk.sh/api/json",
        "https://api.cobalt.tools/api/json"
      ];

      for (const instance of cobaltInstances) {
        try {
          const res = await fetch(instance, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            body: JSON.stringify({
              url: `https://www.youtube.com/watch?v=${id}`,
              isAudioOnly: true,
              aFormat: "mp3",
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.url) {
              streamUrl = data.url;
              break;
            }
          }
        } catch (e) {
        }
      }
    }

    if (!streamUrl) {
      const fallbackUrl = `https://tuberip.com/api/stream/audio/${id}`;
      return new Response(null, {
        status: 302,
        headers: {
          Location: fallbackUrl,
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: streamUrl,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return Response.json({ success: false, error: "Failed to get YouTube stream" }, { status: 500 });
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/api/bot/respond" && request.method === "POST") {
        return await getBotResponse(request, env);
      }

      if (url.pathname === "/api/youtube/search") {
        const query = url.searchParams.get("q") ?? "";
        const tracks = await searchYouTubeTracks(query);
        return Response.json({ success: true, tracks });
      }

      if (url.pathname === "/api/youtube/stream") {
        const id = url.searchParams.get("id") ?? "";
        return await streamYouTube(id);
      }

      if (url.pathname === "/api/soundcloud") {
        return Response.json({
          status: "SoundCloud API is running",
          client_id: (await getClientId())?.slice(0, 10) + "...",
          endpoints: {
            search: "GET /api/soundcloud/search?q=<query>&limit=<limit>",
            searchTracks: "GET /api/soundcloud/search/tracks?q=<query>",
            track: "GET /api/soundcloud/track?id=<id>",
            stream: "GET /api/soundcloud/stream?id=<id>",
            user: "GET /api/soundcloud/user?id=<id>",
            userTracks: "GET /api/soundcloud/user/tracks?id=<id>",
            playlist: "GET /api/soundcloud/playlist?id=<id>",
          },
        });
      }
      if (url.pathname === "/api/soundcloud/search") {
        return await searchSoundCloudAll(
          url.searchParams.get("q") ?? "",
          url.searchParams.get("limit") ?? "20",
          url.searchParams.get("offset") ?? "0"
        );
      }
      if (url.pathname === "/api/soundcloud/search/tracks") {
        return await searchSoundCloudTracks(
          url.searchParams.get("q") ?? "",
          url.searchParams.get("limit") ?? "20",
          url.searchParams.get("offset") ?? "0"
        );
      }
      if (url.pathname === "/api/soundcloud/track") {
        return await getSoundCloudTrack(url.searchParams.get("id") ?? "");
      }
      if (url.pathname === "/api/soundcloud/stream") {
        return await streamSoundCloud(url.searchParams.get("id") ?? "");
      }
      if (url.pathname === "/api/soundcloud/user") {
        return await getSoundCloudUser(url.searchParams.get("id") ?? "");
      }
      if (url.pathname === "/api/soundcloud/user/tracks") {
        return await getSoundCloudUserTracks(
          url.searchParams.get("id") ?? "",
          url.searchParams.get("limit") ?? "20",
          url.searchParams.get("offset") ?? "0"
        );
      }
      if (url.pathname === "/api/soundcloud/playlist") {
        return await getSoundCloudPlaylist(url.searchParams.get("id") ?? "");
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
