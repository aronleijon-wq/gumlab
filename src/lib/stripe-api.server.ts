export type CheckoutMode = "subscribe" | "onetime";

// Stripe product IDs (live) for GumLab. The default price on each product
// in the Stripe dashboard is what customers are charged.
const STRIPE_PRODUCT_SUBSCRIPTION = "prod_UyDiQCZl934LoZ";
const STRIPE_PRODUCT_ONETIME = "prod_UyDjP6fXwMAxEB";
const SITE_URL = "https://gumlab.se";

type AccountStripeLookup = {
  customerId: string | null;
  error?: string;
};

type StripeScopedClient = {
  from: (table: "orders" | "subscriptions" | "profiles") => any;
};

function stripeForm(params: Record<string, string | undefined>): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) usp.append(key, value);
  }
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
    throw new Error((json as { error?: { message?: string } })?.error?.message ?? `Stripe request failed (${res.status})`);
  }
  return json;
}

async function resolveDefaultPrice(productId: string): Promise<string> {
  const product = (await stripeFetch(`/products/${productId}`, { method: "GET" })) as {
    default_price: string | { id: string } | null;
  };
  const defaultPrice = product.default_price;
  const priceId = typeof defaultPrice === "string" ? defaultPrice : defaultPrice?.id;
  if (!priceId) throw new Error(`Stripe product ${productId} has no default price set`);
  return priceId;
}

async function findCustomerInVisibleRows(supabase: StripeScopedClient): Promise<{
  customerId: string | null;
  checkoutSessionId: string | null;
  hasStripeRecord: boolean;
}> {
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id, stripe_subscription_id")
    .eq("provider", "stripe")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subscription?.stripe_customer_id) {
    return { customerId: subscription.stripe_customer_id, checkoutSessionId: null, hasStripeRecord: true };
  }

  const { data: order } = await supabase
    .from("orders")
    .select("stripe_customer_id, stripe_session_id")
    .eq("provider", "stripe")
    .order("ordered_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (order?.stripe_customer_id) {
    return { customerId: order.stripe_customer_id, checkoutSessionId: null, hasStripeRecord: true };
  }

  return {
    customerId: null,
    checkoutSessionId: order?.stripe_session_id ?? null,
    hasStripeRecord: Boolean(subscription?.stripe_subscription_id || order?.stripe_session_id),
  };
}

async function recoverCustomerFromCheckoutSession(sessionId: string): Promise<string | null> {
  const session = (await stripeFetch(`/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    method: "GET",
  })) as { customer?: string | { id?: string } | null };

  if (typeof session.customer === "string") return session.customer;
  return session.customer?.id ?? null;
}

async function findCustomerByEmail(email: string): Promise<string | null> {
  const search = (await stripeFetch(`/customers?email=${encodeURIComponent(email)}&limit=1`, {
    method: "GET",
  })) as { data?: Array<{ id?: string }> };
  return search.data?.[0]?.id ?? null;
}

async function createCustomerForAccount(params: { email: string; userId: string }): Promise<string> {
  const customer = (await stripeFetch("/customers", {
    method: "POST",
    body: stripeForm({
      email: params.email,
      "metadata[user_id]": params.userId,
      "metadata[source]": "gumlab_account_portal_recovery",
    }),
  })) as { id: string };
  return customer.id;
}

async function backfillCustomerId(supabase: StripeScopedClient, customerId: string) {
  await Promise.all([
    supabase
      .from("orders")
      .update({ stripe_customer_id: customerId })
      .eq("provider", "stripe")
      .is("stripe_customer_id", null),
    supabase
      .from("subscriptions")
      .update({ stripe_customer_id: customerId })
      .eq("provider", "stripe")
      .is("stripe_customer_id", null),
  ]);
}

export async function createCheckoutSessionForMode(data: {
  mode: CheckoutMode;
  email?: string;
  userId?: string;
}) {
  const isSubscription = data.mode === "subscribe";
  const productId = isSubscription ? STRIPE_PRODUCT_SUBSCRIPTION : STRIPE_PRODUCT_ONETIME;
  const priceId = await resolveDefaultPrice(productId);

  const body = stripeForm({
    mode: isSubscription ? "subscription" : "payment",
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
    ...(isSubscription ? {} : { customer_creation: "always" }),
  });

  const session = (await stripeFetch("/checkout/sessions", { method: "POST", body })) as {
    id: string;
    url: string;
  };
  return { url: session.url, id: session.id };
}

export async function resolveStripeCustomerForAccount(params: {
  supabase: StripeScopedClient;
  email?: string;
  userId: string;
}): Promise<AccountStripeLookup> {
  const visibleRows = await findCustomerInVisibleRows(params.supabase);
  let customerId = visibleRows.customerId;

  if (!customerId && visibleRows.checkoutSessionId) {
    customerId = await recoverCustomerFromCheckoutSession(visibleRows.checkoutSessionId);
  }

  if (!customerId && params.email) {
    customerId = await findCustomerByEmail(params.email);
  }

  if (!customerId && params.email && visibleRows.hasStripeRecord) {
    customerId = await createCustomerForAccount({ email: params.email, userId: params.userId });
  }

  if (customerId) {
    await backfillCustomerId(params.supabase, customerId);
    return { customerId };
  }

  return {
    customerId: null,
    error: visibleRows.hasStripeRecord
      ? "We found your Stripe order, but could not connect it to a Stripe customer yet. Please contact support@gumlab.se."
      : "No Stripe checkout found for this account yet.",
  };
}

export async function createStripeBillingPortal(customerId: string) {
  const portal = (await stripeFetch("/billing_portal/sessions", {
    method: "POST",
    body: stripeForm({
      customer: customerId,
      return_url: `${SITE_URL}/account`,
    }),
  })) as { url: string };

  return { url: portal.url };
}