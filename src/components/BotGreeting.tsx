import { useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { usePlayer } from "@/context/PlayerContext";
import { searchSongs, searchYouTube } from "@/lib/music-search";
import { BotIcon } from "./BotIcon";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

interface BotResponse {
  success: boolean;
  reply?: string;
  action?: string;
  query?: string;
  volume?: number;
}

const greetings = [
  "Hello, {name}. Ready for your next track?",
  "Welcome back, {name}. Your music is waiting.",
  "Hi {name}, let us find something good to play.",
  "Hey {name}, great to see you again.",
  "Hello {name}, your Auralis session is ready.",
  "Good to see you, {name}. Press play and enjoy.",
  "Welcome, {name}. What are we listening to today?",
  "Hey {name}, your favorite tunes are just a tap away.",
  "Hi {name}, let's make today sound amazing.",
  "Welcome back, {name}. Discover something new today.",
  "Hello {name}, your soundtrack starts here.",
  "Hey {name}, ready to explore fresh music?",
  "Hi {name}, the perfect song might be waiting for you.",
  "Welcome back, {name}. Let the music take over.",
  "Good to have you here, {name}.",
  "Hello {name}, your playlists missed you.",
  "Hey {name}, let's find your next favorite song.",
  "Welcome, {name}. Time to turn up the volume.",
  "Hi {name}, music feels better when you're here.",
  "Hello {name}, pick a vibe and press play.",
  "Welcome back, {name}. Your queue is ready.",
  "Hey {name}, another great listening session awaits.",
  "Hi {name}, what mood are we matching today?",
  "Hello {name}, let's discover something unforgettable.",
  "Welcome, {name}. Your music journey continues.",
  "Hey {name}, fresh beats and familiar favorites await.",
  "Hi {name}, ready for a little musical escape?",
  "Hello {name}, let's find the rhythm of your day.",
  "Welcome back, {name}. The music never stopped.",
  "Hey {name}, your next obsession could be one song away.",
];

const playPhrases = [
  "can you play",
  "please play",
  "i want to hear",
  "listen to",
  "put on",
  "play",
  "search",
  "find",
  "start",
];

function getGoogleName(session: Session) {
  const metadata = session.user.user_metadata;
  const fullName = metadata?.full_name || metadata?.name || metadata?.preferred_username;

  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim().split(" ")[0];
  }

  if (session.user.email) {
    return session.user.email.split("@")[0];
  }

  return "there";
}

function getGreetingIndex(value: string) {
  return [...value].reduce((total, char) => total + char.charCodeAt(0), 0) % greetings.length;
}

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;

  const browserWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition || null;
}

function isSpeechRecognitionSupported() {
  return !!getSpeechRecognition();
}

