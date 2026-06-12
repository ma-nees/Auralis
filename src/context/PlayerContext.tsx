import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { songs as allSongs, type Song } from "@/data/music";
import { saveRecentlyPlayed, saveLikedSong, removeLikedSong } from "@/lib/user-music";
type Repeat = "off" | "all" | "one";

export interface UserPlaylist {
  id: string;
  name: string;
  songs: Song[];
}

interface PlayerState {
  queue: Song[];
  current: Song | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: Repeat;
  favorites: Song[];
  recentPlayed: Song[];
  userPlaylists: UserPlaylist[];
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  toggleFavorite: (song: Song) => void;
  isFavorite: (id: string) => boolean;
  createPlaylist: (name: string, initialSong?: Song) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
}

const Ctx = createContext<PlayerState | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<Song[]>(allSongs);
  const [current, setCurrent] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<Repeat>("off");
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [recentPlayed, setRecentPlayed] = useState<Song[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>([]);

  // init audio element + favorites
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    try {
      const saved = localStorage.getItem("favorites_songs");
      if (saved) {
        setFavorites(JSON.parse(saved));
      } else {
        const oldSaved = localStorage.getItem("favorites");
        if (oldSaved) {
          const ids: string[] = JSON.parse(oldSaved);
          const migrated = ids.map(id => allSongs.find(s => s.id === id)).filter((s): s is Song => !!s);
          setFavorites(migrated);
        }
      }
      const recent = localStorage.getItem("recent_played_songs");
      if (recent) {
        setRecentPlayed(JSON.parse(recent));
      }
      const savedPlaylists = localStorage.getItem("user_playlists");
      if (savedPlaylists) {
        setUserPlaylists(JSON.parse(savedPlaylists));
      }
    } catch {
      /* ignore */
    }
    const a = audioRef.current;
    const onTime = () => setProgress(a.currentTime);
    const onMeta = () => setDuration(a.duration);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playSong = (song: Song, q?: Song[]) => {
    const a = audioRef.current;
    if (!a) return;
     saveRecentlyPlayed(song);
    if (q) setQueue(q);
    setRecentPlayed((recent) => {
      const nextRecent = [song, ...recent.filter((x) => x.id !== song.id)].slice(0, 12);
      try {
        localStorage.setItem("recent_played_songs", JSON.stringify(nextRecent));
      } catch {
        /* ignore */
      }
      return nextRecent;
    });
    if (current?.id !== song.id) {
      a.src = song.src;
      setCurrent(song);
      setProgress(0);
    }
    a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a || !current) {
      if (queue[0]) playSong(queue[0]);
      return;
    }
    if (isPlaying) {
      a.pause();
      setIsPlaying(false);
    } else {
      a.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const indexInQueue = () => queue.findIndex((s) => s.id === current?.id);

  const next = () => {
    if (!queue.length) return;
    let idx = indexInQueue();
    if (shuffle) {
      idx = Math.floor(Math.random() * queue.length);
    } else {
      idx = (idx + 1) % queue.length;
    }
    playSong(queue[idx]);
  };

  const prev = () => {
    if (!queue.length) return;
    const a = audioRef.current;
    if (a && a.currentTime > 3) {
      a.currentTime = 0;
      return;
    }
    let idx = indexInQueue();
    idx = (idx - 1 + queue.length) % queue.length;
    playSong(queue[idx]);
  };

  // handle song end
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onEnd = () => {
      if (repeat === "one") {
        a.currentTime = 0;
        a.play();
        return;
      }
      const idx = indexInQueue();
      const isLast = idx === queue.length - 1;
      if (isLast && repeat === "off" && !shuffle) {
        setIsPlaying(false);
        return;
      }
      next();
    };
    a.addEventListener("ended", onEnd);
    return () => a.removeEventListener("ended", onEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repeat, shuffle, queue, current]);

  const seek = (t: number) => {
    const a = audioRef.current;
    if (a) {
      a.currentTime = t;
      setProgress(t);
    }
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const toggleShuffle = () => setShuffle((s) => !s);
  const cycleRepeat = () =>
    setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));

  // const toggleFavorite = (song: Song) => {
  //   setFavorites((f) => {
  //     const exists = f.some((x) => x.id === song.id);
  //     const nextF = exists ? f.filter((x) => x.id !== song.id) : [...f, song];
  //     try {
  //       localStorage.setItem("favorites_songs", JSON.stringify(nextF));
  //     } catch {
  //       /* ignore */
  //     }
  //     return nextF;
  //   });
  // };
const toggleFavorite = (song: Song) => {
  setFavorites((f) => {
    const exists = f.some((x) => x.id === song.id);
    const nextF = exists ? f.filter((x) => x.id !== song.id) : [...f, song];

    if (exists) {
      removeLikedSong(song.id);
    } else {
      saveLikedSong(song);
    }

    try {
      localStorage.setItem("favorites_songs", JSON.stringify(nextF));
    } catch {
      /* ignore */
    }

    return nextF;
  });
};
  const isFavorite = (id: string) => favorites.some((x) => x.id === id);

  const saveUserPlaylists = (nextPlaylists: UserPlaylist[]) => {
    try {
      localStorage.setItem("user_playlists", JSON.stringify(nextPlaylists));
    } catch {
      /* ignore */
    }
    return nextPlaylists;
  };

  const createPlaylist = (name: string, initialSong?: Song) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setUserPlaylists((playlists) =>
      saveUserPlaylists([
        ...playlists,
        {
          id: `playlist-${Date.now()}`,
          name: trimmed,
          songs: initialSong ? [initialSong] : [],
        },
      ]),
    );
  };

  const addSongToPlaylist = (playlistId: string, song: Song) => {
    setUserPlaylists((playlists) =>
      saveUserPlaylists(
        playlists.map((playlist) => {
          if (playlist.id !== playlistId) return playlist;
          if (playlist.songs.some((x) => x.id === song.id)) return playlist;
          return { ...playlist, songs: [...playlist.songs, song] };
        }),
      ),
    );
  };

  const value = useMemo(
    () => ({
      queue,
      current,
      isPlaying,
      progress,
      duration,
      volume,
      shuffle,
      repeat,
      favorites,
      recentPlayed,
      userPlaylists,
      playSong,
      togglePlay,
      next,
      prev,
      seek,
      setVolume,
      toggleShuffle,
      cycleRepeat,
      toggleFavorite,
      isFavorite,
      createPlaylist,
      addSongToPlaylist,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queue, current, isPlaying, progress, duration, volume, shuffle, repeat, favorites, recentPlayed, userPlaylists],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlayer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
