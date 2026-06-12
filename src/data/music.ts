import cover1 from "@/assets/cover-1.jpg";
import cover2 from "@/assets/cover-2.jpg";
import cover3 from "@/assets/cover-3.jpg";
import cover4 from "@/assets/cover-4.jpg";
import cover5 from "@/assets/cover-5.jpg";
import cover6 from "@/assets/cover-6.jpg";
import artist1 from "@/assets/artist-1.jpg";
import artist2 from "@/assets/artist-2.jpg";
import artist3 from "@/assets/artist-3.jpg";
import artist4 from "@/assets/artist-4.jpg";

export interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  src: string;
  duration: number; // seconds
  plays: string;
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  followers: string;
  genre: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  cover: string;
  songCount: number;
}

const audio = (n: number) =>
  `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;

export const songs: Song[] = [
  { id: "s1", title: "Golden Hour", artist: "Leo Mercer", cover: cover1, src: audio(1), duration: 213, plays: "12.4M" },
  { id: "s2", title: "Sunset Drive", artist: "Nova Reign", cover: cover2, src: audio(2), duration: 248, plays: "8.9M" },
  { id: "s3", title: "Liquid Amber", artist: "Kai Stone", cover: cover3, src: audio(3), duration: 195, plays: "5.1M" },
  { id: "s4", title: "Ember Nights", artist: "Mira Lune", cover: cover4, src: audio(4), duration: 226, plays: "20.2M" },
  { id: "s5", title: "Geometry", artist: "Leo Mercer", cover: cover5, src: audio(5), duration: 201, plays: "3.7M" },
  { id: "s6", title: "Peach Smoke", artist: "Mira Lune", cover: cover6, src: audio(6), duration: 234, plays: "9.6M" },
  { id: "s7", title: "Warm Static", artist: "Nova Reign", cover: cover1, src: audio(7), duration: 188, plays: "2.2M" },
  { id: "s8", title: "Afterglow", artist: "Kai Stone", cover: cover3, src: audio(8), duration: 257, plays: "14.8M" },
];

export const trending: Song[] = [songs[3], songs[7], songs[0], songs[5], songs[1]];

export const artists: Artist[] = [
  { id: "a1", name: "Leo Mercer", image: artist1, followers: "2.1M", genre: "Indie Pop" },
  { id: "a2", name: "Nova Reign", image: artist2, followers: "4.8M", genre: "Synthwave" },
  { id: "a3", name: "Kai Stone", image: artist3, followers: "1.3M", genre: "Lo-fi Hip Hop" },
  { id: "a4", name: "Mira Lune", image: artist4, followers: "6.5M", genre: "Dream Pop" },
];

export const playlists: Playlist[] = [
  { id: "p1", name: "Late Night Drive", description: "Smooth tracks for the open road", cover: cover2, songCount: 24 },
  { id: "p2", name: "Focus Flow", description: "Deep concentration beats", cover: cover3, songCount: 38 },
  { id: "p3", name: "Golden Mornings", description: "Wake up with warmth", cover: cover1, songCount: 16 },
  { id: "p4", name: "Neon Dreams", description: "Retro future vibes", cover: cover4, songCount: 29 },
];

export const formatTime = (s: number) => {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};
