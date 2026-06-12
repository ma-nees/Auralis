import type { Song } from "@/data/music";

export interface SoundCloudPlaylist {
  id: number;
  title: string;
  description: string;
  track_count: number;
  cover: string;
  artist: string;
}

export interface SoundCloudArtist {
  id: number;
  username: string;
  full_name: string;
  avatar_url: string;
  followers_count: number;
}

export interface SoundCloudSearchResults {
  tracks: Song[];
  playlists: SoundCloudPlaylist[];
  artists: SoundCloudArtist[];
}

export async function searchSongs(query: string, signal?: AbortSignal): Promise<Song[]> {
  const res = await fetch(
    `/api/soundcloud/search/tracks?q=${encodeURIComponent(query)}`,
    { signal },
  );

  if (!res.ok) throw new Error("Search failed");

  const data = await res.json();

  if (!data.success || !data.tracks) {
    return [];
  }

  return data.tracks.map((track: any) => {
    const cover = track.artwork_url
      ? track.artwork_url.replace("-large.jpg", "-t500x500.jpg")
      : "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=60";

    return {
      id: `soundcloud-${track.id}`,
      title: track.title,
      artist: track.artist || "Unknown Artist",
      cover: cover,
      src: `/api/soundcloud/stream?id=${track.id}`,
      duration: Math.floor((track.duration_ms ?? 0) / 1000),
      plays: track.playback_count ? `${(track.playback_count / 1000000).toFixed(1)}M` : "Stream",
    };
  });
}

export async function searchSoundCloud(query: string, signal?: AbortSignal): Promise<SoundCloudSearchResults> {
  const res = await fetch(
    `/api/soundcloud/search?q=${encodeURIComponent(query)}`,
    { signal },
  );

  if (!res.ok) throw new Error("Search failed");

  return await res.json();
}

export async function fetchPlaylistTracks(playlistId: number): Promise<Song[]> {
  const res = await fetch(`/api/soundcloud/playlist?id=${playlistId}`);
  if (!res.ok) throw new Error("Failed to load playlist");
  const data = await res.json();
  if (!data.success || !data.playlist) throw new Error("Invalid playlist data");
  
  return (data.playlist.tracks || []).map((t: any) => {
    const cover = t.artwork_url
      ? t.artwork_url.replace("-large.jpg", "-t500x500.jpg")
      : "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=60";
    return {
      id: `soundcloud-${t.id}`,
      title: t.title,
      artist: t.artist || "Unknown Artist",
      cover: cover,
      src: `/api/soundcloud/stream?id=${t.id}`,
      duration: Math.floor((t.duration ?? 0) / 1000),
      plays: "Popular",
    };
  });
}

export async function fetchArtistTracks(artistId: number): Promise<Song[]> {
  const res = await fetch(`/api/soundcloud/user/tracks?id=${artistId}`);
  if (!res.ok) throw new Error("Failed to load artist tracks");
  const data = await res.json();
  if (!data.success || !data.tracks) throw new Error("Invalid artist tracks data");
  
  return (data.tracks || []).map((t: any) => {
    const cover = t.artwork_url
      ? t.artwork_url.replace("-large.jpg", "-t500x500.jpg")
      : "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=60";
    return {
      id: `soundcloud-${t.id}`,
      title: t.title,
      artist: t.artist || "Unknown Artist",
      cover: cover,
      src: `/api/soundcloud/stream?id=${t.id}`,
      duration: Math.floor((t.duration_ms ?? 0) / 1000),
      plays: "Popular",
    };
  });
}

export async function searchYouTube(query: string, signal?: AbortSignal): Promise<Song[]> {
  const res = await fetch(
    `/api/youtube/search?q=${encodeURIComponent(query)}`,
    { signal },
  );

  if (!res.ok) throw new Error("YouTube search failed");
  const data = await res.json();
  if (!data.success || !data.tracks) {
    return [];
  }
  return data.tracks;
}
