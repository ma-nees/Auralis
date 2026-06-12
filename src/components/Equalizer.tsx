import { usePlayer } from "@/context/PlayerContext";

export function Equalizer({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-end gap-0.5 ${className}`}>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="eq-bar w-0.5 rounded-full bg-primary"
          style={{ height: "14px", animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

export function CurrentBadge({ id }: { id: string }) {
  const { current, isPlaying } = usePlayer();
  if (current?.id !== id || !isPlaying) return null;
  return <Equalizer />;
}
