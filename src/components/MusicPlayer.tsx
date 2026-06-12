import { useEffect, useState } from "react";
import {
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiRepeat,
  FiShuffle,
  FiHeart,
  FiVolume2,
  FiVolumeX,
  FiChevronDown,
  FiPlusCircle,
} from "react-icons/fi";
import { TbRepeatOnce } from "react-icons/tb";
import { usePlayer } from "@/context/PlayerContext";
import { PlaylistNameDialog } from "@/components/PlaylistNameDialog";
import { formatTime } from "@/data/music";

function ProgressBar() {
  const { progress, duration, seek } = usePlayer();
  const pct = duration ? (progress / duration) * 100 : 0;
  return (
    <div className="flex w-full items-center gap-2">
      <span className="hidden w-9 text-right text-[11px] tabular-nums text-muted-foreground sm:block">
        {formatTime(progress)}
      </span>
      <div className="group relative h-1.5 flex-1 cursor-pointer rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[image:var(--gradient-warm)]"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-cream opacity-0 shadow transition-opacity group-hover:opacity-100"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={progress}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Seek"
          className="absolute inset-0 w-full cursor-pointer opacity-0"
        />
      </div>
      <span className="hidden w-9 text-[11px] tabular-nums text-muted-foreground sm:block">
        {formatTime(duration)}
      </span>
    </div>
  );
}

