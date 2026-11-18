import "server-only";
import { isKnownSlug } from "@/lib/routes";

/** Anonymous random ids generated in the browser. */
export const isClientId = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Za-z0-9_-]{16,64}$/.test(value);

/** A screen path of this app without the language prefix, e.g. "/menu/plov". */
export const isScreenPath = (value: unknown): value is string =>
  typeof value === "string" &&
  value.length <= 64 &&
  value.startsWith("/") &&
  isKnownSlug(value.split("/").filter(Boolean));

export const isText = (value: unknown, max: number): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max;
