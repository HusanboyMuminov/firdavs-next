import { unstable_rethrow } from "next/navigation";
import { connection, type NextRequest } from "next/server";
import { isAdminRequest } from "@/server/admin-auth";
import { errorResponse, json } from "@/server/http";
import { listOrders } from "@/server/orders";
import { kitchenNumber, smsProvider } from "@/server/sms";

/** Admin: latest table orders + whether kitchen SMS is configured. */
export async function GET(request: NextRequest) {
  await connection(); // per-request: never prerendered at build time
  try {
    if (!isAdminRequest(request)) return errorResponse(401, "unauthorized");
    return json({ orders: listOrders(30), sms: { provider: smsProvider(), to: kitchenNumber() } });
  } catch (error) {
    unstable_rethrow(error);
    console.error("[api/admin/orders]", error);
    return errorResponse(503, "unavailable");
  }
}
