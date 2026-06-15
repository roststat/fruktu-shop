const TELEGRAM_API = "https://api.telegram.org/bot";

export function telegramApiUrl(method: string): string {
  return `${TELEGRAM_API}${process.env.TELEGRAM_BOT_TOKEN}/${method}`;
}

interface InlineButton {
  text: string;
  url?: string;
  web_app?: { url: string };
}

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  buttons?: InlineButton[][]
) {
  const res = await fetch(telegramApiUrl("sendMessage"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: buttons ? { inline_keyboard: buttons } : undefined,
    }),
  });
  if (!res.ok) {
    throw new Error(`Telegram sendMessage failed: ${await res.text()}`);
  }
  return res.json();
}
