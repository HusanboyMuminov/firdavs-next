import { connection } from "next/server";
import { errorResponse, json } from "@/server/http";
import { vapidPublicKey } from "@/server/push";

/** Public VAPID key for PushManager.subscribe (safe to expose; the private key never leaves the server). */
export async function GET() {
  await connection(); // read the environment at request time, not at build time
  const publicKey = vapidPublicKey();
  return publicKey ? json({ publicKey }) : errorResponse(503, "push_not_configured");
}
