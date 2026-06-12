export const builtInAvatars = [
  {
    id: "milo",
    label: "Milo",
    imageUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=Milo&backgroundColor=fcd9b8",
  },
  {
    id: "luna",
    label: "Luna",
    imageUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=Luna&backgroundColor=e09145",
  },
  {
    id: "kai",
    label: "Kai",
    imageUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=Kai&backgroundColor=fcd9b8",
  },
  {
    id: "nira",
    label: "Nira",
    imageUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=Nira&backgroundColor=e09145",
  },
  {
    id: "zara",
    label: "Zara",
    imageUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=Zara&backgroundColor=fcd9b8",
  },
  {
    id: "ryu",
    label: "Ryu",
    imageUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=Ryu&backgroundColor=e09145",
  },
] as const;

export type BuiltInAvatarId = (typeof builtInAvatars)[number]["id"];

export const pendingAvatarKey = "auralis_pending_avatar";

export function getBuiltInAvatar(id: string | null | undefined) {
  return builtInAvatars.find((avatar) => avatar.id === id) ?? null;
}

export function userAvatarKey(userId: string) {
  return `auralis_avatar_${userId}`;
}
