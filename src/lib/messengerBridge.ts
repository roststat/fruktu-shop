// Тонкий адаптер над SDK мини-приложений разных мессенджеров.
// Добавление новой платформы = реализовать detect() + методы ниже.

interface TelegramWebAppUser {
  id: number;
  first_name: string;
  photo_url?: string;
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  openLink: (url: string) => void;
  initDataUnsafe?: { user?: TelegramWebAppUser };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export type MessengerPlatform = "telegram" | "vk" | "max" | null;

export function detectPlatform(): MessengerPlatform {
  if (typeof window === "undefined") return null;
  if (window.Telegram?.WebApp) return "telegram";
  return null;
}

export function initMessengerApp() {
  const platform = detectPlatform();
  if (platform === "telegram") {
    window.Telegram!.WebApp!.ready();
    window.Telegram!.WebApp!.expand();
  }
  return platform;
}

export function closeMessengerApp() {
  const platform = detectPlatform();
  if (platform === "telegram") {
    window.Telegram!.WebApp!.close();
  }
}

export function openExternalLink(url: string) {
  const platform = detectPlatform();
  if (platform === "telegram") {
    window.Telegram!.WebApp!.openLink(url);
    return;
  }
  window.open(url, "_blank");
}

export function getMessengerUserId(): string | null {
  const platform = detectPlatform();
  if (platform === "telegram") {
    const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    return userId ? String(userId) : null;
  }
  return null;
}

export interface MessengerUser {
  id: string;
  firstName: string;
  photoUrl: string | null;
}

export function getMessengerUser(): MessengerUser | null {
  const platform = detectPlatform();
  if (platform === "telegram") {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!user) return null;
    return {
      id: String(user.id),
      firstName: user.first_name,
      photoUrl: user.photo_url ?? null,
    };
  }
  return null;
}
