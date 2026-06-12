import { createFileRoute, Link } from "@tanstack/react-router";
import { FiPlay, FiHeart } from "react-icons/fi";
import { usePlayer } from "@/context/PlayerContext";
import { SongRow } from "@/components/SongCard";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Liked Songs — Auralis" },
      { name: "description", content: "All the songs you've liked, saved in one place on Auralis." },
      { property: "og:title", content: "Liked Songs — Auralis" },
      { property: "og:description", content: "Your collection of liked songs on Auralis." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { favorites, playSong } = usePlayer();
  const liked = favorites;

  return (
    <div className="space-y-8">
      <section className="flex items-end gap-5 rounded-3xl bg-card p-6 [background-image:var(--gradient-hero)] sm:p-8">
        <div className="grid h-24 w-24 place-items-center rounded-2xl bg-[image:var(--gradient-warm)] shadow-[var(--shadow-glow)] sm:h-32 sm:w-32">
          <FiHeart className="h-12 w-12 text-primary-foreground" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Playlist</p>
          <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Liked Songs</h1>
          <p className="mt-2 text-sm text-muted-foreground">{liked.length} songs</p>
        </div>
      </section>

      {liked.length ? (
        <>
          <button
            onClick={() => playSong(liked[0], liked)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-105"
          >
            <FiPlay className="h-4 w-4" /> Play
          </button>
          <div className="space-y-1">
            {liked.map((song, i) => (
              <SongRow key={song.id} song={song} index={i} queue={liked} />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
          <FiHeart className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-semibold">No liked songs yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tap the heart on any song to save it here.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Discover music
          </Link>
        </div>
      )}
    </div>
  );
}
