// Тонкий адаптер над SDK мини-приложений разных мессенджеров.
// Добавление новой платформы = реализовать detect() + методы ниже.

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
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
