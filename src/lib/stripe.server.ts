// Server-only helpers for processing Stripe webhook events.
// Uses the service-role Supabase client to upsert into orders/subscriptions.
// Never import from client-reachable modules.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type StripeEvent = {
  id: string;
  type: string;
  data: { object: any };
};

const SUB_PRODUCT_ID = "creatine-gummies-180";

function centsToMajor(amount: number | null | undefined): number {
  if (!amount || !Number.isFinite(amount)) return 0;
  return Math.round(amount) / 100;
}

async function upsertOrderFromSession(session: any) {
  // Retrieve line items via API for one-time purchases so we can persist details.
  const email: string | null =
    session.customer_details?.email ?? session.customer_email ?? null;
  const userId: string | null = session.metadata?.user_id || null;

  const amountTotal = centsToMajor(session.amount_total);
  const currency = (session.currency || "sek").toUpperCase();

  const row = {
    user_id: userId || null,
    email,
    provider: "stripe",
    product_id: SUB_PRODUCT_ID,
    dose: 1,
    bags: 1,
    amount_eur: amountTotal, // legacy column name; stored in row currency
    currency,
    status: session.payment_status === "paid" ? "paid" : session.payment_status || "pending",
    stripe_session_id: session.id,
    stripe_payment_intent_id: session.payment_intent || null,
    stripe_customer_id: session.customer || null,
    stripe_subscription_id: session.subscription || null,
    order_number: session.id.replace(/^cs_/, "").slice(-8).toUpperCase(),
    details: {
      shipping: session.shipping_details ?? null,
      customer_details: session.customer_details ?? null,
      mode: session.mode,
      amount_subtotal: centsToMajor(session.amount_subtotal),
      total_details: session.total_details ?? null,
    },
  };

  // Upsert by stripe_session_id (unique per Checkout).
  const { data: existing } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (existing?.id) {
    await supabaseAdmin.from("orders").update(row).eq("id", existing.id);
  } else {
    await supabaseAdmin.from("orders").insert(row);
  }
}

async function upsertSubscription(sub: any, extras?: { email?: string | null; userId?: string | null }) {
  const item = sub.items?.data?.[0];
  const priceAmount = centsToMajor(item?.price?.unit_amount);
  const currency = (sub.currency || "sek").toUpperCase();
  const cadenceDays = 60; // 2-month cadence for our subscription

  const row = {
    user_id: extras?.userId || null,
    email: extras?.email || null,
    provider: "stripe",
    product_id: SUB_PRODUCT_ID,
    dose: 1,
    plan_title: "Creatine Gummies — 180 (every 2 months)",
    price_eur: priceAmount,
    currency,
    cadence_days: cadenceDays,
    status: sub.status === "active" || sub.status === "trialing" ? "active" : sub.status,
    next_bill_at: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : new Date(Date.now() + cadenceDays * 86400_000).toISOString(),
    cancelled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
    stripe_subscription_id: sub.id,
    stripe_customer_id: sub.customer,
    last_synced_at: new Date().toISOString(),
  };

  const { data: existing } = await supabaseAdmin
    .from("subscriptions")
    .select("id, user_id, email")
    .eq("stripe_subscription_id", sub.id)
    .maybeSingle();

  if (existing?.id) {
    // Preserve existing user_id/email if already linked.
    const patch: Record<string, unknown> = { ...row };
    if (existing.user_id) patch.user_id = existing.user_id;
    if (existing.email && !row.email) patch.email = existing.email;
    await supabaseAdmin.from("subscriptions").update(patch).eq("id", existing.id);
  } else {
    await supabaseAdmin.from("subscriptions").insert(row);
  }
}

export async function handleStripeEvent(event: StripeEvent): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      await upsertOrderFromSession(session);

      // If this checkout created a subscription, seed a subscription row now.
      if (session.mode === "subscription" && session.subscription) {
        // We only have the id here; store a stub with the customer + email so
        // the follow-up customer.subscription.* event has something to update.
        const email: string | null =
          session.customer_details?.email ?? session.customer_email ?? null;
        const userId: string | null = session.metadata?.user_id || null;

        const { data: existing } = await supabaseAdmin
          .from("subscriptions")
          .select("id")
          .eq("stripe_subscription_id", session.subscription)
          .maybeSingle();

        if (!existing?.id) {
          await supabaseAdmin.from("subscriptions").insert({
            user_id: userId,
            email,
            provider: "stripe",
            product_id: SUB_PRODUCT_ID,
            dose: 1,
            plan_title: "Creatine Gummies — 180 (every 2 months)",
            price_eur: centsToMajor(session.amount_total),
            currency: (session.currency || "sek").toUpperCase(),
            cadence_days: 60,
            status: "active",
            stripe_subscription_id: session.subscription,
            stripe_customer_id: session.customer,
            last_synced_at: new Date().toISOString(),
          });
        }
      }
      return;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      await upsertSubscription(sub);
      return;
    }

    case "invoice.paid":
    case "invoice.payment_succeeded": {
      const invoice = event.data.object;
      // Record recurring subscription charges as an order for the account page.
      if (invoice.subscription) {
        const { data: existing } = await supabaseAdmin
          .from("orders")
          .select("id")
          .eq("stripe_invoice_id", invoice.id)
          .maybeSingle();
        if (!existing?.id) {
          await supabaseAdmin.from("orders").insert({
            provider: "stripe",
            product_id: SUB_PRODUCT_ID,
            dose: 1,
            bags: 1,
            amount_eur: centsToMajor(invoice.amount_paid),
            currency: (invoice.currency || "sek").toUpperCase(),
            status: "paid",
            email: invoice.customer_email ?? null,
            stripe_invoice_id: invoice.id,
            stripe_customer_id: invoice.customer,
            stripe_subscription_id: invoice.subscription,
            stripe_payment_intent_id: invoice.payment_intent ?? null,
            order_number: (invoice.number || invoice.id).slice(-8).toUpperCase(),
            details: {
              hosted_invoice_url: invoice.hosted_invoice_url ?? null,
              period_start: invoice.period_start ?? null,
              period_end: invoice.period_end ?? null,
              lines: invoice.lines?.data ?? null,
            },
          });
        }
      }
      return;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "past_due", last_synced_at: new Date().toISOString() })
          .eq("stripe_subscription_id", invoice.subscription);
      }
      return;
    }

    default:
      // Ignore other event types.
      return;
  }
}
