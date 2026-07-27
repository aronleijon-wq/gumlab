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

        const { upsertShopifyWebhookOrder } = await import("@/lib/orders.server");
        const result = await upsertShopifyWebhookOrder(payload);
        if (!result.ok) {
          console.error("orders upsert failed", result.error);
          return new Response("db error", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});
