import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

// Stripe webhook endpoint.
// Configure in Stripe Dashboard → Developers → Webhooks:
//   URL:    https://gumlab.se/api/public/webhooks/stripe
//   Events: checkout.session.completed, invoice.paid, invoice.payment_failed,
//           customer.subscription.updated, customer.subscription.deleted
// Secret is stored as STRIPE_WEBHOOK_SECRET.

export const Route = createFileRoute("/api/public/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!secret) return new Response("Webhook secret not configured", { status: 500 });

        const sigHeader = request.headers.get("stripe-signature");
        if (!sigHeader) return new Response("Missing signature", { status: 400 });

        const raw = await request.text();

        // Parse "t=timestamp,v1=signature,..."
        const parts = Object.fromEntries(
          sigHeader.split(",").map((kv) => {
            const idx = kv.indexOf("=");
            return [kv.slice(0, idx), kv.slice(idx + 1)];
          }),
        );
        const timestamp = parts["t"];
        const provided = parts["v1"];
        if (!timestamp || !provided) return new Response("Malformed signature", { status: 400 });

        // Reject events older than 5 minutes to protect against replays.
        const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
        if (!Number.isFinite(age) || age > 300) {
          return new Response("Stale signature", { status: 400 });
        }

        const signedPayload = `${timestamp}.${raw}`;
        const expected = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");
        const a = Buffer.from(provided);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let event: any;
        try {
          event = JSON.parse(raw);
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }

        try {
          const { handleStripeEvent } = await import("@/lib/stripe.server");
          await handleStripeEvent(event);
        } catch (err) {
          console.error("stripe webhook handler failed", err);
          return new Response("handler error", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});
