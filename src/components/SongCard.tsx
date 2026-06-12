import { FiPlay, FiPause, FiHeart } from "react-icons/fi";
import { usePlayer } from "@/context/PlayerContext";
import { formatTime, type Song } from "@/data/music";
import { Equalizer } from "./Equalizer";

export function SongCard({ song, queue }: { song: Song; queue?: Song[] }) {
  const { playSong, current, isPlaying, togglePlay, toggleFavorite, isFavorite } = usePlayer();
  const isCurrent = current?.id === song.id;
  const playingThis = isCurrent && isPlaying;

  return (
    <div className="group relative w-40 shrink-0 rounded-2xl bg-card p-3 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:bg-secondary sm:w-full">
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={song.cover}
          alt={`${song.title} cover`}
          loading="lazy"
          width={600}
          height={600}
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          onClick={() => (isCurrent ? togglePlay() : playSong(song, queue))}
          aria-label={playingThis ? "Pause" : "Play"}
          className="absolute bottom-2 right-2 grid h-11 w-11 translate-y-2 place-items-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-[var(--shadow-glow)] transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          {playingThis ? <FiPause className="h-5 w-5" /> : <FiPlay className="h-5 w-5 translate-x-px" />}
        </button>
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
            {playingThis && <Equalizer />}
            <span className="truncate">{song.title}</span>
          </p>
          <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
        </div>
        <button
          onClick={() => toggleFavorite(song)}
          aria-label="Like song"
          className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
        >
          <FiHeart
            className={`h-4 w-4 ${isFavorite(song.id) ? "fill-primary text-primary" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}

export function SongRow({ song, index, queue }: { song: Song; index?: number; queue?: Song[] }) {
  const { playSong, current, isPlaying, togglePlay, toggleFavorite, isFavorite } = usePlayer();
  const isCurrent = current?.id === song.id;
  const playingThis = isCurrent && isPlaying;

  return (
    <div
      onClick={() => (isCurrent ? togglePlay() : playSong(song, queue))}
      className={`group flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors hover:bg-card ${
        isCurrent ? "bg-card" : ""
      }`}
    >
      {typeof index === "number" && (
        <span className="hidden w-5 text-center text-sm text-muted-foreground sm:block">
          {index + 1}
        </span>
      )}
      <div className="relative">
        <img
          src={song.cover}
          alt={song.title}
          loading="lazy"
          className="h-12 w-12 rounded-lg object-cover"
        />
        <span className="absolute inset-0 grid place-items-center rounded-lg bg-background/50 opacity-0 transition-opacity group-hover:opacity-100">
          {playingThis ? <FiPause className="h-4 w-4" /> : <FiPlay className="h-4 w-4" />}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${isCurrent ? "text-primary" : ""}`}>
          {song.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
      </div>
      <span className="hidden text-xs text-muted-foreground sm:block">{song.plays} plays</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(song);
        }}
        aria-label="Like song"
        className="text-muted-foreground transition-colors hover:text-primary"
      >
        <FiHeart className={`h-4 w-4 ${isFavorite(song.id) ? "fill-primary text-primary" : ""}`} />
      </button>
      <span className="w-10 text-right text-xs text-muted-foreground">
        {formatTime(song.duration)}
      </span>
    </div>
  );
}
