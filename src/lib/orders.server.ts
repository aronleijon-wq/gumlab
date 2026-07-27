type ShopifyLineItem = {
  product_id?: number | string | null;
  variant_title?: string | null;
  title?: string | null;
  name?: string | null;
  sku?: string | null;
  quantity?: number | string | null;
  price?: number | string | null;
};

type ShopifyOrder = {
  id?: number | string | null;
  admin_graphql_api_id?: string | null;
  email?: string | null;
  contact_email?: string | null;
  total_price?: number | string | null;
  current_total_price?: number | string | null;
  currency?: string | null;
  financial_status?: string | null;
  fulfillment_status?: string | null;
  processed_at?: string | null;
  created_at?: string | null;
  cancelled_at?: string | null;
  line_items?: ShopifyLineItem[] | null;
};

type SyncInput = {
  email: string;
  userId: string;
};

const SHOPIFY_STORE_DOMAIN = "saveeruope.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";

function numberOr(value: unknown, fallback: number) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function textFromLine(line: ShopifyLineItem | undefined) {
  return [line?.variant_title, line?.title, line?.name, line?.sku]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isSubscriptionLine(line: ShopifyLineItem | undefined) {
  return textFromLine(line).includes("subscription");
}

function addDays(date: string, days: number) {
  const start = new Date(date);
  if (Number.isNaN(start.getTime())) return new Date(Date.now() + days * 86400000).toISOString();
  start.setDate(start.getDate() + days);
  return start.toISOString();
}

function orderId(order: ShopifyOrder) {
  const value = order.id ?? order.admin_graphql_api_id;
  return value ? String(value) : "";
}

function orderEmail(order: ShopifyOrder, fallbackEmail: string) {
  return order.email ?? order.contact_email ?? fallbackEmail;
}

function firstLine(order: ShopifyOrder) {
  return order.line_items?.[0];
}

function productIdFromLine(line: ShopifyLineItem | undefined) {
  return String(line?.product_id ?? line?.sku ?? "creatine-gummies");
}

async function fetchShopifyOrdersByEmail(email: string) {
  // Prefer a manually-managed admin token; fall back to the integration token.
  const token = process.env.SHOPIFY_ADMIN_TOKEN || process.env.SHOPIFY_ACCESS_TOKEN;
  if (!token) return { orders: [], error: "Shopify admin token not set" };

  const url =
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/orders.json` +
    `?status=any&email=${encodeURIComponent(email)}&limit=100`;

  const response = await fetch(url, {
    headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" },
  });

  if (!response.ok) return { orders: [], error: `Shopify returned ${response.status}` };

  const payload = (await response.json()) as { orders?: ShopifyOrder[] };
  return { orders: payload.orders ?? [], error: undefined };
}

export async function upsertShopifyOrdersForAccount({ email, userId }: SyncInput) {
  const attemptedAt = new Date().toISOString();
  const { orders, error } = await fetchShopifyOrdersByEmail(email);
  if (error) return { synced: 0, subscriptionsSynced: 0, error, attemptedAt, ok: false };
  if (orders.length === 0) return { synced: 0, subscriptionsSynced: 0, attemptedAt, ok: true };


  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const orderRows = orders
    .map((order) => {
      const id = orderId(order);
      if (!id) return null;
      const line = firstLine(order);
      return {
        shopify_order_id: id,
        user_id: userId,
        email: orderEmail(order, email),
        product_id: productIdFromLine(line),
        dose: 3,
        bags: numberOr(line?.quantity, 1),
        amount_eur: numberOr(order.total_price ?? order.current_total_price, 0),
        currency: String(order.currency ?? "SEK"),
        status: String(order.cancelled_at ? "cancelled" : order.financial_status ?? order.fulfillment_status ?? "paid"),
        ordered_at: order.processed_at ?? order.created_at ?? new Date().toISOString(),
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  if (orderRows.length > 0) {
    const { error: orderError } = await supabaseAdmin
      .from("orders")
      .upsert(orderRows, { onConflict: "shopify_order_id" });
    if (orderError) return { synced: 0, subscriptionsSynced: 0, error: orderError.message };
  }

  const subscriptionRows = orders
    .map((order) => {
      const id = orderId(order);
      const line = order.line_items?.find((item) => isSubscriptionLine(item));
      if (!id || !line) return null;
      const orderedAt = order.processed_at ?? order.created_at ?? new Date().toISOString();
      return {
        shopify_order_id: id,
        user_id: userId,
        email: orderEmail(order, email),
        product_id: productIdFromLine(line),
        dose: 3,
        status: order.cancelled_at ? "cancelled" : "active",
        price_eur: numberOr(line.price ?? order.total_price ?? order.current_total_price, 390),
        next_bill_at: addDays(orderedAt, 60),
        cancelled_at: order.cancelled_at ?? null,
        currency: String(order.currency ?? "SEK"),
        plan_title: line.variant_title ?? line.title ?? "Subscription",
        cadence_days: 60,
        last_synced_at: new Date().toISOString(),
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  if (subscriptionRows.length > 0) {
    const { error: subError } = await supabaseAdmin
      .from("subscriptions")
      .upsert(subscriptionRows, { onConflict: "shopify_order_id" });
    if (subError) return { synced: orderRows.length, subscriptionsSynced: 0, error: subError.message };
  }

  return { synced: orderRows.length, subscriptionsSynced: subscriptionRows.length };
}

export async function upsertShopifyWebhookOrder(order: ShopifyOrder) {
  const email = order.email ?? order.contact_email;
  const id = orderId(order);
  if (!id || !email) return { ok: true, skipped: true };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  let userId: string | null = null;
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();
  userId = profile?.id ?? null;

  const line = firstLine(order);
  const orderedAt = order.processed_at ?? order.created_at ?? new Date().toISOString();
  const { error: orderError } = await supabaseAdmin.from("orders").upsert(
    {
      shopify_order_id: id,
      user_id: userId,
      email,
      product_id: productIdFromLine(line),
      dose: 3,
      bags: numberOr(line?.quantity, 1),
      amount_eur: numberOr(order.total_price ?? order.current_total_price, 0),
      currency: String(order.currency ?? "SEK"),
      status: String(order.cancelled_at ? "cancelled" : order.financial_status ?? order.fulfillment_status ?? "paid"),
      ordered_at: orderedAt,
    },
    { onConflict: "shopify_order_id" },
  );

  if (orderError) return { ok: false, error: orderError.message };

  const subscriptionLine = order.line_items?.find((item) => isSubscriptionLine(item));
  if (!subscriptionLine) return { ok: true, skippedSubscription: true };

  const { error: subError } = await supabaseAdmin.from("subscriptions").upsert(
    {
      shopify_order_id: id,
      user_id: userId,
      email,
      product_id: productIdFromLine(subscriptionLine),
      dose: 3,
      status: order.cancelled_at ? "cancelled" : "active",
      price_eur: numberOr(subscriptionLine.price ?? order.total_price ?? order.current_total_price, 390),
      next_bill_at: addDays(orderedAt, 60),
      cancelled_at: order.cancelled_at ?? null,
      currency: String(order.currency ?? "SEK"),
      plan_title: subscriptionLine.variant_title ?? subscriptionLine.title ?? "Subscription",
      cadence_days: 60,
      last_synced_at: new Date().toISOString(),
    },
    { onConflict: "shopify_order_id" },
  );

  if (subError) return { ok: false, error: subError.message };
  return { ok: true };
}