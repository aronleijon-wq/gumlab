import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { upsertShopifyOrdersForAccount } from "./orders.server";

export type AccountProfile = {
  full_name: string | null;
  phone: string | null;
  shipping_line1: string | null;
  shipping_line2: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
};

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
    return upsertShopifyOrdersForAccount({ email, userId: context.userId });
  });

export const getAccountOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = (context.claims?.email as string | undefined) ?? "";
    const sync = email ? await upsertShopifyOrdersForAccount({ email, userId: context.userId }) : { synced: 0 };

    const [{ data: profile, error: profileError }, { data: subscriptions, error: subError }, { data: orders, error: orderError }] =
      await Promise.all([
        context.supabase
          .from("profiles")
          .select("full_name, phone, shipping_line1, shipping_line2, city, postal_code, country")
          .eq("id", context.userId)
          .maybeSingle(),
        context.supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
        context.supabase.from("orders").select("*").order("ordered_at", { ascending: false }),
      ]);

    if (profileError) throw new Error(profileError.message);
    if (subError) throw new Error(subError.message);
    if (orderError) throw new Error(orderError.message);

    return {
      email,
      sync,
      profile: profile ?? {
        full_name: null,
        phone: null,
        shipping_line1: null,
        shipping_line2: null,
        city: null,
        postal_code: null,
        country: null,
      },
      subscriptions: subscriptions ?? [],
      orders: orders ?? [],
    };
  });

export const saveAccountProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        full_name: z.string().max(120).nullable().optional(),
        phone: z.string().max(40).nullable().optional(),
        shipping_line1: z.string().max(180).nullable().optional(),
        shipping_line2: z.string().max(180).nullable().optional(),
        city: z.string().max(100).nullable().optional(),
        postal_code: z.string().max(40).nullable().optional(),
        country: z.string().max(100).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const email = (context.claims?.email as string | undefined) ?? null;
    const { data: profile, error } = await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, email, ...data })
      .select("full_name, phone, shipping_line1, shipping_line2, city, postal_code, country")
      .single();

    if (error) throw new Error(error.message);
    return { profile };
  });

export const updateSubscriptionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["active", "paused", "cancelled"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const patch = data.status === "cancelled"
      ? { status: data.status, cancelled_at: new Date().toISOString() }
      : { status: data.status, cancelled_at: null };

    const { data: subscription, error } = await context.supabase
      .from("subscriptions")
      .update(patch)
      .eq("id", data.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return { subscription };
  });

export const requestOrderCancellation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: order, error } = await context.supabase
      .from("orders")
      .update({ status: "cancel_requested" })
      .eq("id", data.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return { order };
  });
