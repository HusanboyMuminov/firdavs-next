import "server-only";

/**
 * Orders through the restaurant's Telegram bot: the server posts the order to
 * the restaurant's chat with the Bot API. Nothing is sent, and nothing claims
 * to be sent, until both variables are set:
 *
 *   TELEGRAM_BOT_TOKEN  token from @BotFather
 *   TELEGRAM_CHAT_ID    chat that receives orders (staff group or a person who
 *                       has pressed Start in the bot) — see the README
 */

const env = (name: string) => process.env[name]?.trim() || undefined;

export function telegramReady(): boolean {
  return Boolean(env("TELEGRAM_BOT_TOKEN") && env("TELEGRAM_CHAT_ID"));
}

/** Posts one message to the orders chat; throws if not configured or Telegram rejects it. */
export async function sendTelegram(text: string): Promise<void> {
  const token = env("TELEGRAM_BOT_TOKEN");
  const chatId = env("TELEGRAM_CHAT_ID");
  if (!token || !chatId) throw new Error("Telegram bot not configured");
  const base = env("TELEGRAM_API_URL") ?? "https://api.telegram.org";
  let response: Response;
  try {
    response = await fetch(`${base}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    // Never let the URL (it contains the token) end up in logs or the database.
    throw new Error(`Telegram request failed: ${error instanceof Error ? error.name : "error"}`);
  }
  const data = (await response.json().catch(() => null)) as { ok?: boolean; description?: string } | null;
  if (!response.ok || !data?.ok) {
    throw new Error(`Telegram ${response.status}: ${(data?.description ?? "request failed").slice(0, 200)}`);
  }
}
