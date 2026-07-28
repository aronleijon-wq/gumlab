import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  createCheckoutSessionForMode,
  createStripeBillingPortal,
  resolveStripeCustomerForAccount,
} from "./stripe-api.server";

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
    return createCheckoutSessionForMode(data);
  });

/**
 * Creates a Stripe Billing Portal session so signed-in customers can manage
 * their subscription, payment method, and invoices.
 */
export const createBillingPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = (context.claims as { email?: string } | undefined)?.email;
    const { customerId, error } = await resolveStripeCustomerForAccount({
      supabase: context.supabase,
      email,
      userId: context.userId,
    });

    if (!customerId) {
      throw new Error(error ?? "No Stripe checkout found for this account yet.");
    }

    return createStripeBillingPortal(customerId);
  });
