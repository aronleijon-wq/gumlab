import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SHOPIFY_STORE_DOMAIN = "saveeruope.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";

/**
 * Fetches Shopify orders for the signed-in user's email and upserts them into
 * the local `orders` table. Attaches them to the user by email match.
 * Safe to call on every /account load.
 */
export const syncShopifyOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = (context.claims?.email as string | undefined) ?? undefined;
    if (!email) return { synced: 0 };

    const token = process.env.SHOPIFY_ACCESS_TOKEN;
    if (!token) return { synced: 0, error: "SHOPIFY_ACCESS_TOKEN not set" };

    const url =
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/orders.json` +
      `?status=any&email=${encodeURIComponent(email)}&limit=50`;

    const res = await fetch(url, {
      headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" },
    });
    if (!res.ok) return { synced: 0, error: `shopify ${res.status}` };
    const { orders = [] } = (await res.json()) as { orders?: any[] };
    if (!orders.length) return { synced: 0 };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rows = orders.map((o) => {
      const firstLine = o.line_items?.[0];
      return {
        shopify_order_id: String(o.id),
        user_id: context.userId,
        email: o.email ?? email,
        product_id: String(firstLine?.product_id ?? firstLine?.sku ?? "creatine-gummies"),
        dose: 3,
        bags: Number(firstLine?.quantity ?? 1),
        amount_eur: Number(o.total_price ?? 0),
        currency: String(o.currency ?? "SEK"),
        status: String(o.financial_status ?? "paid"),
        ordered_at: o.processed_at ?? o.created_at ?? new Date().toISOString(),
      };
    });

    const { error } = await supabaseAdmin
      .from("orders")
      .upsert(rows, { onConflict: "shopify_order_id" });
    if (error) return { synced: 0, error: error.message };
    return { synced: rows.length };
  });
