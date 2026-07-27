import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  getAccountOverview,
  requestOrderCancellation,
  saveAccountProfile,
  updateSubscriptionStatus,
  type AccountProfile,
} from "@/lib/orders.functions";
import gumlabLogo from "@/assets/gumlab-logo.png.asset.json";
import creatineCover from "@/assets/creatine-cover.png.asset.json";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your account · GumLab" },
      { name: "description", content: "Manage your GumLab creatine gummies subscription, orders and shipping details." },
      { property: "og:title", content: "Your account · GumLab" },
      { property: "og:description", content: "Manage your creatine gummies subscription." },
      { property: "og:url", content: "https://gumlab.se/account" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://gumlab.se/account" }],
  }),
  component: AccountPage,
});

const SUB_PRICE_SEK = 385;

type Sub = {
  id: string;
  product_id: string;
  dose: number;
  status: "active" | "paused" | "cancelled";
  price_eur: number; // legacy column name — displayed in the row currency
  next_bill_at: string;
  created_at: string;
  cancelled_at?: string | null;
  currency?: string;
  plan_title?: string | null;
  cadence_days?: number;
  shopify_order_id?: string | null;
};
type OrderAddress = {
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  zip?: string | null;
  country?: string | null;
  phone?: string | null;
};
type OrderDetails = {
  order_name?: string | null;
  order_number?: number | string | null;
  order_status_url?: string | null;
  subtotal?: number;
  discount_total?: number;
  shipping_total?: number;
  total_tax?: number;
  total?: number;
  currency?: string;
  financial_status?: string | null;
  fulfillment_status?: string | null;
  payment_gateways?: string[];
  discount_codes?: { code?: string | null; amount?: string | number | null; type?: string | null }[];
  shipping_address?: OrderAddress | null;
  billing_address?: OrderAddress | null;
  line_items?: { title?: string | null; variant_title?: string | null; quantity?: number; price?: number; sku?: string | null }[];
  fulfillment?: {
    status?: string | null;
    shipment_status?: string | null;
    tracking_number?: string | null;
    tracking_url?: string | null;
    tracking_company?: string | null;
    estimated_delivery_at?: string | null;
  } | null;
};
type Order = {
  id: string;
  product_id: string;
  dose: number;
  bags: number;
  amount_eur: number;
  batch_code: string | null;
  status: string;
  ordered_at: string;
  currency?: string;
  shopify_order_id?: string | null;
  order_number?: string | null;
  fulfillment_status?: string | null;
  details?: OrderDetails | null;
};

