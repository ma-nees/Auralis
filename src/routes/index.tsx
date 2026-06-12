import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FiPlay, FiTrendingUp } from "react-icons/fi";
import { usePlayer } from "@/context/PlayerContext";
import { SongCard, SongRow } from "@/components/SongCard";
import { SectionHeader } from "@/components/Layout";
import {
  searchSoundCloud,
  fetchPlaylistTracks,
  fetchArtistTracks,
  searchYouTube,
} from "@/lib/music-search";
import type { Song } from "@/data/music";
import { SongRowSkeleton, CardGridSkeleton, ArtistGridSkeleton } from "@/components/SkeletonLoader";

const popularArtists = [
  {
    id: "artist-arijit-singh",
    full_name: "Arijit Singh",
    username: "Arijit Singh",
    query: "Arijit Singh",
    avatar_url: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&auto=format&fit=crop&q=70",
  },
  {
    id: "artist-sajjan-raj-vaidya",
    full_name: "Sajjan Raj Vaidya",
    username: "Sajjan Raj Vaidya",
    query: "Sajjan Raj Vaidya",
    avatar_url: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&auto=format&fit=crop&q=70",
  },
  {
    id: "artist-sujan-chapagain",
    full_name: "Sujan Chapagain",
    username: "Sujan Chapagain",
    query: "Sujan Chapagain",
    avatar_url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=70",
  },
  {
    id: "artist-sushant-kc",
    full_name: "Sushant KC",
    username: "Sushant KC",
    query: "Sushant KC",
    avatar_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=70",
  },
] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Auralis — Your Premium Music Stream" },
      {
        name: "description",
        content:
          "Stream trending songs, curated playlists and your favorite artists on Auralis, a beautiful mobile-first music player.",
      },
      { property: "og:title", content: "Auralis — Your Premium Music Stream" },
      {
        property: "og:description",
        content: "Stream trending songs, curated playlists and your favorite artists.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { playSong } = usePlayer();
  const [data, setData] = useState<{
    trending: Song[];
    playlists: any[];
    artists: any[];
    fresh: Song[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sub-view states for playlists/artists
  const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<any | null>(null);
  const [subViewTracks, setSubViewTracks] = useState<Song[]>([]);
  const [isFetchingSubView, setIsFetchingSubView] = useState(false);
  const [subViewError, setSubViewError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch dashboard music, with fresh tracks focused on Nepali songs.
        const [chillData, nepaliFreshTracks] = await Promise.all([
          searchSoundCloud("chillout"),
          searchYouTube("Nepali songs Sajjan Raj Vaidya Sujan Chapagain Sushant KC"),
        ]);
        
        if (!active) return;
        
        setData({
          trending: chillData.tracks.slice(0, 5),
          playlists: chillData.playlists.slice(0, 4),
          artists: [...popularArtists],
          fresh: nepaliFreshTracks.slice(0, 8),
        });
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        if (active) setIsLoading(false);
      }
    }
    
    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const handlePlaylistClick = async (playlist: any) => {
    setSelectedPlaylist(playlist);
    setSelectedArtist(null);
    setIsFetchingSubView(true);
    setSubViewError(null);
    setSubViewTracks([]);

    try {
      const tracks = await fetchPlaylistTracks(playlist.id);
      setSubViewTracks(tracks);
    } catch (err) {
      setSubViewError(err instanceof Error ? err.message : "Failed to load playlist tracks");
    } finally {
      setIsFetchingSubView(false);
    }
  };

  const handleArtistClick = async (artist: any) => {
    setSelectedArtist(artist);
    setSelectedPlaylist(null);
    setIsFetchingSubView(true);
    setSubViewError(null);
    setSubViewTracks([]);

    try {
      const tracks = artist.query
        ? await searchYouTube(`${artist.query} songs`)
        : await fetchArtistTracks(artist.id);
      setSubViewTracks(tracks);
    } catch (err) {
      setSubViewError(err instanceof Error ? err.message : "Failed to load artist tracks");
    } finally {
      setIsFetchingSubView(false);
    }
  };

  // Sub-view rendering
  if (selectedPlaylist) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedPlaylist(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <span>← Back to dashboard</span>
        </button>

        <div className="flex flex-col gap-6 md:flex-row md:items-end bg-card/30 p-6 rounded-3xl border border-border/50">
          <img
            src={selectedPlaylist.cover}
            alt={selectedPlaylist.title}
            className="h-40 w-40 rounded-2xl object-cover shadow-2xl"
          />
          <div className="space-y-2">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
              Playlist
            </span>
            <h2 className="text-2xl font-bold md:text-3xl">{selectedPlaylist.title}</h2>
            <p className="text-sm text-muted-foreground">{selectedPlaylist.description}</p>
            <p className="text-xs text-muted-foreground">
              By <span className="font-semibold text-foreground">{selectedPlaylist.artist}</span> • {selectedPlaylist.track_count} tracks
            </p>
          </div>
        </div>

        {isFetchingSubView && (
          <SongRowSkeleton count={5} />
        )}

        {subViewError && (
          <p className="text-sm text-destructive font-semibold">{subViewError}</p>
        )}

        {!isFetchingSubView && !subViewError && subViewTracks.length > 0 && (
          <div className="space-y-1">
            {subViewTracks.map((song, index) => (
              <SongRow key={song.id} song={song} index={index} queue={subViewTracks} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (selectedArtist) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedArtist(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <span>← Back to dashboard</span>
        </button>

        <div className="flex flex-col gap-6 md:flex-row md:items-center bg-card/30 p-6 rounded-3xl border border-border/50">
          <img
            src={selectedArtist.avatar_url}
            alt={selectedArtist.full_name}
            onError={(event) => {
              event.currentTarget.src = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=70";
            }}
            className="h-32 w-32 rounded-full object-cover shadow-2xl border-4 border-border"
          />
          <div className="space-y-2">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
              Artist
            </span>
            <h2 className="text-2xl font-bold md:text-3xl">{selectedArtist.full_name}</h2>
            {!selectedArtist.query && (
              <p className="text-sm text-muted-foreground">@{selectedArtist.username}</p>
            )}
          </div>
        </div>

        {isFetchingSubView && (
          <SongRowSkeleton count={5} />
        )}

        {subViewError && (
          <p className="text-sm text-destructive font-semibold">{subViewError}</p>
        )}

        {!isFetchingSubView && !subViewError && subViewTracks.length > 0 && (
          <div className="space-y-1">
            {subViewTracks.map((song, index) => (
              <SongRow key={song.id} song={song} index={index} queue={subViewTracks} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-card p-6 [background-image:var(--gradient-hero)] sm:p-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
          <FiPlay className="h-3 w-3 animate-pulse" /> Stream Live Music
        </span>
        <h1 className="mt-4 max-w-xl text-3xl font-extrabold leading-tight sm:text-5xl">
          Feel every beat with <span className="text-gradient">Auralis</span>
        </h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
          Millions of tracks, hand-crafted playlists and the artists you love — all in one premium,
          mobile-first player.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {data && data.trending.length > 0 && (
            <button
              onClick={() => playSong(data.trending[0], data.trending)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-105 cursor-pointer"
            >
              <FiPlay className="h-4 w-4" /> Play live trending
            </button>
          )}
          <Link
            to="/search"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            Explore library
          </Link>
        </div>
      </section>

      {isLoading && (
        <div className="space-y-8">
          <section>
            <SectionHeader title="Trending songs" />
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-40 shrink-0 p-3 bg-card/20 rounded-2xl animate-pulse sm:w-full border border-border/10">
                  <div className="aspect-square w-full rounded-xl bg-muted/50 mb-3" />
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted/50" />
                    <div className="h-3 w-1/2 rounded bg-muted/30" />
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section>
            <SectionHeader title="Made for you" />
            <CardGridSkeleton count={4} />
          </section>
          <section>
            <SectionHeader title="Popular artists" />
            <ArtistGridSkeleton count={4} />
          </section>
          <section>
            <SectionHeader title="Fresh tracks" />
            <SongRowSkeleton count={5} />
          </section>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive font-medium text-center py-8">{error}</p>
      )}

      {!isLoading && !error && data && (
        <>
          {/* Trending */}
          {data.trending.length > 0 && (
            <section>
              <SectionHeader title="Trending songs" />
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-5">
                {data.trending.map((song) => (
                  <SongCard key={song.id} song={song} queue={data.trending} />
                ))}
              </div>
            </section>
          )}

          {/* Playlists */}
          {data.playlists.length > 0 && (
            <section>
              <SectionHeader title="Made for you" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {data.playlists.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePlaylistClick(p)}
                    className="group rounded-2xl bg-card p-3 transition-all hover:-translate-y-1 hover:bg-secondary text-left cursor-pointer"
                  >
                    <img
                      src={p.cover}
                      alt={p.title}
                      loading="lazy"
                      className="aspect-square w-full rounded-xl object-cover"
                    />
                    <p className="mt-3 truncate text-sm font-semibold group-hover:text-primary transition-colors">
                      {p.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{p.track_count} songs</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Artists */}
          {data.artists.length > 0 && (
            <section>
              <SectionHeader title="Popular artists" />
              <div className="flex gap-5 overflow-x-auto pb-2 no-scrollbar sm:grid sm:grid-cols-4 sm:overflow-visible">
                {data.artists.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleArtistClick(a)}
                    className="w-28 shrink-0 text-center sm:w-full group cursor-pointer focus:outline-none"
                  >
                    <img
                      src={a.avatar_url}
                      alt={a.full_name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.src = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=70";
                      }}
                      className="mx-auto aspect-square w-full rounded-full object-cover ring-2 ring-transparent transition-all group-hover:ring-primary"
                    />
                    <p className="mt-3 truncate text-sm font-semibold group-hover:text-primary transition-colors">
                      {a.full_name}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Fresh tracks list */}
          {data.fresh.length > 0 && (
            <section>
              <SectionHeader title="Fresh tracks" />
              <div className="space-y-1">
                {data.fresh.map((song, i) => (
                  <SongRow key={song.id} song={song} index={i} queue={data.fresh} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
