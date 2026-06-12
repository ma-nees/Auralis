import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { SectionHeader } from "@/components/Layout";
import { SongRow } from "@/components/SongCard";
import type { Song } from "@/data/music";
import {
  searchSoundCloud,
  fetchPlaylistTracks,
  fetchArtistTracks,
  searchYouTube,
} from "@/lib/music-search";
import { SongRowSkeleton } from "@/components/SkeletonLoader";
import type {
  SoundCloudSearchResults,
  SoundCloudPlaylist,
  SoundCloudArtist,
} from "@/lib/music-search";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search - Auralis" },
      {
        name: "description",
        content: "Search for songs, playlists, and artists.",
      },
      { property: "og:title", content: "Search - Auralis" },
      { property: "og:description", content: "Explore tracks, playlists, and artists on Auralis." },
    ],
  }),
  component: SearchPage,
});
const genres = [
  "Hindi songs",
  "Nepali songs",
  "Bollywood songs",
  "Arijit Singh",
  "Sajjan Raj Vaidya",
  "Sujan Chapagain",
];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function SearchPage() {
  const [query, setQuery] = useState("");
  const [combinedTracks, setCombinedTracks] = useState<Song[]>([]);
  const [results, setResults] = useState<SoundCloudSearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [ytPage, setYtPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [selectedPlaylist, setSelectedPlaylist] = useState<SoundCloudPlaylist | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<SoundCloudArtist | null>(null);
  const [subViewTracks, setSubViewTracks] = useState<Song[]>([]);
  const [isFetchingSubView, setIsFetchingSubView] = useState(false);
  const [subViewError, setSubViewError] = useState<string | null>(null);

  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const term = query.trim();

    if (!term) {
      setResults(null);
      setCombinedTracks([]);
      setError(null);
      setIsSearching(false);
      setSelectedPlaylist(null);
      setSelectedArtist(null);
      setSubViewTracks([]);
      setOffset(0);
      setYtPage(0);
      setHasMore(true);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      setSelectedPlaylist(null);
      setSelectedArtist(null);
      setSubViewTracks([]);
      setOffset(0);
      setYtPage(0);
      setHasMore(true);

      try {
        const [scData, ytData] = await Promise.all([
          searchSoundCloud(term, controller.signal).catch((err) => {
            console.error("SoundCloud search failed", err);
            return null;
          }),
          searchYouTube(term, controller.signal).catch((err) => {
            console.error("YouTube search failed", err);
            return [];
          }),
        ]);

        if (!controller.signal.aborted) {
          setResults(scData);
          const scTracks = scData?.tracks || [];
          const combined = [...scTracks, ...ytData];
          setCombinedTracks(shuffleArray(combined));
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setResults(null);
        setCombinedTracks([]);
        setError(err instanceof Error ? err.message : "Search failed");
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query]);

  const fetchNextPage = async () => {
    if (isSearching || isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    try {
      const nextOffset = offset + 100;
      const nextYtPage = ytPage + 1;
      const term = query.trim();

      const ytSuffixes = ["", " music", " audio", " lyrics", " live", " cover", " remix", " song", " album", " track"];
      const suffix = ytSuffixes[nextYtPage % ytSuffixes.length];

      const [scResponse, ytResponse] = await Promise.all([
        fetch(`/api/soundcloud/search?q=${encodeURIComponent(term)}&limit=100&offset=${nextOffset}`)
          .then((r) => r.json())
          .catch((err) => {
            console.error("SoundCloud pagination failed", err);
            return { success: false, tracks: [] };
          }),
        fetch(`/api/youtube/search?q=${encodeURIComponent(term + suffix)}`)
          .then((r) => r.json())
          .catch((err) => {
            console.error("YouTube pagination failed", err);
            return { success: false, tracks: [] };
          }),
      ]);

      const scTracks = scResponse?.success && scResponse?.tracks ? scResponse.tracks : [];
      const ytTracks = ytResponse?.success && ytResponse?.tracks ? ytResponse.tracks : [];

      const combinedNew = [...scTracks, ...ytTracks];

      if (combinedNew.length > 0) {
        const shuffledNew = shuffleArray(combinedNew);
        setCombinedTracks((prev) => [...prev, ...shuffledNew]);
        setOffset(nextOffset);
        setYtPage(nextYtPage);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to fetch next page", err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    if (!query) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [query, offset, ytPage, isSearching, isFetchingMore, hasMore]);

  const handlePlaylistClick = async (playlist: SoundCloudPlaylist) => {
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

  const handleArtistClick = async (artist: SoundCloudArtist) => {
    setSelectedArtist(artist);
    setSelectedPlaylist(null);
    setIsFetchingSubView(true);
    setSubViewError(null);
    setSubViewTracks([]);

    try {
      const tracks = await fetchArtistTracks(artist.id);
      setSubViewTracks(tracks);
    } catch (err) {
      setSubViewError(err instanceof Error ? err.message : "Failed to load artist tracks");
    } finally {
      setIsFetchingSubView(false);
    }
  };

  if (selectedPlaylist) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedPlaylist(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <span>← Back to search results</span>
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

        {isFetchingSubView && <SongRowSkeleton count={5} />}

        {subViewError && <p className="text-sm text-destructive font-semibold">{subViewError}</p>}

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
          <span>← Back to search results</span>
        </button>

        <div className="flex flex-col gap-6 md:flex-row md:items-center bg-card/30 p-6 rounded-3xl border border-border/50">
          <img
            src={selectedArtist.avatar_url}
            alt={selectedArtist.username}
            className="h-32 w-32 rounded-full object-cover shadow-2xl border-4 border-border"
          />
          <div className="space-y-2">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
              Artist
            </span>
            <h2 className="text-2xl font-bold md:text-3xl">{selectedArtist.full_name}</h2>
            <p className="text-sm text-muted-foreground">@{selectedArtist.username}</p>
            <p className="text-xs text-muted-foreground">
              User ID: <span className="font-semibold text-foreground">{selectedArtist.id}</span>
            </p>
          </div>
        </div>

        {isFetchingSubView && <SongRowSkeleton count={5} />}

        {subViewError && <p className="text-sm text-destructive font-semibold">{subViewError}</p>}

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
    <div className="space-y-8">
      <div>
        <h1 className="mb-4 text-2xl font-bold sm:text-3xl">Search</h1>
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tracks, playlists, artists, videos..."
            className="w-full rounded-2xl border border-border bg-card py-3.5 pl-12 pr-12 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <FiX className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {!query && (
        <section>
          <SectionHeader title="Browse genres" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {genres.map((genre, index) => (
              <button
                key={genre}
                onClick={() => setQuery(genre)}
                className="flex h-24 items-end overflow-hidden rounded-2xl p-4 text-left font-semibold text-primary-foreground transition-transform hover:scale-[1.02] cursor-pointer"
                style={{
                  background:
                    index % 2 === 0
                      ? "var(--gradient-warm)"
                      : "linear-gradient(135deg,#292C35,#E09145)",
                }}
              >
                {genre}
              </button>
            ))}
          </div>
        </section>
      )}

      {query && (
        <section className="space-y-8 animate-in fade-in duration-300">
          {isSearching && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-muted-foreground">Searching tracks...</h3>
              <SongRowSkeleton count={8} />
            </div>
          )}

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          {!isSearching && !error && (
            <div className="space-y-8">
              {results?.playlists && results.playlists.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Featured Playlists</h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {results.playlists.slice(0, 5).map((playlist) => (
                      <button
                        key={playlist.id}
                        onClick={() => handlePlaylistClick(playlist)}
                        className="group flex flex-col text-left rounded-2xl p-3 bg-card/40 border border-border/40 hover:bg-card/80 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                      >
                        <img
                          src={playlist.cover}
                          alt={playlist.title}
                          className="aspect-square w-full rounded-xl object-cover mb-3 shadow-md group-hover:shadow-lg transition-shadow"
                        />
                        <h4 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                          {playlist.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mb-2">
                          {playlist.artist}
                        </p>
                        <span className="text-[10px] font-semibold text-muted-foreground mt-auto">
                          {playlist.track_count} tracks
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results?.artists && results.artists.length > 0 && (
                <div className="space-y-4 border-t border-border/40 pt-6">
                  <h3 className="text-lg font-bold">Artists</h3>
                  <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                    {results.artists.slice(0, 6).map((artist) => (
                      <button
                        key={artist.id}
                        onClick={() => handleArtistClick(artist)}
                        className="group flex flex-col items-center text-center p-3 rounded-2xl hover:bg-card/50 transition-all duration-300 cursor-pointer"
                      >
                        <img
                          src={artist.avatar_url}
                          alt={artist.username}
                          className="w-20 h-20 rounded-full object-cover mb-3 shadow-md border-2 border-border group-hover:border-primary transition-colors"
                        />
                        <h4 className="font-bold text-xs line-clamp-1 group-hover:text-primary transition-colors">
                          {artist.full_name}
                        </h4>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                          @{artist.username}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4 border-t border-border/40 pt-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span>Tracks</span>
                  {combinedTracks.length > 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                      {combinedTracks.length}
                    </span>
                  )}
                </h3>
                <div className="space-y-1">
                  {combinedTracks.length > 0 ? (
                    combinedTracks.map((song, index) => (
                      <SongRow key={song.id} song={song} index={index} queue={combinedTracks} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No tracks found.</p>
                  )}
                </div>
              </div>

              {hasMore && !isSearching && combinedTracks.length > 0 && (
                <div ref={observerRef} className="w-full py-4">
                  {isFetchingMore && (
                    <div className="w-full">
                      <SongRowSkeleton count={3} startIndex={combinedTracks.length} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
