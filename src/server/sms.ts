import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { restaurant } from "@/data/restaurant";

/**
 * Server-side SMS to the kitchen phone, through an SMS provider configured with
 * environment variables (nothing is sent, and nothing claims to be sent, until
 * one is set up):
 *
 *   Solapi (Korea):  SOLAPI_API_KEY, SOLAPI_API_SECRET, SMS_FROM
 *   Twilio:          TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, SMS_FROM
 *   ORDER_SMS_TO     kitchen number (default: the restaurant's order phone)
 *   SMS_PROVIDER     "solapi" | "twilio" — only needed if both are configured
 *
 * SMS_FROM must be a sender number registered with the provider (in Korea every
 * sender number has to be pre-registered).
 */

export type SmsProvider = "solapi" | "twilio";

const env = (name: string) => process.env[name]?.trim() || undefined;

export function smsProvider(): SmsProvider | null {
  const solapi = Boolean(env("SOLAPI_API_KEY") && env("SOLAPI_API_SECRET") && env("SMS_FROM"));
  const twilio = Boolean(env("TWILIO_ACCOUNT_SID") && env("TWILIO_AUTH_TOKEN") && env("SMS_FROM"));
  const wanted = env("SMS_PROVIDER");
  if (wanted === "solapi") return solapi ? "solapi" : null;
  if (wanted === "twilio") return twilio ? "twilio" : null;
  return solapi ? "solapi" : twilio ? "twilio" : null;
}

/** Kitchen number for order SMS, digits only, Korean domestic format ("01032382555"). */
export function kitchenNumber(): string {
  const raw = env("ORDER_SMS_TO") ?? restaurant.orderPhone;
  const digits = raw.replace(/[^\d+]/g, "");
  return digits.startsWith("+82") ? `0${digits.slice(3)}` : digits.replace(/\D/g, "");
}

const toE164 = (domestic: string) => (domestic.startsWith("0") ? `+82${domestic.slice(1)}` : `+${domestic}`);

async function failure(response: Response, provider: string): Promise<Error> {
  const text = (await response.text().catch(() => "")).slice(0, 300);
  return new Error(`${provider} ${response.status}: ${text}`);
}

async function sendSolapi(to: string, text: string): Promise<void> {
  const apiKey = env("SOLAPI_API_KEY")!;
  const secret = env("SOLAPI_API_SECRET")!;
  const date = new Date().toISOString();
  const salt = randomBytes(16).toString("hex");
  const signature = createHmac("sha256", secret).update(date + salt).digest("hex");
  const base = env("SOLAPI_API_URL") ?? "https://api.solapi.com";
  const response = await fetch(`${base}/messages/v4/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
    },
    body: JSON.stringify({ message: { to, from: env("SMS_FROM")!.replace(/\D/g, ""), text } }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw await failure(response, "Solapi");
  const data = (await response.json().catch(() => ({}))) as { statusCode?: string };
  if (data.statusCode && !data.statusCode.startsWith("2")) throw new Error(`Solapi status ${data.statusCode}`);
}

async function sendTwilio(to: string, text: string): Promise<void> {
  const sid = env("TWILIO_ACCOUNT_SID")!;
  const token = env("TWILIO_AUTH_TOKEN")!;
  const base = env("TWILIO_API_URL") ?? "https://api.twilio.com";
  const response = await fetch(`${base}/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
    },
    body: new URLSearchParams({ To: toE164(to), From: env("SMS_FROM")!, Body: text }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw await failure(response, "Twilio");
}

/** Sends one SMS; throws if no provider is configured or the provider rejects it. */
export async function sendSms(to: string, text: string): Promise<void> {
  const provider = smsProvider();
  if (!provider) throw new Error("SMS provider not configured");
  if (provider === "solapi") await sendSolapi(to, text);
  else await sendTwilio(to, text);
}
