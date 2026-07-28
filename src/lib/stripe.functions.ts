import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Stripe product IDs (live) for GumLab. The default price on each product
// in the Stripe dashboard is what customers are charged.
export const STRIPE_PRODUCT_SUBSCRIPTION = "prod_UyDiQCZl934LoZ"; // every 60 days
export const STRIPE_PRODUCT_ONETIME = "prod_UyDjP6fXwMAxEB"; // one-time

const SITE_URL = "https://gumlab.se";

async function resolveDefaultPrice(productId: string): Promise<string> {
  const product = (await stripeFetch(`/products/${productId}`, { method: "GET" })) as {
    default_price: string | { id: string } | null;
  };
  const dp = product.default_price;
  const priceId = typeof dp === "string" ? dp : dp?.id;
  if (!priceId) {
    throw new Error(`Stripe product ${productId} has no default price set`);
  }
  return priceId;
}

function stripeForm(params: Record<string, string | undefined>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined) usp.append(k, v);
  return usp.toString();
}

async function stripeFetch(path: string, init: { method: "GET" | "POST"; body?: string }) {
  const key = process.env.STRIPE_LIVE_API_KEY;
  if (!key) throw new Error("STRIPE_LIVE_API_KEY not configured");
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: init.body,
  });
  const json = await res.json();
  if (!res.ok) {
    console.error("Stripe API error", res.status, json);
    throw new Error((json as any)?.error?.message ?? `Stripe request failed (${res.status})`);
  }
  return json;
}

/**
 * Creates a Stripe Checkout Session for subscription or one-time purchase and
 * returns the hosted checkout URL. Public — no auth required.
 */
export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        mode: z.enum(["subscribe", "onetime"]),
        email: z.string().email().optional(),
        userId: z.string().uuid().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const isSub = data.mode === "subscribe";
    const productId = isSub ? STRIPE_PRODUCT_SUBSCRIPTION : STRIPE_PRODUCT_ONETIME;
    const priceId = await resolveDefaultPrice(productId);

    const body = stripeForm({
      mode: isSub ? "subscription" : "payment",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      success_url: `${SITE_URL}/account?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/?checkout=cancelled#buy`,
      customer_email: data.email,
      allow_promotion_codes: "true",
      "shipping_address_collection[allowed_countries][0]": "SE",
      "shipping_address_collection[allowed_countries][1]": "NO",
      "shipping_address_collection[allowed_countries][2]": "DK",
      "shipping_address_collection[allowed_countries][3]": "FI",
      "shipping_address_collection[allowed_countries][4]": "DE",
      "shipping_address_collection[allowed_countries][5]": "NL",
      "shipping_address_collection[allowed_countries][6]": "FR",
      "shipping_address_collection[allowed_countries][7]": "BE",
      "shipping_address_collection[allowed_countries][8]": "ES",
      "shipping_address_collection[allowed_countries][9]": "IT",
      "metadata[mode]": data.mode,
      "metadata[user_id]": data.userId ?? "",
    });

    const session = (await stripeFetch("/checkout/sessions", { method: "POST", body })) as {
      id: string;
      url: string;
    };
    return { url: session.url, id: session.id };
  });

/**
 * Creates a Stripe Billing Portal session so signed-in customers can manage
 * their subscription, payment method, and invoices.
 */
export const createBillingPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Look up the Stripe customer for this user via their most recent record.
    const { data: sub } = await context.supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("provider", "stripe")
      .not("stripe_customer_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let customerId = sub?.stripe_customer_id as string | null | undefined;

    if (!customerId) {
      const { data: order } = await context.supabase
        .from("orders")
        .select("stripe_customer_id")
        .eq("provider", "stripe")
        .not("stripe_customer_id", "is", null)
        .order("ordered_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      customerId = order?.stripe_customer_id as string | null | undefined;
    }

    if (!customerId) {
      throw new Error("No Stripe customer on file yet. Complete a checkout first.");
    }

    const portal = (await stripeFetch("/billing_portal/sessions", {
      method: "POST",
      body: stripeForm({
        customer: customerId,
        return_url: `${SITE_URL}/account`,
      }),
    })) as { url: string };

    return { url: portal.url };
  });
