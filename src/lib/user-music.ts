import { supabase } from "@/lib/supabase";
import type { Song } from "@/data/music";

export async function saveRecentlyPlayed(song: Song) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("recently_played").insert({
    user_id: user.id,
    song_id: song.id,
    title: song.title,
    artist: song.artist,
    cover: song.cover,
  });
}

export async function saveLikedSong(song: Song) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("liked_songs").insert({
    user_id: user.id,
    song_id: song.id,
    title: song.title,
    artist: song.artist,
    cover: song.cover,
  });
}

export async function removeLikedSong(songId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("liked_songs")
    .delete()
    .eq("user_id", user.id)
    .eq("song_id", songId);
}