export function MusicPlayer() {
  const {
    current,
    isPlaying,
    togglePlay,
    next,
    prev,
    shuffle,
    repeat,
    toggleShuffle,
    cycleRepeat,
    volume,
    setVolume,
    toggleFavorite,
    isFavorite,
    userPlaylists,
    createPlaylist,
    addSongToPlaylist,
  } = usePlayer();
  const [expanded, setExpanded] = useState(false);
  const [playlistMenuOpen, setPlaylistMenuOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (!expanded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [expanded]);

  if (!current) return null;

  const handleCreatePlaylist = () => {
    setCreateDialogOpen(true);
  };

  const handleSubmitPlaylist = (name: string) => {
    createPlaylist(name, current);
    setPlaylistMenuOpen(false);
    setCreateDialogOpen(false);
  };

  return (
    <>
      {expanded && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background/95 px-5 py-4 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 lg:left-64 lg:px-8 lg:py-5">
          <div className="mx-auto flex min-h-[calc(100dvh-2rem)] max-w-md flex-col lg:min-h-full lg:max-w-5xl">
            <nav className="glass flex items-center justify-between rounded-full p-2 shadow-[var(--shadow-soft)] lg:hidden">
              <button
                onClick={() => setExpanded(false)}
                aria-label="Minimize player"
                className="grid h-10 w-10 place-items-center rounded-full bg-card text-muted-foreground"
              >
                <FiChevronDown className="h-5 w-5" />
              </button>
              <div className="min-w-0 px-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Now Playing
                </p>
                <p className="truncate text-xs font-semibold">{current.title}</p>
              </div>
              <button
                onClick={() => toggleFavorite(current)}
                aria-label="Like"
                className="grid h-10 w-10 place-items-center rounded-full bg-card text-muted-foreground"
              >
                <FiHeart className={`h-5 w-5 ${isFavorite(current.id) ? "fill-primary text-primary" : ""}`} />
              </button>
            </nav>

            <div className="hidden items-center justify-between lg:flex">
              <button
                onClick={() => setExpanded(false)}
                aria-label="Minimize player"
                className="grid h-10 w-10 place-items-center rounded-full bg-card text-muted-foreground"
              >
                <FiChevronDown className="h-5 w-5" />
              </button>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Now Playing
              </p>
              <button
                onClick={() => toggleFavorite(current)}
                aria-label="Like"
                className="grid h-10 w-10 place-items-center rounded-full bg-card text-muted-foreground"
              >
                <FiHeart className={`h-5 w-5 ${isFavorite(current.id) ? "fill-primary text-primary" : ""}`} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col justify-center py-3 lg:grid lg:grid-cols-[minmax(15rem,22rem)_minmax(0,24rem)] lg:items-center lg:justify-center lg:gap-10 lg:py-0">
              <img
                src={current.cover}
                alt={current.title}
                className="mx-auto aspect-square w-full max-w-[min(20rem,78vw,42dvh)] rounded-3xl object-cover shadow-[var(--shadow-soft)] sm:max-w-sm lg:max-h-[calc(100vh-9rem)] lg:max-w-[22rem]"
              />

              <div className="min-w-0">
                <div className="mt-4 text-center sm:mt-8 lg:mt-0">
                  <h2 className="truncate text-2xl font-extrabold lg:text-3xl">{current.title}</h2>
                  <p className="mt-2 truncate text-sm text-muted-foreground">{current.artist}</p>
                </div>

                <div className="mt-4 sm:mt-8 lg:mt-6">
                  <ProgressBar />
                </div>

                <div className="relative mt-4 sm:mt-6">
                  <button
                    type="button"
                    onClick={() => setPlaylistMenuOpen((open) => !open)}
                    className="mx-auto flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <FiPlusCircle className="h-4 w-4" />
                    Add to playlist
                  </button>

                  {playlistMenuOpen && (
                    <div className="absolute left-1/2 top-full z-10 mt-3 w-64 -translate-x-1/2 rounded-2xl border border-border/60 bg-card p-2 shadow-[var(--shadow-soft)]">
                      <button
                        type="button"
                        onClick={handleCreatePlaylist}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-muted"
                      >
                        <FiPlusCircle className="h-4 w-4" />
                        Create new playlist
                      </button>
                      {userPlaylists.length > 0 ? (
                        <div className="mt-1 max-h-44 overflow-y-auto">
                          {userPlaylists.map((playlist) => (
                            <button
                              key={playlist.id}
                              type="button"
                              onClick={() => {
                                addSongToPlaylist(playlist.id, current);
                                setPlaylistMenuOpen(false);
                              }}
                              className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              <span className="truncate">{playlist.name}</span>
                              <span className="text-[10px]">{playlist.songs.length}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="px-3 py-2 text-xs text-muted-foreground">
                          Create a playlist first.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-center gap-5 pb-0 sm:mt-8 sm:gap-7 lg:mt-7">
                  <button onClick={toggleShuffle} aria-label="Shuffle" className={shuffle ? "text-primary" : "text-muted-foreground"}>
                    <FiShuffle className="h-5 w-5" />
                  </button>
                  <button onClick={prev} aria-label="Previous" className="transition-transform active:scale-95">
                    <FiSkipBack className="h-7 w-7" />
                  </button>
                  <button
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause" : "Play"}
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-glow)] transition-transform active:scale-95 sm:h-16 sm:w-16"
                  >
                    {isPlaying ? <FiPause className="h-7 w-7" /> : <FiPlay className="h-7 w-7 translate-x-px" />}
                  </button>
                  <button onClick={next} aria-label="Next" className="transition-transform active:scale-95">
                    <FiSkipForward className="h-7 w-7" />
                  </button>
                  <button onClick={cycleRepeat} aria-label="Repeat" className={repeat !== "off" ? "text-primary" : "text-muted-foreground"}>
                    {repeat === "one" ? <TbRepeatOnce className="h-5 w-5" /> : <FiRepeat className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <PlaylistNameDialog
        open={createDialogOpen}
        description="Name this playlist and the current song will be added."
        submitLabel="Create and add"
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleSubmitPlaylist}
      />

      <div className="fixed inset-x-0 bottom-16 z-40 px-2 pb-2 lg:bottom-0 lg:left-64 lg:px-4 lg:pb-4">
      <div className="mx-auto max-w-5xl glass rounded-2xl shadow-[var(--shadow-soft)] transition-transform duration-300 hover:scale-[1.01]">
        {/* Mobile compact bar */}
        <div className="flex items-center gap-3 p-2.5 lg:hidden">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
          >
            <img
              src={current.cover}
              alt={current.title}
              className="h-11 w-11 rounded-lg object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{current.title}</p>
              <p className="truncate text-xs text-muted-foreground">{current.artist}</p>
            </div>
          </button>
          <button
            onClick={() => toggleFavorite(current)}
            aria-label="Like"
            className="text-muted-foreground"
          >
            <FiHeart className={`h-5 w-5 ${isFavorite(current.id) ? "fill-primary text-primary" : ""}`} />
          </button>
          <button
            onClick={handleCreatePlaylist}
            aria-label="Create playlist"
            className="text-muted-foreground"
          >
            <FiPlusCircle className="h-5 w-5" />
          </button>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground"
          >
            {isPlaying ? <FiPause className="h-5 w-5" /> : <FiPlay className="h-5 w-5 translate-x-px" />}
          </button>
        </div>
        <div className="px-3 pb-2 lg:hidden">
          <ProgressBar />
        </div>

        {/* Desktop full bar */}
        <div className="hidden grid-cols-3 items-center gap-4 p-3 lg:grid">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setExpanded(true)}
              className="flex min-w-0 items-center gap-3 text-left"
            >
              <img src={current.cover} alt={current.title} className="h-14 w-14 rounded-lg object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{current.title}</p>
                <p className="truncate text-xs text-muted-foreground">{current.artist}</p>
              </div>
            </button>
            <button
              onClick={() => toggleFavorite(current)}
              aria-label="Like"
              className="ml-1 text-muted-foreground transition-colors hover:text-primary"
            >
              <FiHeart className={`h-4 w-4 ${isFavorite(current.id) ? "fill-primary text-primary" : ""}`} />
            </button>
            <button
              onClick={handleCreatePlaylist}
              aria-label="Create playlist"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <FiPlusCircle className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-5">
              <button onClick={toggleShuffle} aria-label="Shuffle" className={`transition-colors ${shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <FiShuffle className="h-4 w-4" />
              </button>
              <button onClick={prev} aria-label="Previous" className="transition-transform hover:scale-110">
                <FiSkipBack className="h-5 w-5" />
              </button>
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-105"
              >
                {isPlaying ? <FiPause className="h-5 w-5" /> : <FiPlay className="h-5 w-5 translate-x-px" />}
              </button>
              <button onClick={next} aria-label="Next" className="transition-transform hover:scale-110">
                <FiSkipForward className="h-5 w-5" />
              </button>
              <button onClick={cycleRepeat} aria-label="Repeat" className={`transition-colors ${repeat !== "off" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {repeat === "one" ? <TbRepeatOnce className="h-4 w-4" /> : <FiRepeat className="h-4 w-4" />}
              </button>
            </div>
            <ProgressBar />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setVolume(volume > 0 ? 0 : 0.8)} aria-label="Mute" className="text-muted-foreground">
              {volume > 0 ? <FiVolume2 className="h-4 w-4" /> : <FiVolumeX className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume"
              className="h-1 w-28 cursor-pointer accent-[var(--primary)]"
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