function extractSongQuery(command: string) {
  let query = command.toLowerCase().trim();

  playPhrases.forEach((phrase) => {
    query = query.replace(new RegExp(`\\b${phrase}\\b`, "gi"), " ");
  });

  return query
    .replace(/\b(song|music|track|video|on auralis|for me|please|now)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getVoiceErrorMessage(error: string) {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone permission is blocked. Allow mic access in your browser and try again.";
    case "audio-capture":
      return "No microphone was found. Check your mic and try again.";
    case "no-speech":
      return "I did not catch any speech. Try again and speak after it says Listening.";
    case "network":
      return "Browser voice recognition is unavailable here. Type your music command below.";
    default:
      return "I could not hear that clearly. Try again or type the command below.";
  }
}

async function searchAndPlay(query: string, playSong: ReturnType<typeof usePlayer>["playSong"]) {
  const soundCloudTracks = await searchSongs(query);
  const tracks = soundCloudTracks.length ? soundCloudTracks : await searchYouTube(query);

  if (!tracks.length) return null;

  playSong(tracks[0], tracks);
  return tracks[0];
}

export function BotGreeting({
  session,
  isPublicPage,
}: {
  session: Session | null;
  isPublicPage: boolean;
}) {
  if (!session || isPublicPage) {
    return null;
  }

  const {
    current,
    favorites,
    isPlaying,
    next,
    playSong,
    prev,
    setVolume,
    toggleFavorite,
    togglePlay,
  } = usePlayer();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [showGreeting, setShowGreeting] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceClosing, setVoiceClosing] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceUnavailable, setVoiceUnavailable] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [typedCommand, setTypedCommand] = useState("");
  const [voiceMessage, setVoiceMessage] = useState("Click the mic and ask me to play music.");
  const voiceSupported = isSpeechRecognitionSupported();

  const greeting = useMemo(() => {
    if (!session) return null;

    const name = getGoogleName(session);
    const message = greetings[getGreetingIndex(`${session.user.id}-${new Date().toDateString()}`)];

    return message.replace("{name}", name);
  }, [session]);

  useEffect(() => {
    if (!greeting) {
      setShowGreeting(false);
      return;
    }

    setShowGreeting(true);
    const timer = window.setTimeout(() => {
      setShowGreeting(false);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [greeting]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (!voiceOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeAssistant();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [voiceOpen]);

  const askBot = async (command: string) => {
    const response = await fetch("/api/bot/respond", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        command,
        currentSong: current ? { title: current.title, artist: current.artist } : null,
      }),
    });

    if (!response.ok) return null;

    return (await response.json()) as BotResponse;
  };

  const runBotAction = async (botResponse: BotResponse) => {
    if (botResponse.reply) {
      setVoiceMessage(botResponse.reply);
    }

    switch (botResponse.action) {
      case "next":
        next();
        return true;
      case "previous":
        prev();
        return true;
      case "pause":
        if (isPlaying) togglePlay();
        return true;
      case "resume":
        if (!isPlaying) togglePlay();
        return true;
      case "like":
        if (current && !favorites.some((song) => song.id === current.id)) {
          toggleFavorite(current);
        }
        return true;
      case "volume": {
        if (typeof botResponse.volume !== "number") return false;
        const volume = Math.min(100, Math.max(0, botResponse.volume));
        setVolume(volume / 100);
        return true;
      }
      case "play": {
        const query = botResponse.query?.trim();
        if (!query) return false;

        setVoiceMessage(botResponse.reply || `Searching for ${query}...`);
        const song = await searchAndPlay(query, playSong);

        if (!song) {
          setVoiceMessage(`I could not find ${query}. Try another song name.`);
          return true;
        }

        setVoiceMessage(`Playing ${song.title}.`);
        return true;
      }
      default:
        return false;
    }
  };

  const runMusicCommand = async (spokenCommand: string, useBot = true) => {
    const command = spokenCommand.toLowerCase().trim();

    if (!command) return;

    if (useBot) {
      try {
        const botResponse = await askBot(command);
        if (botResponse?.success && await runBotAction(botResponse)) {
          return;
        }
      } catch {
        setVoiceMessage("Bot response failed, trying basic music command...");
      }
    }

    if (/\b(next|skip)\b/.test(command)) {
      next();
      setVoiceMessage("Skipping to the next song.");
      return;
    }

    if (/\b(previous|back|last song)\b/.test(command)) {
      prev();
      setVoiceMessage("Going back to the previous song.");
      return;
    }

    if (/\b(pause|stop)\b/.test(command)) {
      if (isPlaying) togglePlay();
      setVoiceMessage("Paused the music.");
      return;
    }

    if (/\b(resume|continue)\b/.test(command)) {
      if (!isPlaying) togglePlay();
      setVoiceMessage("Resuming playback.");
      return;
    }

    if (/\b(like|favorite|save)\b/.test(command) && current) {
      const alreadyLiked = favorites.some((song) => song.id === current.id);
      if (!alreadyLiked) toggleFavorite(current);
      setVoiceMessage(`Saved ${current.title} to your liked songs.`);
      return;
    }

    const volumeMatch = command.match(/\bvolume\s*(?:to)?\s*(\d{1,3})\b/);
    if (volumeMatch) {
      const volume = Math.min(100, Math.max(0, Number(volumeMatch[1])));
      setVolume(volume / 100);
      setVoiceMessage(`Volume set to ${volume} percent.`);
      return;
    }

    const wantsMusic = playPhrases.some((phrase) => command.includes(phrase)) || command.includes("song");
    if (!wantsMusic) {
      setVoiceMessage("Try saying: play One Love, pause music, next song, or volume 50.");
      return;
    }

    const query = extractSongQuery(command);
    if (!query) {
      setVoiceMessage("Tell me the song name after saying play.");
      return;
    }

    setVoiceMessage(`Searching for ${query}...`);

    try {
      const song = await searchAndPlay(query, playSong);

      if (!song) {
        setVoiceMessage(`I could not find ${query}. Try another song name.`);
        return;
      }

      setVoiceMessage(`Playing ${song.title}.`);
    } catch {
      setVoiceMessage("I could not search right now. Please try again.");
    }
  };

  const startListening = async () => {
    const SpeechRecognition = getSpeechRecognition();

    setVoiceOpen(true);

    if (voiceUnavailable) {
      setVoiceMessage("Browser voice recognition is unavailable here. Type your music command below.");
      return;
    }

    if (!SpeechRecognition) {
      setVoiceMessage("Voice commands are not supported in this browser.");
      setVoiceUnavailable(true);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceMessage("Microphone access is not available in this browser. Type the command below.");
      setVoiceUnavailable(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      setVoiceMessage("Microphone permission is needed. Allow mic access, then press Start voice command again.");
      return;
    }

    recognitionRef.current?.stop();

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const spokenCommand = event.results[0]?.[0]?.transcript || "";
      setTranscript(spokenCommand);
      setListening(false);
      void runMusicCommand(spokenCommand);
    };

    recognition.onerror = (event) => {
      setListening(false);
      if (event.error === "network") {
        setVoiceUnavailable(true);
      }
      setVoiceMessage(getVoiceErrorMessage(event.error));
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    setTranscript("");
    setVoiceMessage("Listening...");
    setListening(true);
    try {
      recognition.start();
    } catch {
      setListening(false);
      setVoiceMessage("Voice recognition is already starting. Wait a second and try again.");
    }
  };

  const openAssistant = () => {
    setVoiceOpen(true);
    setVoiceClosing(false);
    setShowGreeting(false);

    if (!voiceSupported) {
      setVoiceUnavailable(true);
      setVoiceMessage("Voice is not supported in this browser. Type your music command below.");
      return;
    }

    setVoiceMessage("Use voice or type a command like play One Love.");
  };

  const closeAssistant = () => {
    recognitionRef.current?.stop();
    setListening(false);
    setVoiceClosing(true);
    window.setTimeout(() => {
      setVoiceOpen(false);
      setVoiceClosing(false);
    }, 160);
  };

  const runTypedCommand = () => {
    const command = typedCommand.trim();
    if (!command) return;

    setTranscript(command);
    void runMusicCommand(command);
  };

  const bottomClass = isPublicPage ? "bottom-6" : "bottom-36 lg:bottom-28";

  return (
    <div ref={containerRef} className={`fixed right-5 z-40 flex max-w-[calc(100vw-2.5rem)] items-end gap-3 ${bottomClass}`}>
      <div className="space-y-3">
        {showGreeting && greeting && !voiceOpen && (
          <div className="max-w-56 rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm font-semibold leading-5 text-foreground shadow-[var(--shadow-soft)]">
            {greeting}
          </div>
        )}

        {voiceOpen && (
          <div
            className={`w-72 max-w-[calc(100vw-6.5rem)] origin-bottom-right rounded-3xl border border-border/70 bg-card p-4 text-sm shadow-[var(--shadow-soft)] transition-all duration-150 ${
              voiceClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
            }`}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-foreground">Bot command</p>
                <p className="text-xs text-muted-foreground">
                  {voiceUnavailable ? "Type command" : listening ? "Speak now" : "Music assistant"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeAssistant}
                className="rounded-full px-2 py-1 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Close
              </button>
            </div>

            <p className="rounded-2xl bg-background/80 px-3 py-2 leading-5 text-muted-foreground">
              {voiceMessage}
            </p>

            {transcript && (
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Heard: <span className="font-semibold text-foreground">{transcript}</span>
              </p>
            )}

            <button
              type="button"
              onClick={startListening}
              disabled={listening || voiceUnavailable || !voiceSupported}
              className="mt-4 w-full rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {!voiceSupported || voiceUnavailable
                ? "Voice unavailable"
                : listening
                  ? "Listening..."
                  : "Start voice command"}
            </button>

            <div className="mt-3 flex gap-2">
              <input
                value={typedCommand}
                onChange={(event) => setTypedCommand(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") runTypedCommand();
                }}
                placeholder="Type: play One Love"
                className="min-w-0 flex-1 rounded-full border border-border bg-background px-3 py-2 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
              <button
                type="button"
                onClick={runTypedCommand}
                className="rounded-full border border-border px-3 py-2 text-xs font-bold text-foreground transition-colors hover:bg-muted"
              >
                Run
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={openAssistant}
        aria-label="Open Auralis voice assistant"
        title="Open Auralis voice assistant"
        className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-border/70 bg-card text-primary shadow-[var(--shadow-glow)] transition-transform hover:scale-105 active:scale-95"
      >
        <BotIcon className="h-8 w-8" />
      </button>
    </div>
  );
}