type Profile = AccountProfile;

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("sv-SE", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtSEK(n: number) {
  return `${Number(n).toLocaleString("sv-SE")} SEK`;
}

function AccountPage() {
  const navigate = useNavigate();
  const loadAccount = useServerFn(getAccountOverview);
  const saveProfileFn = useServerFn(saveAccountProfile);
  const updateSubFn = useServerFn(updateSubscriptionStatus);
  const requestOrderCancelFn = useServerFn(requestOrderCancellation);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string>("");
  const [profile, setProfile] = useState<Profile>({
    full_name: "", phone: "", shipping_line1: "", shipping_line2: "", city: "", postal_code: "", country: "",
  });
  const [subs, setSubs] = useState<Sub[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<"subs" | "orders" | "profile">("subs");
  const [saving, setSaving] = useState(false);
  const [syncNote, setSyncNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate({ to: "/auth" });
        return;
      }
      await refresh();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  async function refresh() {
    setError(null);
    try {
      const data = await loadAccount();
      setEmail(data.email ?? "");
      setProfile({
        full_name: data.profile.full_name ?? "",
        phone: data.profile.phone ?? "",
        shipping_line1: data.profile.shipping_line1 ?? "",
        shipping_line2: data.profile.shipping_line2 ?? "",
        city: data.profile.city ?? "",
        postal_code: data.profile.postal_code ?? "",
        country: data.profile.country ?? "",
      });
      setSubs(data.subscriptions as Sub[]);
      setOrders(data.orders as Order[]);
      const sync = data.sync as { error?: string } | undefined;
      if (sync?.error) {
        setSyncNote("Order sync is temporarily unavailable. Saved account data is still shown.");
      } else {
        setSyncNote(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load account");
    } finally {
      setLoading(false);
    }
  }


  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  async function updateSub(id: string, status: "active" | "paused" | "cancelled") {
    setError(null);
    try {
      const result = await updateSubFn({ data: { id, status } });
      setSubs((current) => current.map((sub) => (sub.id === id ? (result.subscription as Sub) : sub)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update subscription");
    }
  }

  async function requestCancelOrder(id: string) {
    setError(null);
    try {
      const result = await requestOrderCancelFn({ data: { id } });
      setOrders((current) => current.map((order) => (order.id === id ? (result.order as Order) : order)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update order");
    }
  }

  async function saveProfile() {
    setSaving(true);
    setError(null);
    try {
      const result = await saveProfileFn({ data: profile });
      setProfile({
        full_name: result.profile.full_name ?? "",
        phone: result.profile.phone ?? "",
        shipping_line1: result.profile.shipping_line1 ?? "",
        shipping_line2: result.profile.shipping_line2 ?? "",
        city: result.profile.city ?? "",
        postal_code: result.profile.postal_code ?? "",
        country: result.profile.country ?? "",
      });
      setSyncNote("Profile saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  const activeCount = useMemo(() => subs.filter((s) => s.status === "active").length, [subs]);
  const bimonthly = useMemo(
    () => subs.filter((s) => s.status === "active").reduce((a, s) => a + Number(s.price_eur), 0),
    [subs]
  );

  if (loading) {
    return <div className="min-h-screen bg-paper text-ink flex items-center justify-center text-sm text-muted-ink">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-40 border-b border-hairline/60 bg-paper/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center">
            <img src={gumlabLogo.url} alt="GumLab" className="h-14 w-auto" />
          </Link>
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest">
            <Link to="/" className="hover:opacity-70">Shop</Link>
            <button onClick={signOut} className="rounded-full border border-hairline px-4 py-2 hover:bg-paper-2">Sign out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mono text-[10px] uppercase tracking-[0.28em] text-muted-ink">Your account</div>
        <h1 className="mt-1 font-display text-3xl md:text-4xl">
          Hi{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.
        </h1>
        <p className="mt-1 text-sm text-muted-ink">{email}</p>
        {syncNote && (
          <div className="mt-4 rounded-2xl border border-hairline bg-card px-4 py-3 text-sm text-muted-ink">
            {syncNote}
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-2xl border border-cta-rose/40 bg-cta-rose/10 px-4 py-3 text-sm text-cta-rose">
            {error}
          </div>
        )}

        <div className="mt-8 grid grid-cols-3 gap-3">
          <Stat label="Active subs" value={String(activeCount)} />
          <Stat label="Per 60-day cycle" value={fmtSEK(bimonthly)} />
          <Stat label="Orders" value={String(orders.length)} />
        </div>

        <div className="mt-10 flex flex-wrap gap-2 text-xs uppercase tracking-widest">
          {(["subs", "orders", "profile"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-2 transition ${
                tab === t ? "bg-ink text-paper" : "border border-hairline hover:bg-paper-2"
              }`}
            >
              {t === "subs" ? "Subscriptions" : t === "orders" ? "Orders" : "Profile"}
            </button>
          ))}
        </div>

        {tab === "subs" && (
          <section className="mt-6">
            {subs.length === 0 ? (
              <EmptyState
                title="No subscriptions yet"
                body="Subscribe to Creatine Gummies to start."
                cta={<Link to="/" className="mt-4 inline-block rounded-full bg-ink px-5 py-2 text-xs uppercase tracking-widest text-paper">Shop now</Link>}
              />
            ) : (
              <div className="space-y-3">
                {subs.map((s) => (
                  <SubCard key={s.id} sub={s} onUpdate={(status) => updateSub(s.id, status)} />
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "orders" && (
          <section className="mt-6">
            {orders.length === 0 ? (
              <EmptyState title="No orders yet" body="Your first order will appear here once it ships." />
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <OrderCard key={o.id} order={o} onRequestCancel={() => requestCancelOrder(o.id)} />
                ))}
              </div>
            )}
          </section>
        )}


        {tab === "profile" && (
          <section className="mt-6 max-w-xl">
            <div className="space-y-3">
              <Field label="Full name" value={profile.full_name ?? ""} onChange={(v) => setProfile({ ...profile, full_name: v })} />
              <Field label="Phone" value={profile.phone ?? ""} onChange={(v) => setProfile({ ...profile, phone: v })} />
              <Field label="Address line 1" value={profile.shipping_line1 ?? ""} onChange={(v) => setProfile({ ...profile, shipping_line1: v })} />
              <Field label="Address line 2" value={profile.shipping_line2 ?? ""} onChange={(v) => setProfile({ ...profile, shipping_line2: v })} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="City" value={profile.city ?? ""} onChange={(v) => setProfile({ ...profile, city: v })} />
                <Field label="Postal code" value={profile.postal_code ?? ""} onChange={(v) => setProfile({ ...profile, postal_code: v })} />
              </div>
              <Field label="Country" value={profile.country ?? ""} onChange={(v) => setProfile({ ...profile, country: v })} />
              <button
                onClick={saveProfile}
                disabled={saving}
                className="rounded-full bg-ink px-6 py-2.5 text-xs uppercase tracking-widest text-paper disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save profile"}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-hairline bg-card p-4">
      <div className="mono text-[10px] uppercase tracking-[0.25em] text-muted-ink">{label}</div>
      <div className="mono mt-1 text-2xl">{value}</div>
    </div>
  );
}

function EmptyState({ title, body, cta }: { title: string; body: string; cta?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-hairline bg-card p-10 text-center">
      <div className="font-display text-lg">{title}</div>
      <div className="mt-1 text-sm text-muted-ink">{body}</div>
      {cta}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <div className="mono text-[10px] uppercase tracking-[0.25em] text-muted-ink">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-hairline bg-paper px-4 py-2.5 text-sm outline-none transition focus:border-ink" />
    </label>
  );
}

function SubCard({ sub, onUpdate }: { sub: Sub; onUpdate: (status: "active" | "paused" | "cancelled") => void }) {
  const cancelled = sub.status === "cancelled";
  const paused = sub.status === "paused";
  return (
    <div className="rounded-3xl border border-hairline bg-card p-5">
      <div className="grid grid-cols-[auto,1fr,auto] items-center gap-4">
        <img src={creatineCover.url} alt="" className="h-16 w-16 object-contain" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-display text-lg">Creatine Gummies</div>
            <span
              className="mono rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest"
              style={{
                background: cancelled ? "transparent" : "var(--ink)",
                color: cancelled ? "var(--muted-ink)" : "var(--paper)",
                border: cancelled ? "1px solid var(--hairline)" : "none",
              }}
            >
              {sub.status}
            </span>
          </div>
          <div className="mono mt-1 text-[10px] uppercase tracking-widest text-muted-ink">
            {sub.plan_title ?? "Subscription"} · 3 gummies / day · 180 gummies
          </div>
          <div className="mono text-[10px] uppercase tracking-widest text-muted-ink">
            {cancelled ? "Cancelled" : `Next delivery: ${fmtDate(sub.next_bill_at)}`}
          </div>
        </div>
        <div className="text-right">
          <div className="mono text-lg">{fmtSEK(sub.price_eur || SUB_PRICE_SEK)}</div>
          <div className="mono text-[10px] uppercase tracking-widest text-muted-ink">every {sub.cadence_days ?? 60} days</div>
        </div>
      </div>

      {!cancelled && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-hairline pt-4">
          {paused ? (
            <button onClick={() => onUpdate("active")} className="rounded-full border border-hairline px-4 py-2 text-xs hover:bg-paper-2">Resume</button>
          ) : (
            <button onClick={() => onUpdate("paused")} className="rounded-full border border-hairline px-4 py-2 text-xs hover:bg-paper-2">Pause</button>
          )}
          <button
            onClick={() => {
              if (confirm("Cancel this subscription? You can restart anytime.")) {
                onUpdate("cancelled");
              }
            }}
            className="rounded-full border border-hairline px-4 py-2 text-xs hover:bg-paper-2"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}


