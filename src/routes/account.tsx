import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import gumlabLogo from "@/assets/gumlab-logo.png.asset.json";
import performCover from "@/assets/perform-cover.png.asset.json";
import calmCover from "@/assets/calm-cover.png.asset.json";
import sleepCover from "@/assets/sleep-cover.png.asset.json";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your account · GumLab" },
      { name: "description", content: "Manage your GumLab subscriptions, orders, dose, and shipping details from one place." },
      { property: "og:title", content: "Your account · GumLab" },
      { property: "og:description", content: "Manage subscriptions and orders." },
      { property: "og:url", content: "https://gumlab.se/account" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://gumlab.se/account" }],
  }),
  component: AccountPage,
});

type ProductId = "perform" | "calm" | "recover";
type Sub = {
  id: string;
  product_id: ProductId;
  dose: 1 | 2 | 3;
  status: "active" | "paused" | "cancelled";
  price_eur: number;
  next_bill_at: string;
  created_at: string;
};
type Order = {
  id: string;
  product_id: ProductId;
  dose: number;
  bags: number;
  amount_eur: number;
  batch_code: string | null;
  status: string;
  ordered_at: string;
};
type Profile = {
  full_name: string | null;
  phone: string | null;
  shipping_line1: string | null;
  shipping_line2: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
};

const PRODUCT_META: Record<ProductId, { name: string; cover: string; accent: string; timeLabel: string }> = {
  perform: { name: "PERFORM", cover: performCover.url, accent: "var(--perform)", timeLabel: "Morning · 06:00" },
  calm: { name: "CALM", cover: calmCover.url, accent: "var(--calm)", timeLabel: "Anytime" },
  recover: { name: "SLEEP", cover: sleepCover.url, accent: "var(--recover)", timeLabel: "Night · 22:00" },
};

const PRICE: Record<ProductId, Partial<Record<1 | 2 | 3, number>>> = {
  perform: { 2: 45, 3: 63 },
  calm: { 1: 23, 2: 41 },
  recover: { 1: 25, 2: 45 },
};

const DOSE_OPTIONS: Record<ProductId, (1 | 2 | 3)[]> = {
  perform: [2, 3],
  calm: [1, 2],
  recover: [1, 2],
};


