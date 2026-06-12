import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FiMusic, FiPlus } from "react-icons/fi";
import { usePlayer } from "@/context/PlayerContext";
import { PlaylistNameDialog } from "@/components/PlaylistNameDialog";
import { SongRow } from "@/components/SongCard";
import { playlists } from "@/data/music";
import type { UserPlaylist } from "@/context/PlayerContext";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Your Library - Auralis" },
      { name: "description", content: "Browse your saved playlists in your Auralis music library." },
      { property: "og:title", content: "Your Library - Auralis" },
      { property: "og:description", content: "Your playlists in one place." },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { recentPlayed, userPlaylists, createPlaylist } = usePlayer();
  const [selectedPlaylist, setSelectedPlaylist] = useState<UserPlaylist | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreatePlaylist = () => {
    setCreateDialogOpen(true);
  };

  const handleSubmitPlaylist = (name: string) => {
    createPlaylist(name);
    setCreateDialogOpen(false);
  };

  if (selectedPlaylist) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedPlaylist(null)}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to library
        </button>
        <section className="rounded-3xl bg-card p-6 [background-image:var(--gradient-hero)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Playlist
          </p>
          <h1 className="mt-2 text-3xl font-extrabold">{selectedPlaylist.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {selectedPlaylist.songs.length} {selectedPlaylist.songs.length === 1 ? "song" : "songs"}
          </p>
        </section>

        {selectedPlaylist.songs.length > 0 ? (
          <div className="space-y-1">
            {selectedPlaylist.songs.map((song, i) => (
              <SongRow key={song.id} song={song} index={i} queue={selectedPlaylist.songs} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center">
            <FiMusic className="mx-auto h-9 w-9 text-muted-foreground" />
            <p className="mt-4 font-semibold">No songs yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Play a song and add it from the player.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PlaylistNameDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleSubmitPlaylist}
      />

      <h1 className="text-2xl font-bold sm:text-3xl">Your Library</h1>

      <section>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">Your Playlists</h2>
            <p className="text-xs text-muted-foreground">
              {userPlaylists.length} {userPlaylists.length === 1 ? "playlist" : "playlists"}
            </p>
          </div>
          <button
            onClick={handleCreatePlaylist}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-[var(--shadow-glow)]"
          >
            <FiPlus className="h-4 w-4" />
            Create
          </button>
        </div>

        {userPlaylists.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {userPlaylists.map((playlist) => {
              const cover = playlist.songs[0]?.cover;
              return (
                <button
                  key={playlist.id}
                  onClick={() => setSelectedPlaylist(playlist)}
                  className="group rounded-2xl bg-card p-3 text-left transition-all hover:-translate-y-1 hover:bg-secondary"
                >
                  {cover ? (
                    <img
                      src={cover}
                      alt={playlist.name}
                      className="aspect-square w-full rounded-xl object-cover shadow-[var(--shadow-soft)]"
                    />
                  ) : (
                    <div className="grid aspect-square w-full place-items-center rounded-xl bg-primary/10 text-primary">
                      <FiMusic className="h-8 w-8" />
                    </div>
                  )}
                  <h3 className="mt-3 truncate text-sm font-semibold group-hover:text-primary">
                    {playlist.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {playlist.songs.length} {playlist.songs.length === 1 ? "song" : "songs"}
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center">
            <FiMusic className="mx-auto h-9 w-9 text-muted-foreground" />
            <p className="mt-4 font-semibold">No custom playlists yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create one here or while playing a song.
            </p>
          </div>
        )}
      </section>

      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold sm:text-2xl">Recently Played</h2>
          <p className="text-xs text-muted-foreground">
            {recentPlayed.length} {recentPlayed.length === 1 ? "song" : "songs"}
          </p>
        </div>
        {recentPlayed.length > 0 ? (
          <div className="space-y-1">
            {recentPlayed.map((song, i) => (
              <SongRow key={song.id} song={song} index={i} queue={recentPlayed} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center">
            <FiMusic className="mx-auto h-9 w-9 text-muted-foreground" />
            <p className="mt-4 font-semibold">No recent songs yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Play a song and it will show up here.
            </p>
          </div>
        )}
      </section>

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-card/20 rounded-3xl border border-border/50">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <FiMusic className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">No playlists yet</h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Explore music and playlists to build your library.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-105"
          >
            Browse music
          </Link>
        </div>
      ) : (
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold sm:text-2xl">Playlists</h2>
            <p className="text-xs text-muted-foreground">
              {playlists.length} {playlists.length === 1 ? "playlist" : "playlists"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {playlists.map((playlist) => (
              <Link
                key={playlist.id}
                to="/"
                className="group rounded-2xl bg-card p-3 text-left transition-all hover:-translate-y-1 hover:bg-secondary"
              >
                <img
                  src={playlist.cover}
                  alt={playlist.name}
                  loading="lazy"
                  className="aspect-square w-full rounded-xl object-cover shadow-[var(--shadow-soft)]"
                />
                <h3 className="mt-3 truncate text-sm font-semibold group-hover:text-primary">
                  {playlist.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {playlist.description}
                </p>
                <p className="mt-3 text-[11px] font-medium text-muted-foreground">
                  {playlist.songCount} songs
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
