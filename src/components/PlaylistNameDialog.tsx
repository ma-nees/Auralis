import { FormEvent, useEffect, useState } from "react";

interface PlaylistNameDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export function PlaylistNameDialog({
  open,
  title = "Create playlist",
  description = "Give your playlist a name.",
  submitLabel = "Create",
  onClose,
  onSubmit,
}: PlaylistNameDialogProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName("");
  }, [open]);

  if (!open) return null;

  const trimmedName = name.trim();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmedName) return;
    onSubmit(trimmedName);
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-background/80 px-4 backdrop-blur-sm animate-in fade-in duration-200">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] animate-in zoom-in-95 duration-200"
      >
        <h2 className="text-xl font-extrabold">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>

        <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Playlist name
        </label>
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="My playlist"
          className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
        />

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!trimmedName}
            className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
