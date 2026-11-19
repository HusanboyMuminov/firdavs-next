import "server-only";

/**
 * Orders through the restaurant's Telegram bot: the server posts the order to
 * the restaurant's chat with the Bot API. Nothing is sent, and nothing claims
 * to be sent, until both variables are set (server-side only — never exposed
 * to the browser):
 *
 *   TELEGRAM_BOT_TOKEN  token from @BotFather
 *   TELEGRAM_CHAT_ID    chat that receives orders (staff group or a person who
 *                       has pressed Start in the bot) — see the README
 */

const env = (name: string) => process.env[name]?.trim().replace(/^(["'])(.*)\1$/, "$2").trim() || undefined;

/** The token as @BotFather shows it (a pasted "bot" prefix is tolerated). */
const botToken = () => env("TELEGRAM_BOT_TOKEN")?.replace(/^bot(?=\d+:)/i, "");
const chatId = () => env("TELEGRAM_CHAT_ID");

export function telegramReady(): boolean {
  return Boolean(botToken() && chatId());
}

type BotReply = { ok?: boolean; description?: string; parameters?: { migrate_to_chat_id?: number } };

async function postMessage(token: string, chat: string | number, text: string) {
  const base = env("TELEGRAM_API_URL") ?? "https://api.telegram.org";
  let response: Response;
  try {
    response = await fetch(`${base}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, link_preview_options: { is_disabled: true } }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    // Never let the URL (it contains the token) end up in logs or the database.
    throw new Error(`Telegram request failed: ${error instanceof Error ? error.name : "error"}`);
  }
  const data = (await response.json().catch(() => null)) as BotReply | null;
  return { response, data };
}

/** Posts one message to the orders chat; throws if not configured or Telegram rejects it. */
export async function sendTelegram(text: string): Promise<void> {
  const token = botToken();
  const chat = chatId();
  if (!token || !chat) throw new Error("Telegram bot not configured");
  let { response, data } = await postMessage(token, chat, text);
  // A group that Telegram upgraded to a supergroup gets a new id: deliver there (the first
  // attempt was rejected, so this is not a duplicate) and say which id to configure.
  const moved = data?.ok ? undefined : data?.parameters?.migrate_to_chat_id;
  if (moved) {
    console.warn(`[telegram] The orders group has a new id — set TELEGRAM_CHAT_ID=${moved}`);
    ({ response, data } = await postMessage(token, moved, text));
  }
  if (!response.ok || !data?.ok) {
    throw new Error(`Telegram ${response.status}: ${(data?.description ?? "request failed").slice(0, 200)}`);
  }
}