function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function AccountPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string>("");
  const [profile, setProfile] = useState<Profile>({
    full_name: "", phone: "", shipping_line1: "", shipping_line2: "", city: "", postal_code: "", country: "",
  });
  const [subs, setSubs] = useState<Sub[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<"subs" | "orders" | "profile">("subs");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate({ to: "/auth" });
        return;
      }
      setEmail(sess.session.user.email ?? "");
      await refresh();
      setLoading(false);
    })();
  }, [navigate]);

  async function refresh() {
    const [{ data: p }, { data: s }, { data: o }] = await Promise.all([
      supabase.from("profiles").select("full_name, phone, shipping_line1, shipping_line2, city, postal_code, country").maybeSingle(),
      supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("ordered_at", { ascending: false }),
    ]);
    if (p) setProfile({
      full_name: p.full_name ?? "", phone: p.phone ?? "",
      shipping_line1: p.shipping_line1 ?? "", shipping_line2: p.shipping_line2 ?? "",
      city: p.city ?? "", postal_code: p.postal_code ?? "", country: p.country ?? "",
    });
    if (s) setSubs(s as Sub[]);
    if (o) setOrders(o as Order[]);
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  async function updateSub(id: string, patch: Partial<Sub>) {
    await supabase.from("subscriptions").update(patch).eq("id", id);
    refresh();
  }

  async function changeDose(sub: Sub, dose: 1 | 2 | 3) {
    const price = PRICE[sub.product_id][dose] ?? sub.price_eur;
    await updateSub(sub.id, { dose, price_eur: price });
  }


  async function saveProfile() {
    setSaving(true);
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) return;
    await supabase.from("profiles").upsert({ id: sess.session.user.id, email, ...profile });
    setSaving(false);
  }

  const activeCount = useMemo(() => subs.filter((s) => s.status === "active").length, [subs]);
  const monthly = useMemo(
    () => subs.filter((s) => s.status === "active").reduce((a, s) => a + Number(s.price_eur), 0),
    [subs]
  );

  if (loading) {
    return <div className="min-h-screen bg-paper text-ink flex items-center justify-center text-sm text-muted-ink">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="hairline-b sticky top-0 z-40 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center">
            <img src={gumlabLogo.url} alt="GumLab" className="h-14 w-auto" />
          </Link>
          <div className="flex items-center gap-4 text-xs uppercase tracking-widest">
            <Link to="/" className="hover:opacity-70">Shop</Link>
            <button onClick={signOut} className="hairline px-3 py-2 hover:bg-paper-2">Sign out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mono text-[10px] uppercase tracking-[0.25em] text-muted-ink">Your account</div>
        <h1 className="mt-1 text-3xl">Hi{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.</h1>
        <p className="mt-1 text-sm text-muted-ink">{email}</p>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <Stat label="Active subs" value={String(activeCount)} />
          <Stat label="Per 28-day cycle" value={`€${monthly.toFixed(2).replace(/\.00$/, "")}`} />
          <Stat label="Orders" value={String(orders.length)} />
        </div>

        <div className="mt-10 flex gap-1 text-xs uppercase tracking-widest">
          {(["subs", "orders", "profile"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 ${tab === t ? "bg-ink text-paper" : "hairline hover:bg-paper-2"}`}
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
                body="Build your stack on the home page and subscribe to start."
                cta={<Link to="/" className="mt-3 inline-block bg-ink px-4 py-2 text-xs uppercase tracking-widest text-paper">Build your stack</Link>}
              />
            ) : (
              <div className="space-y-3">
                {subs.map((s) => (
                  <SubCard key={s.id} sub={s} onChangeDose={(d) => changeDose(s, d)} onUpdate={(p) => updateSub(s.id, p)} />
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "orders" && (
          <section className="mt-6">
            {orders.length === 0 ? (
              <EmptyState title="No orders yet" body="Once your first subscription bills, orders will appear here with batch codes and lab reports." />
            ) : (
              <div className="hairline divide-y divide-hairline overflow-hidden">
                {orders.map((o) => (
                  <div key={o.id} className="grid grid-cols-[auto,1fr,auto] items-center gap-4 bg-paper px-4 py-3">
                    <img src={PRODUCT_META[o.product_id].cover} alt="" className="h-12 w-12 object-contain" />
                    <div>
                      <div className="text-sm font-medium">{PRODUCT_META[o.product_id].name} · {o.bags} bag{o.bags > 1 ? "s" : ""}</div>
                      <div className="mono text-[10px] uppercase tracking-widest text-muted-ink">
                        {fmtDate(o.ordered_at)} · Batch {o.batch_code ?? "—"} · {o.status}
                      </div>
                    </div>
                    <div className="mono text-sm">€{Number(o.amount_eur).toFixed(2)}</div>
                  </div>
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
                className="bg-ink px-4 py-2 text-xs uppercase tracking-widest text-paper disabled:opacity-60"
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
    <div className="hairline bg-paper p-4">
      <div className="mono text-[10px] uppercase tracking-[0.25em] text-muted-ink">{label}</div>
      <div className="mt-1 mono text-2xl">{value}</div>
    </div>
  );
}

function EmptyState({ title, body, cta }: { title: string; body: string; cta?: React.ReactNode }) {
  return (
    <div className="hairline bg-paper p-10 text-center">
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-1 text-xs text-muted-ink">{body}</div>
      {cta}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <div className="mono text-[10px] uppercase tracking-[0.25em] text-muted-ink">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="hairline mt-1 w-full bg-paper px-3 py-2 text-sm outline-none focus:border-ink" />
    </label>
  );
}

function SubCard({
  sub, onChangeDose, onUpdate,
}: {
  sub: Sub;
  onChangeDose: (d: 1 | 2) => void;
  onUpdate: (p: Partial<Sub>) => void;
}) {
  const meta = PRODUCT_META[sub.product_id];
  const cancelled = sub.status === "cancelled";
  const paused = sub.status === "paused";
  return (
    <div className="hairline bg-paper p-4">
      <div className="grid grid-cols-[auto,1fr,auto] items-center gap-4">
        <img src={meta.cover} alt="" className="h-16 w-16 object-contain" />
        <div>
          <div className="flex items-center gap-2">
            <div className="text-base font-medium">{meta.name}</div>
            <span
              className="mono text-[10px] uppercase tracking-widest px-2 py-0.5"
              style={{ background: cancelled ? "transparent" : meta.accent, color: cancelled ? "var(--muted-ink)" : "var(--paper)", border: cancelled ? "1px solid var(--hairline)" : "none" }}
            >
              {sub.status}
            </span>
          </div>
          <div className="mono text-[10px] uppercase tracking-widest text-muted-ink mt-1">
            {meta.timeLabel} · {sub.dose} gummy/day · {sub.dose} bag{sub.dose > 1 ? "s" : ""} per 28-day cycle
          </div>
          <div className="mono text-[10px] uppercase tracking-widest text-muted-ink">
            {cancelled ? "Cancelled" : `Next bill: ${fmtDate(sub.next_bill_at)}`}
          </div>
        </div>
        <div className="text-right">
          <div className="mono text-lg">€{Number(sub.price_eur).toFixed(2)}</div>
          <div className="mono text-[10px] uppercase tracking-widest text-muted-ink">per 28-day cycle</div>
        </div>
      </div>

      {!cancelled && (
        <div className="hairline-t mt-4 pt-4 flex flex-wrap items-center gap-2">
          <div className="mono text-[10px] uppercase tracking-widest text-muted-ink mr-1">Dose</div>
          {[1, 2].map((d) => (
            <button
              key={d}
              onClick={() => onChangeDose(d as 1 | 2)}
              className={`px-3 py-1.5 text-xs ${sub.dose === d ? "bg-ink text-paper" : "hairline hover:bg-paper-2"}`}
            >
              {d} gummy/day
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            {paused ? (
              <button onClick={() => onUpdate({ status: "active" })} className="hairline px-3 py-1.5 text-xs hover:bg-paper-2">Resume</button>
            ) : (
              <button onClick={() => onUpdate({ status: "paused" })} className="hairline px-3 py-1.5 text-xs hover:bg-paper-2">Pause</button>
            )}
            <button
              onClick={() => {
                if (confirm("Cancel this subscription? You can restart anytime.")) {
                  onUpdate({ status: "cancelled", cancelled_at: new Date().toISOString() } as Partial<Sub>);
                }
              }}
              className="hairline px-3 py-1.5 text-xs hover:bg-paper-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
