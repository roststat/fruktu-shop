"use client";

import { useEffect, useState } from "react";
import { getMessengerUserId, openExternalLink } from "@/lib/messengerBridge";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fruktu.ru";

export default function ReferralPage() {
  const [code, setCode] = useState<string | null>(null);
  const [copiedTelegram, setCopiedTelegram] = useState(false);
  const [copiedSite, setCopiedSite] = useState(false);

  useEffect(() => {
    const chatId = getMessengerUserId();
    if (!chatId) return;
    setCode(chatId);
  }, []);

  const telegramLink = code ? `https://t.me/fruktu_bot?start=ref_${code}` : null;
  const siteLink = code ? `${SITE_URL}/?ref=${code}` : null;

  const copy = (value: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = (link: string) => {
    const text = "Заказываю продукты с рынка прямо в Telegram — попробуй и ты!";
    openExternalLink(
      `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`
    );
  };

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="mb-4 text-2xl font-extrabold">Мои рекомендации</h1>

      {!code ? (
        <p className="text-muted">
          Рекомендации доступны только в мини-приложении Telegram.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          <div>
            <p className="mb-2 text-sm text-muted">
              Ссылка на бота — друг сразу попадёт в мини-приложение Telegram.
            </p>
            <div className="mb-2 rounded-[10px] border border-black/5 bg-background p-3 text-sm break-all">
              {telegramLink}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => telegramLink && share(telegramLink)}
                className="rounded-[10px] bg-primary px-4 py-3 text-sm font-bold text-white"
              >
                📤 Поделиться в Telegram
              </button>
              <button
                onClick={() => telegramLink && copy(telegramLink, setCopiedTelegram)}
                className="rounded-[10px] border border-primary bg-white px-4 py-3 text-sm font-bold text-primary"
              >
                {copiedTelegram ? "Скопировано ✅" : "Скопировать ссылку"}
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm text-muted">
              Ссылка на сайт — подойдёт для тех, у кого нет Telegram.
            </p>
            <div className="mb-2 rounded-[10px] border border-black/5 bg-background p-3 text-sm break-all">
              {siteLink}
            </div>
            <button
              onClick={() => siteLink && copy(siteLink, setCopiedSite)}
              className="w-full rounded-[10px] border border-primary bg-white px-4 py-3 text-sm font-bold text-primary"
            >
              {copiedSite ? "Скопировано ✅" : "Скопировать ссылку"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
