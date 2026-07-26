import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

// Shopify sends orders/create and orders/updated events here.
// Configure in Shopify Admin → Settings → Notifications → Webhooks.
// URL: https://<your-domain>/api/public/webhooks/shopify/orders
// Format: JSON. Uses SHOPIFY_WEBHOOK_SECRET for HMAC verification.

export const Route = createFileRoute("/api/public/webhooks/shopify/orders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
        if (!secret) return new Response("Webhook secret not configured", { status: 500 });

        const signature = request.headers.get("x-shopify-hmac-sha256") ?? "";
        const raw = await request.text();
        const expected = createHmac("sha256", secret).update(raw, "utf8").digest("base64");

        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expected);
        if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: any;
        try { payload = JSON.parse(raw); } catch { return new Response("Bad JSON", { status: 400 }); }

        const shopifyOrderId = String(payload.id ?? payload.admin_graphql_api_id ?? "");
        const email: string | null = payload.email ?? payload.contact_email ?? null;
        if (!shopifyOrderId || !email) return new Response("ok"); // nothing we can attach

        const amount = Number(payload.total_price ?? payload.current_total_price ?? 0);
        const currency = String(payload.currency ?? "SEK");
        const status = String(payload.financial_status ?? "paid");
        const orderedAt = payload.processed_at ?? payload.created_at ?? new Date().toISOString();
        const firstLine = payload.line_items?.[0];
        const productId = String(firstLine?.product_id ?? firstLine?.sku ?? "creatine-gummies");
        const bags = Number(firstLine?.quantity ?? 1);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Try to match an existing account by email
        let userId: string | null = null;
        try {
          const { data: prof } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .ilike("email", email)
            .maybeSingle();
          userId = prof?.id ?? null;
        } catch {}

        const { error } = await supabaseAdmin.from("orders").upsert(
          {
            shopify_order_id: shopifyOrderId,
            user_id: userId,
            email,
            product_id: productId,
            dose: 3,
            bags,
            amount_eur: amount,
            currency,
            status,
            ordered_at: orderedAt,
          },
          { onConflict: "shopify_order_id" },
        );
        if (error) {
          console.error("orders upsert failed", error);
          return new Response("db error", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});
