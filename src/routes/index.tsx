import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import sleepCover from "@/assets/sleep-cover.png.asset.json";
import calmCover from "@/assets/calm-cover.png.asset.json";
import performCover from "@/assets/perform-cover.png.asset.json";
import gumlabLogo from "@/assets/gumlab-logo.png.asset.json";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";

const OG_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/nGL6NvM1vUQWq9gkC6u6fSG8FWA3/social-images/social-1784754043982-ChatGPT_Image_22_juli_2026_22_26_50.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GumLab — Precisely-dosed functional gummies, batch tested" },
      { name: "description", content: "Three clinically-focused wellness gummies — PERFORM, CALM, SLEEP. 28-gummy bags on a 28-day cycle, every batch third-party assayed and published." },
      { property: "og:title", content: "GumLab — Precisely-dosed functional gummies, batch tested" },
      { property: "og:description", content: "PERFORM, CALM, SLEEP — precisely-dosed European wellness gummies with a published Certificate of Analysis for every batch." },
      { property: "og:url", content: "https://gumlab.se/" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:title", content: "GumLab — Precisely-dosed functional gummies" },
      { name: "twitter:description", content: "PERFORM, CALM, SLEEP — third-party batch-tested gummies on a 28-day cycle." },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: "https://gumlab.se/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Product",
              name: "PERFORM",
              description: "Creatine monohydrate gummies. Supports performance in high-intensity exercise.",
              brand: { "@type": "Brand", name: "GumLab" },
              offers: { "@type": "Offer", price: "25.00", priceCurrency: "EUR", availability: "https://schema.org/PreOrder" },
            },
            {
              "@type": "Product",
              name: "CALM",
              description: "Ashwagandha (KSM-66) + L-theanine gummies. Contributes to a sense of calm.",
              brand: { "@type": "Brand", name: "GumLab" },
              offers: { "@type": "Offer", price: "23.00", priceCurrency: "EUR", availability: "https://schema.org/PreOrder" },
            },
            {
              "@type": "Product",
              name: "SLEEP",
              description: "Magnesium + melatonin gummies. Contributes to a normal wind-down routine.",
              brand: { "@type": "Brand", name: "GumLab" },
              offers: { "@type": "Offer", price: "25.00", priceCurrency: "EUR", availability: "https://schema.org/PreOrder" },
            },
            {
              "@type": "FAQPage",
              mainEntity: [
                { "@type": "Question", name: "Why 28-day cycles instead of monthly?", acceptedAnswer: { "@type": "Answer", text: "Each bag is exactly 28 gummies, so a 28-day cycle means one bag equals one cycle at 1/day — 13 shipments per year rather than 12." } },
                { "@type": "Question", name: "Can I change my dose or pause?", acceptedAnswer: { "@type": "Answer", text: "Yes. Dose (1/day vs 2/day) can be changed between cycles from your account. Pause, skip, or cancel anytime with no fee." } },
                { "@type": "Question", name: "How is every batch verified?", acceptedAnswer: { "@type": "Answer", text: "An independent EU-accredited laboratory assays potency, heavy metals, and microbial content before shipping. The Certificate of Analysis is published on the product page." } },
                { "@type": "Question", name: "Shipping and returns?", acceptedAnswer: { "@type": "Answer", text: "Free EU shipping over €40, otherwise €3.90. Ships within 24h. 30-day satisfaction guarantee." } },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: Index,
});

type ProductId = "perform" | "calm" | "recover";
type Dose = 1 | 2;
type PurchaseMode = "subscribe" | "onetime";

const ONETIME_MARKUP = 0.35; // +35% vs subscription

type Product = {
  id: ProductId;
  name: string;
  timeTag: string;
  timeLabel: string;
  ingredient: string;
  dose: string;
  claim: string;
  price1: number;
  price2: number;
  accent: string;
  batch: string;
  potency: string;
  lab: string;
  description: string;
  badge?: string;
  cover?: string;
};

const PRODUCTS: Product[] = [
  {
    id: "perform",
    name: "PERFORM",
    timeTag: "06:00",
    timeLabel: "Morning",
    ingredient: "Creatine monohydrate",
    dose: "3 g",
    claim: "Supports performance in high-intensity exercise.",
    price1: 25,
    price2: 45,
    accent: "var(--perform)",
    batch: "PF-26-0001",
    potency: "99.4%",
    lab: "Independent EU-accredited laboratory",
    description:
      "One well-studied compound, no proprietary blend, no stimulants. The kind of gummy you take because it's Tuesday, not because it's exciting.",
    badge: "Hero product",
    cover: performCover.url,
  },
  {
    id: "calm",
    name: "CALM",
    timeTag: "Anytime",
    timeLabel: "Anytime",
    ingredient: "Ashwagandha (KSM-66) + L-theanine",
    dose: "300 mg / 100 mg",
    claim: "Contributes to a sense of calm.",
    price1: 23,
    price2: 41,
    accent: "var(--calm)",
    batch: "CA-26-0001",
    potency: "101.2%",
    lab: "Independent EU-accredited laboratory",
    description:
      "Standardised KSM-66 root extract paired with L-theanine. Take it when the day is asking a bit much of you.",
    cover: calmCover.url,
  },
  {
    id: "recover",
    name: "SLEEP",
    timeTag: "22:00",
    timeLabel: "Night",
    ingredient: "Magnesium bisglycinate + melatonin",
    dose: "200 mg / 0.5 mg",
    claim: "Contributes to a normal wind-down routine and supports normal muscle function.",
    price1: 25,
    price2: 45,
    accent: "var(--recover)",
    batch: "RC-26-0001",
    potency: "98.7%",
    lab: "Independent EU-accredited laboratory",
    description:
      "A low, considered dose of melatonin with chelated magnesium. Built for the last hour of the day, not the first.",
    badge: "New batch",
    cover: sleepCover.url,
  },
];

function fmt(n: number) {
  return n.toFixed(2).replace(/\.00$/, "");
}

function Index() {
  const [stack, setStack] = useState<Record<ProductId, { on: boolean; dose: Dose }>>({
    perform: { on: false, dose: 1 },
    calm: { on: false, dose: 1 },
    recover: { on: false, dose: 1 },
  });
  const [mode, setMode] = useState<PurchaseMode>("subscribe");

  const selected = PRODUCTS.filter((p) => stack[p.id].on);
  const subtotal = selected.reduce(
    (sum, p) => sum + (stack[p.id].dose === 2 ? p.price2 : p.price1),
    0
  );
  const discountPct =
    mode === "subscribe" ? (selected.length === 3 ? 20 : selected.length === 2 ? 10 : 0) : 0;
  const markupPct = mode === "onetime" ? Math.round(ONETIME_MARKUP * 100) : 0;
  const cycleTotal =
    mode === "onetime"
      ? subtotal * (1 + ONETIME_MARKUP)
      : subtotal * (1 - discountPct / 100);
  const annual = cycleTotal * 13;
  const bagsPerCycle = selected.reduce((s, p) => s + stack[p.id].dose, 0);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <SubscribeStrip />
      <AnnouncementBar />
      <Nav cartCount={selected.length} cartTotal={cycleTotal} />
      <Hero />
      <TrustRow />
      
      <ProductGrid stack={stack} setStack={setStack} />
      <Verification />
      <Reviews />
      <StackBuilder
        stack={stack}
        setStack={setStack}
        mode={mode}
        setMode={setMode}
        subtotal={subtotal}
        discountPct={discountPct}
        markupPct={markupPct}
        cycleTotal={cycleTotal}
        annual={annual}
        bagsPerCycle={bagsPerCycle}
        selectedCount={selected.length}
      />
      <Faq />
      <About />
      <Footer />
      {selected.length > 0 && (
        <StickyCart count={selected.length} total={cycleTotal} isSub={mode === "subscribe"} />
      )}
    </div>
  );
}

function AnnouncementBar() {
  const items = [
    "Free EU shipping over €40",
    "Third-party assayed · every batch",
    "Pause or cancel anytime",
    "SHIPS WITHIN 24H FROM SWEDEN",
  ];
  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 overflow-hidden px-6 py-2 text-[10px] uppercase tracking-[0.2em]">
        {items.map((t, i) => (
          <span key={t} className={`mono ${i > 1 ? "hidden md:inline" : ""}`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function SubscribeStrip() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading" || !email.trim()) return;
    setStatus("loading");
    setMessage("");
    const { error } = await supabase.from("newsletter_signups").insert({
      email: email.trim().toLowerCase(),
      source: "top-strip",
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
    if (error) {
      const dup = error.code === "23505" || /duplicate/i.test(error.message);
      setStatus(dup ? "ok" : "error");
      setMessage(dup ? "You're already on the list." : error.message);
      if (dup) setEmail("");
    } else {
      setStatus("ok");
      setMessage("Thanks — you're on the list.");
      setEmail("");
    }
  }

  return (
    <section className="bg-ink text-paper">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-3 sm:flex-row sm:gap-6">
        <div className="text-center sm:text-left">
          <p className="font-display text-sm font-semibold uppercase tracking-wide">
            First launch drops soon
          </p>
          <p className="mono text-[10px] uppercase tracking-widest text-paper/70">
            Batch releases, lab reports, no spam
          </p>
        </div>
        <form onSubmit={onSubmit} className="flex w-full max-w-sm items-center overflow-hidden border border-paper/20 bg-paper/5 sm:w-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={status === "loading"}
            className="mono flex-1 bg-transparent px-3 py-2 text-xs text-paper outline-none placeholder:text-paper/50 sm:flex-none"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-brand px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-ink hover:opacity-90 disabled:opacity-60"
          >
            {status === "loading" ? "…" : "Notify me"}
          </button>
        </form>
      </div>
      {status !== "idle" && status !== "loading" && (
        <div className="mono border-t border-paper/10 px-6 py-1.5 text-center text-[10px] uppercase tracking-widest text-paper/80">
          {message}
        </div>
      )}
    </section>
  );
}

function Nav({ cartCount, cartTotal }: { cartCount: number; cartTotal: number }) {
  const { user, loading } = useSession();
  return (
    <header className="hairline-b sticky top-0 z-40 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center" aria-label="GumLab">
          <img src={gumlabLogo.url} alt="GumLab" className="h-20 w-auto" />
        </a>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <a href="#products" className="hover:opacity-70">Shop</a>
          <a href="#verification" className="hover:opacity-70">Verification</a>
          <a href="#reviews" className="hover:opacity-70">Reviews</a>
          <a href="#faq" className="hover:opacity-70">FAQ</a>
          <a href="#about" className="hover:opacity-70">About us</a>
        </nav>
        <div className="flex items-center gap-2">
          {!loading && (
            user ? (
              <Link to="/account" className="hairline px-3 py-2 text-xs uppercase tracking-widest hover:bg-paper-2">
                Account
              </Link>
            ) : (
              <Link to="/auth" className="hairline px-3 py-2 text-xs uppercase tracking-widest hover:bg-paper-2">
                Sign in
              </Link>
            )
          )}
          <a
            href="#stack"
            aria-label={`Cart: ${cartCount} item${cartCount === 1 ? "" : "s"}, €${fmt(cartTotal)} per 28-day cycle`}
            className="hairline flex items-center gap-2 bg-ink px-4 py-2 text-xs font-medium uppercase tracking-widest text-paper hover:opacity-90"
          >
            <span>Cart</span>
            <span className="mono border-l border-paper/30 pl-2">
              {cartCount} · €{fmt(cartTotal)}
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 15% 20%, rgba(181,101,46,0.18) 0%, transparent 45%), radial-gradient(ellipse at 85% 30%, rgba(46,42,84,0.20) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(84,97,63,0.22) 0%, transparent 55%)",
      }}
    >
      {/* colorful blurred blobs behind everything */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-80 w-80 blob"
        style={{ background: "#B5652E", opacity: 0.25, filter: "blur(60px)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-6rem] top-24 h-96 w-96 blob"
        style={{ background: "#2E2A54", opacity: 0.22, filter: "blur(70px)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-4rem] left-1/3 h-72 w-72 blob"
        style={{ background: "#54613F", opacity: 0.28, filter: "blur(65px)" }}
      />

      <div className="relative mx-auto max-w-7xl px-6 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="grid items-center gap-10 md:grid-cols-[1.15fr_1fr] md:gap-8">
          {/* Left: rotating 3D Perform batch */}
          <div
            className="relative flex items-center justify-center py-4 md:-ml-10 md:min-h-[640px]"
            style={{ perspective: "1600px" }}
          >
            {/* focused spotlight behind bag */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 55%, rgba(255,251,235,0.9) 0%, rgba(245,244,230,0.6) 30%, transparent 60%)",
              }}
            />
            {/* multi-color halo */}
            <div
              aria-hidden
              className="halo pointer-events-none absolute inset-8"
              style={{
                background:
                  "radial-gradient(circle at 30% 40%, rgba(181,101,46,0.55) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(216,242,78,0.4) 0%, transparent 55%), radial-gradient(circle at 50% 80%, rgba(84,97,63,0.35) 0%, transparent 60%)",
                filter: "blur(18px)",
              }}
            />
            <div
              aria-hidden
              className="contact-shadow absolute left-1/2 bottom-0 h-10 w-[78%] -translate-x-1/2 rounded-[50%] bg-ink"
            />
            <img
              src={performCover.url}
              alt="PERFORM batch — creatine gummies"
              className="spin3d relative w-full max-w-[720px] select-none md:scale-125"
              draggable={false}
              style={{
                mixBlendMode: "multiply",
                filter:
                  "contrast(1.12) saturate(1.1) drop-shadow(0 42px 34px rgba(21,20,15,0.34)) drop-shadow(0 10px 14px rgba(21,20,15,0.22))",
              }}
            />

            <div
              className="mono absolute left-4 top-4 px-2 py-1 text-[10px] uppercase tracking-widest text-paper"
              style={{ background: "#B5652E", borderRadius: 3 }}
            >
              Batch PF-26-0001 · 99.4%
            </div>
          </div>

          {/* Right: copy */}
          <div>
            <div className="mb-5 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-ink">
              <span
                className="mono px-2 py-0.5 text-paper"
                style={{ background: "#2E2A54", borderRadius: 2 }}
              >
                EU / 001
              </span>
              <span className="hairline-t inline-block h-px w-8" />
              <span>Third-party assayed</span>
            </div>
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-ink md:text-6xl">
              <span style={{ color: "#B5652E" }}>Morning.</span>{" "}
              <span style={{ color: "#54613F" }}>Anytime.</span>{" "}
              <span style={{ color: "#2E2A54" }}>Night.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-ink">
              Three gummies for the shape of your day. Precisely dosed,
              independently assayed, delivered in{" "}
              <span className="mono text-ink">28</span>-day bags.
            </p>

            {/* colorful day-arc chips */}
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { t: "06:00", l: "Perform", c: "#B5652E" },
                { t: "Anytime", l: "Calm", c: "#54613F" },
                { t: "22:00", l: "Sleep", c: "#2E2A54" },
              ].map((c) => (
                <div
                  key={c.l}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-paper"
                  style={{ background: c.c, borderRadius: 3 }}
                >
                  <span className="mono">{c.t}</span>
                  <span className="uppercase tracking-widest">{c.l}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#stack"
                className="hairline bg-brand px-6 py-3 text-sm font-bold uppercase tracking-widest text-ink shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
              >
                Shop the stack →
              </a>
              <a
                href="#verification"
                className="hairline px-5 py-3 text-sm font-medium uppercase tracking-widest text-ink hover:bg-paper-2"
              >
                Lab results
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function TrustRow() {
  const items = [
    { k: "Free EU shipping 🚚", v: "Orders over €40", color: "#B5652E" },
    { k: "60-day guarantee ✅", v: "Full refund, no questions", color: "#54613F" },
    { k: "Cancel anytime ❌", v: "Manage from your dashboard", color: "#2E2A54" },
    { k: "Batch certificate", v: "Ships with every order", color: "#B5652E" },
    { k: "Third-party assayed", v: "Every batch, every time", color: "#54613F" },
    { k: "Made in EU 🇪🇺", v: "GMP-certified facilities", color: "#2E2A54" },
    { k: "28-day cycle", v: "One bag, one cycle", color: "#B5652E" },
    { k: "No hidden additives", v: "Clean, disclosed formulas", color: "#54613F" },
  ];
  const loop = [...items, ...items];
  return (
    <section
      className="hairline-t hairline-b relative overflow-hidden"
      style={{
        background:
          "linear-gradient(90deg, #EDEAE2 0%, #E6E0D0 25%, #E4E4DC 50%, #E0DAE4 75%, #EDEAE2 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24"
        style={{ background: "linear-gradient(90deg, #EDEAE2, transparent)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24"
        style={{ background: "linear-gradient(270deg, #EDEAE2, transparent)" }}
      />
      <div className="marquee-track flex w-max">
        {loop.map((it, i) => (
          <div
            key={i}
            className="flex w-[280px] shrink-0 items-start gap-4 border-l border-hairline px-6 py-7"
          >
            <span
              className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: it.color, boxShadow: `0 0 0 4px ${it.color}22` }}
              aria-hidden
            />
            <div>
              <div className="mono text-[10px] uppercase tracking-widest" style={{ color: it.color }}>
                0{(i % items.length) + 1}
              </div>
              <div className="mt-1.5 text-sm font-medium">{it.k}</div>
              <div className="mt-1 text-xs text-muted-ink">{it.v}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


function Verification() {
  return (
    <section id="verification" className="hairline-t mx-auto max-w-7xl px-6 py-24 md:py-32">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">
        <div>
          <div className="mono mb-6 text-xs uppercase tracking-[0.2em] text-muted-ink">
            § 03 — Verification
          </div>
          <h2 className="font-display text-4xl leading-tight md:text-5xl">
            The functional gummy category has a dosing problem.
          </h2>
          <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-ink">
            <p>
              Independent testing has repeatedly found gummy supplements containing a fraction of
              their label-claim dose — sometimes none at all. It has become the defining failure of
              the category.
            </p>
            <p className="text-ink">
              Our response is structural. Every batch we ship is assayed by an independent EU
              laboratory before it leaves the facility. The certificate is published on the product
              page itself — not emailed on request, not summarised, not selectively released.
            </p>
            <p>
              If a batch does not meet its labelled dose within a narrow tolerance, it does not ship.
              There is no other version of this promise that is worth making.
            </p>
          </div>
        </div>

        <CoaCard product={PRODUCTS[0]} />
      </div>

      <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3">
        {PRODUCTS.slice(1).map((p) => (
          <CoaCard key={p.id} product={p} compact />
        ))}
        <div className="hairline flex items-center justify-between bg-card p-6">
          <div>
            <div className="mono text-xs uppercase tracking-widest text-muted-ink">Archive</div>
            <div className="mt-2 font-display text-lg">All past batches</div>
          </div>
          <a href="#" className="mono text-xs uppercase tracking-widest hover:opacity-70">
            View →
          </a>
        </div>
      </div>
    </section>
  );
}

function CoaCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  return (
    <div className="hairline overflow-hidden bg-card">
      <div className="hairline-b flex items-center justify-between px-6 py-4">
        <div className="mono text-xs uppercase tracking-widest text-muted-ink">
          Certificate of Analysis
        </div>
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: product.accent }}
          aria-hidden
        />
      </div>
      <div className="px-6 py-6">
        <div className="flex items-baseline justify-between">
          <div className="font-display text-2xl">{product.name}</div>
          <div className="mono text-xs text-muted-ink">Batch {product.batch}</div>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <Row label="Labelled dose" value={product.dose} />
          <Row label="Assayed potency" value={product.potency} strong />
          <Row label="Heavy metals (Pb, Cd, As, Hg)" value="Pass" />
          <Row label="Microbial screen" value="Pass" />
          <Row label="Testing laboratory" value={product.lab} />
          <Row label="Assay date" value="Add on first real batch" />
        </dl>

        {!compact && (
          <a
            href="#"
            className="hairline mt-6 inline-flex px-4 py-2 text-xs font-medium uppercase tracking-widest hover:bg-paper-2"
          >
            View full report (PDF)
          </a>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="hairline-b flex items-baseline justify-between gap-4 pb-2">
      <dt className="text-muted-ink">{label}</dt>
      <dd className={`mono text-right ${strong ? "text-ink" : "text-ink/90"}`}>{value}</dd>
    </div>
  );
}

function ProductVisual({ product }: { product: Product }) {
  // Playful "gummy blob" hero shape per product, still carrying the batch/verification
  // info that keeps the credibility the clinical version had — just friendlier.
  return (
    <div
      className="relative aspect-[4/3] overflow-hidden"
      style={{
        backgroundColor: product.cover
          ? "transparent"
          : `color-mix(in srgb, ${product.accent} 14%, var(--paper))`,
      }}
    >
      {product.cover ? (
        <img
          src={product.cover}
          alt={`${product.name} packaging`}
          className="absolute inset-0 h-full w-full object-contain p-4"
          loading="lazy"
        />
      ) : (
        <>
          <div
            className="blob absolute -right-8 -top-10 h-40 w-40 opacity-90"
            style={{ backgroundColor: product.accent }}
            aria-hidden
          />
          <div
            className="blob absolute -bottom-10 -left-10 h-32 w-32 opacity-40"
            style={{ backgroundColor: product.accent }}
            aria-hidden
          />
        </>
      )}
      <div className="absolute left-4 top-4 flex items-center gap-2">

        <span className="mono rounded-full bg-ink/85 px-2.5 py-1 text-[10px] uppercase tracking-widest text-paper">
          {product.name} · 28 ct
        </span>
      </div>
      <div className="mono absolute right-4 top-4 rounded-full bg-paper/80 px-2.5 py-1 text-[10px] uppercase tracking-widest text-ink">
        {product.timeTag}
      </div>
      <div className="mono absolute bottom-3 left-4 rounded-full bg-paper/80 px-2.5 py-1 text-[10px] text-ink">
        Batch {product.batch}
      </div>
    </div>
  );
}

function ProductGrid({
  stack,
  setStack,
}: {
  stack: Record<ProductId, { on: boolean; dose: Dose }>;
  setStack: React.Dispatch<
    React.SetStateAction<Record<ProductId, { on: boolean; dose: Dose }>>
  >;
}) {
  return (
    <section id="products" className="hairline-t">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mono mb-4 text-xs uppercase tracking-[0.2em] text-muted-ink">
              § 02 — Shop
            </div>
            <h2 className="font-display text-4xl leading-tight md:text-5xl">
              Three formulations.<br />No filler SKUs.
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-ink">
            Every product is a single-purpose formulation built around one clinically-studied
            compound. Ships as a bag of <span className="mono text-ink">28</span> gummies —
            matched to a 28-day cycle.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {PRODUCTS.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              state={stack[p.id]}
              onDose={(d) =>
                setStack((s) => ({ ...s, [p.id]: { ...s[p.id], dose: d } }))
              }
              onAdd={() =>
                setStack((s) => ({ ...s, [p.id]: { ...s[p.id], on: true } }))
              }
              onRemove={() =>
                setStack((s) => ({ ...s, [p.id]: { ...s[p.id], on: false } }))
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({
  product,
  state,
  onDose,
  onAdd,
  onRemove,
}: {
  product: Product;
  state: { on: boolean; dose: Dose };
  onDose: (d: Dose) => void;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const price = state.dose === 2 ? product.price2 : product.price1;
  const bags = state.dose === 2 ? 2 : 1;
  const bagsYear = bags * 13;

  return (
    <article className="hairline flex flex-col overflow-hidden bg-card">
      <ProductVisual product={product} />

      <div className="hairline-b flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: product.accent }}
            aria-hidden
          />
          <span className="mono text-xs uppercase tracking-widest text-muted-ink">
            {product.timeTag} · {product.timeLabel}
          </span>
        </div>
        {product.badge && (
          <span
            className="mono text-[10px] uppercase tracking-widest"
            style={{ color: product.accent }}
          >
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-6 py-6">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-3xl">{product.name}</h3>
        </div>
        <div
          className="mt-2 h-1.5 w-10 rounded-full"
          style={{ backgroundColor: product.accent }}
        />
        <div className="mt-4 text-sm text-muted-ink">{product.ingredient}</div>
        <div className="mono mt-1 text-sm">{product.dose} per gummy</div>

        <p className="mt-5 text-sm leading-relaxed text-muted-ink">
          {product.description}
        </p>

        <div className="mt-6">
          <div className="mono mb-2 text-[10px] uppercase tracking-widest text-muted-ink">
            Daily dose
          </div>
          <div className="hairline grid grid-cols-2 text-sm">
            <button
              onClick={() => onDose(1)}
              className={`px-4 py-2.5 ${state.dose === 1 ? "bg-ink text-paper" : "hover:bg-paper-2"}`}
            >
              <span className="mono">1</span> gummy / day
            </button>
            <button
              onClick={() => onDose(2)}
              className={`px-4 py-2.5 border-l border-hairline ${state.dose === 2 ? "bg-ink text-paper" : "hover:bg-paper-2"}`}
            >
              <span className="mono">2</span> gummies / day
            </button>
          </div>
          <div className="mono mt-2 text-[11px] text-muted-ink">
            → {bags} bag{bags > 1 ? "s" : ""} / 28-day cycle · {bagsYear} bags / year
          </div>
        </div>

        <div className="hairline-t mt-6 flex items-end justify-between pt-5">
          <div>
            <div className="mono text-3xl">€{fmt(price)}</div>
            <div className="mono text-[11px] uppercase tracking-widest text-muted-ink">
              per 28-day cycle · subscribe
            </div>
            <div className="mono mt-1 text-[11px] text-muted-ink">
              or €{fmt(price * (1 + ONETIME_MARKUP))} one-time
            </div>
          </div>
          {state.on ? (
            <button
              onClick={onRemove}
              aria-label={`Remove ${product.name} from cart`}
              className="hairline px-4 py-2.5 text-xs font-medium uppercase tracking-widest hover:bg-paper-2"
            >
              In cart ✓
            </button>
          ) : (
            <button
              onClick={onAdd}
              aria-label={`Add ${product.name} to cart`}
              className="bg-ink px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-paper hover:opacity-90"
            >
              Add to cart
            </button>
          )}
        </div>

        <div className="hairline-t mt-6 pt-4">
          <div className="mono text-[10px] uppercase tracking-widest text-muted-ink">
            EU claim
          </div>
          <p className="mt-1 text-xs italic text-muted-ink">"{product.claim}"</p>
        </div>
      </div>
    </article>
  );
}

function Reviews() {
  // Honest placeholder: no fabricated names, quotes, or counts. Wire this up to
  // your real review platform (Trustpilot, Judge.me, Yotpo, etc.) once you have
  // actual verified-purchase reviews — don't replace these with invented ones.
  return (
    <section id="reviews" className="hairline-t bg-paper-2/40">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="mb-10 max-w-2xl">
          <div className="mono mb-4 text-xs uppercase tracking-[0.2em] text-muted-ink">
            § 04 — Reviews
          </div>
          <h2 className="font-display text-4xl leading-tight md:text-5xl">
            We're new. Be the first to say something.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-ink">
            No reviews yet — and we'd rather show you an empty section than a fake one. Every
            review here will be a real, verified purchase, linked to a real batch certificate.
          </p>
        </div>

        <div className="hairline flex items-center justify-between bg-card p-6">
          <div>
            <div className="font-display text-lg">Bought a bag? Tell us how it went.</div>
            <div className="mt-1 text-sm text-muted-ink">
              Verified buyers get an email invite 14 days after delivery.
            </div>
          </div>
          <a
            href="#"
            className="hairline shrink-0 bg-ink px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-paper hover:opacity-90"
          >
            Leave a review
          </a>
        </div>
      </div>
    </section>
  );
}

function StackBuilder({
  stack,
  setStack,
  mode,
  setMode,
  subtotal,
  discountPct,
  markupPct,
  cycleTotal,
  annual,
  bagsPerCycle,
  selectedCount,
}: {
  stack: Record<ProductId, { on: boolean; dose: Dose }>;
  setStack: React.Dispatch<
    React.SetStateAction<Record<ProductId, { on: boolean; dose: Dose }>>
  >;
  mode: PurchaseMode;
  setMode: React.Dispatch<React.SetStateAction<PurchaseMode>>;
  subtotal: number;
  discountPct: number;
  markupPct: number;
  cycleTotal: number;
  annual: number;
  bagsPerCycle: number;
  selectedCount: number;
}) {
  const isSub = mode === "subscribe";
  const { user } = useSession();
  const navigate = useNavigate();
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutMsg, setCheckoutMsg] = useState<string | null>(null);

  async function handleCheckout() {
    if (selectedCount === 0) return;
    if (!user) {
      // Preserve intent by dropping them at auth
      navigate({ to: "/auth" });
      return;
    }
    setCheckoutBusy(true);
    setCheckoutMsg(null);
    try {
      const selectedProducts = PRODUCTS.filter((p) => stack[p.id].on);
      if (isSub) {
        // Distribute stack discount across products
        const factor = 1 - discountPct / 100;
        const subRows = selectedProducts.map((p) => {
          const price = (stack[p.id].dose === 2 ? p.price2 : p.price1) * factor;
          return {
            user_id: user.id,
            product_id: p.id,
            dose: stack[p.id].dose,
            price_eur: Number(price.toFixed(2)),
            status: "active" as const,
          };
        });
        const { data: created, error } = await supabase
          .from("subscriptions")
          .insert(subRows)
          .select("id, product_id, dose, price_eur");
        if (error) throw error;
        // First-cycle orders
        const orders = (created ?? []).map((s) => ({
          user_id: user.id,
          subscription_id: s.id,
          product_id: s.product_id,
          dose: s.dose,
          bags: s.dose,
          amount_eur: s.price_eur,
          batch_code:
            s.product_id === "perform" ? "PF-26-0001" :
            s.product_id === "calm" ? "CA-26-0001" : "RC-26-0001",
          status: "paid" as const,
        }));
        if (orders.length) await supabase.from("orders").insert(orders);
      } else {
        // One-time: only orders, no subs
        const factor = 1 + ONETIME_MARKUP;
        const orders = selectedProducts.map((p) => {
          const price = (stack[p.id].dose === 2 ? p.price2 : p.price1) * factor;
          return {
            user_id: user.id,
            product_id: p.id,
            dose: stack[p.id].dose,
            bags: stack[p.id].dose,
            amount_eur: Number(price.toFixed(2)),
            batch_code:
              p.id === "perform" ? "PF-26-0001" :
              p.id === "calm" ? "CA-26-0001" : "RC-26-0001",
            status: "paid" as const,
          };
        });
        await supabase.from("orders").insert(orders);
      }
      navigate({ to: "/account" });
    } catch (err) {
      setCheckoutMsg(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setCheckoutBusy(false);
    }
  }

  return (
    <section id="stack" className="hairline-t bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-28">
        <div className="mb-12 max-w-3xl">
          <div className="mono mb-4 text-xs uppercase tracking-[0.2em] text-muted-ink">
            § 05 — Build your stack
          </div>
          <h2 className="font-display text-4xl leading-tight md:text-5xl">
            Choose your products.<br />Choose your dose.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">
          <div className="hairline bg-card">
            {PRODUCTS.map((p, i) => {
              const st = stack[p.id];
              const price = st.dose === 2 ? p.price2 : p.price1;
              return (
                <div
                  key={p.id}
                  className={`grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-4 px-6 py-6 sm:grid-cols-[auto_auto_minmax(0,1fr)_auto_auto] ${i > 0 ? "hairline-t" : ""}`}
                >
                  <button
                    onClick={() =>
                      setStack((s) => ({ ...s, [p.id]: { ...s[p.id], on: !s[p.id].on } }))
                    }
                    className={`hairline flex h-6 w-6 shrink-0 items-center justify-center ${st.on ? "bg-ink text-paper" : ""}`}
                    aria-label={`${st.on ? "Remove" : "Add"} ${p.name}`}
                    aria-pressed={st.on}
                  >
                    {st.on && <span className="text-[11px]">✓</span>}
                  </button>
                  {p.cover ? (
                    <img
                      src={p.cover}
                      alt={p.name}
                      className="hairline h-14 w-14 shrink-0 object-cover bg-paper-2"
                      style={{ mixBlendMode: "multiply" }}
                    />
                  ) : (
                    <div className="hairline h-14 w-14 shrink-0 bg-paper-2" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: p.accent }}
                      />
                      <span className="font-display text-lg">{p.name}</span>
                    </div>
                    <div className="mono mt-0.5 text-xs text-muted-ink truncate">
                      {p.ingredient} · {p.dose}
                    </div>
                  </div>

                  <div className="hairline col-span-3 grid grid-cols-2 text-xs sm:col-span-1">
                    <button
                      onClick={() =>
                        setStack((s) => ({ ...s, [p.id]: { ...s[p.id], dose: 1 } }))
                      }
                      className={`px-3 py-2 ${st.dose === 1 ? "bg-ink text-paper" : "hover:bg-paper-2"}`}
                    >
                      <span className="mono">1</span>×/day
                    </button>
                    <button
                      onClick={() =>
                        setStack((s) => ({ ...s, [p.id]: { ...s[p.id], dose: 2 } }))
                      }
                      className={`px-3 py-2 border-l border-hairline ${st.dose === 2 ? "bg-ink text-paper" : "hover:bg-paper-2"}`}
                    >
                      <span className="mono">2</span>×/day
                    </button>
                  </div>
                  <div className="mono text-right text-sm">
                    <div>€{fmt(isSub ? price : price * (1 + ONETIME_MARKUP))}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-ink">
                      {isSub ? "/cycle" : "one-time"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="hairline bg-ink text-paper">
            <div className="border-b border-white/10 px-6 py-4">
              <div className="mono text-xs uppercase tracking-[0.2em] text-paper/60">
                {isSub ? "Order summary" : "Order summary"}
              </div>
            </div>
            <div className="border-b border-white/10 px-6 py-5">
              <div className="mono mb-3 text-[10px] uppercase tracking-[0.2em] text-paper/60">
                Purchase type
              </div>
              <div className="hairline grid grid-cols-2 border-white/20 text-xs">
                <button
                  onClick={() => setMode("subscribe")}
                  className={`px-3 py-2.5 uppercase tracking-widest ${isSub ? "bg-paper text-ink" : "text-paper hover:bg-white/10"}`}
                >
                  Subscribe
                </button>
                <button
                  onClick={() => setMode("onetime")}
                  className={`border-l border-white/20 px-3 py-2.5 uppercase tracking-widest ${!isSub ? "bg-paper text-ink" : "text-paper hover:bg-white/10"}`}
                >
                  One-time
                </button>
              </div>
              <p className="mono mt-3 text-[10px] leading-relaxed text-paper/60">
                {isSub
                  ? "Best price. Ships every 28 days. Pause or cancel anytime."
                  : `Single delivery. +${Math.round(ONETIME_MARKUP * 100)}% vs. subscription. No stack discount.`}
              </p>
            </div>
            <div className="px-6 py-6 space-y-4 text-sm">
              <SummaryRow label="Products selected" value={<span className="mono">{selectedCount} / 3</span>} />
              <SummaryRow
                label={isSub ? "Bags per cycle" : "Bags in order"}
                value={<span className="mono">{bagsPerCycle}</span>}
              />
              <SummaryRow
                label={isSub ? "Subtotal / cycle" : "Subtotal"}
                value={<span className="mono">€{fmt(subtotal)}</span>}
              />
              {isSub ? (
                <SummaryRow
                  label={`Stack discount${discountPct ? "" : " (2+ products)"}`}
                  value={
                    <span className="mono">
                      {discountPct ? `−${discountPct}%` : "—"}
                    </span>
                  }
                />
              ) : (
                <SummaryRow
                  label="One-time surcharge"
                  value={<span className="mono">+{markupPct}%</span>}
                />
              )}
              <SummaryRow
                label="Shipping (EU)"
                value={<span className="mono">{cycleTotal >= 40 ? "Free" : "€3.90"}</span>}
              />
            </div>
            <div className="border-t border-white/10 px-6 py-6">
              <div className="mono text-xs uppercase tracking-[0.2em] text-paper/60">
                {isSub ? "Total per 28-day cycle" : "Total (one-time)"}
              </div>
              <div className="mono mt-2 font-display text-5xl">€{fmt(cycleTotal)}</div>
              {isSub && (
                <div className="mono mt-2 text-xs text-paper/70">
                  = €{fmt(annual)} / year over 13 cycles
                </div>
              )}
            </div>
            <div className="border-t border-white/10 px-6 py-6">
              <button
                onClick={handleCheckout}
                disabled={selectedCount === 0 || checkoutBusy}
                className="w-full bg-paper px-4 py-3 text-xs font-medium uppercase tracking-widest text-ink hover:opacity-90 disabled:opacity-30"
              >
                {checkoutBusy
                  ? "Processing…"
                  : !user
                    ? isSub ? "Sign in to subscribe" : "Sign in to order"
                    : isSub ? "Checkout · Start subscription" : "Checkout · One-time order"}
              </button>
              {checkoutMsg && (
                <div className="mono mt-3 text-[10px] uppercase tracking-widest text-perform">
                  {checkoutMsg}
                </div>
              )}
              <div className="mono mt-4 flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest text-paper/50">
                <span>Visa</span>
                <span>·</span>
                <span>Mastercard</span>
                <span>·</span>
                <span>Klarna</span>
                <span>·</span>
                <span>iDEAL</span>
              </div>
              <p className="mt-4 text-[11px] leading-relaxed text-paper/60">
                {isSub
                  ? "Pause, edit, or cancel anytime. Change dose between cycles. Every shipment ships with the assayed batch certificate."
                  : "Ships once with the assayed batch certificate. Switch to subscribe at checkout to save."}
              </p>
            </div>
          </aside>
        </div>

        <div className="mono mt-8 max-w-3xl text-[11px] leading-relaxed text-muted-ink">
          Note — the 28-day cycle is intentional. A 28-gummy bag exactly covers one cycle at 1 gummy
          per day, which means 13 shipments per calendar year rather than 12. On a 2-gummies-per-day
          plan, 2 bags ship each cycle and the per-cycle price is roughly 1.8× the 1-a-day price,
          reflecting a small bulk allowance.
        </div>
      </div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between border-b border-white/10 pb-2">
      <span className="text-paper/70">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Faq() {
  const items = [
    {
      q: "Why 28-day cycles instead of monthly?",
      a: "Each bag is exactly 28 gummies, so a 28-day cycle means one bag equals one cycle at 1/day. It also means 13 shipments per year rather than 12 — you'll see this reflected in the annual total.",
    },
    {
      q: "Can I change my dose or pause?",
      a: "Yes. Dose (1/day vs 2/day) can be changed between cycles from your account. You can pause, skip, or cancel anytime with no fee.",
    },
    {
      q: "How is every batch verified?",
      a: "Before a batch ships, an independent, EU-accredited laboratory assays potency, heavy metals, and microbial content. The full Certificate of Analysis is published on the product page and shipped with your order. (Add your actual lab partner's name here once contracted.)",
    },
    {
      q: "Shipping and returns?",
      // NOTE: shipping fee, dispatch time, and guarantee length below are placeholders —
      // set these to your actual fulfilment terms before launch, don't ship this copy as-is.
      a: "Free EU shipping over €40, otherwise €3.90. Ships within 24h of your order. 30-day satisfaction guarantee — full refund, no questions asked.",
    },
  ];
  return (
    <section id="faq" className="hairline-t">
      <div className="mx-auto max-w-4xl px-6 py-20 md:py-24">
        <div className="mb-10">
          <div className="mono mb-4 text-xs uppercase tracking-[0.2em] text-muted-ink">
            § 06 — FAQ
          </div>
          <h2 className="font-display text-4xl leading-tight md:text-5xl">
            Questions, answered.
          </h2>
        </div>
        <div className="hairline bg-card">
          {items.map((it, i) => (
            <details
              key={it.q}
              className={`group px-6 py-5 ${i > 0 ? "hairline-t" : ""}`}
            >
              <summary className="flex cursor-pointer items-center justify-between gap-6 text-sm font-medium">
                <span>{it.q}</span>
                <span className="mono text-lg text-muted-ink group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-ink">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="hairline-t bg-card">
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="mono mb-4 text-xs uppercase tracking-[0.2em] text-muted-ink">
              § 07 — ABOUT GUMLAB
            </div>
            <h2 className="font-display text-4xl leading-tight md:text-5xl">
              Europe deserves better supplements.
            </h2>
            <div className="mt-8 space-y-5 text-sm leading-relaxed text-ink/80">
              <p className="font-medium text-ink">
                Europe deserves better supplements.
              </p>
              <p>
                GumLab was founded in Sweden on a simple frustration: most of the industry asks you to trust it, without giving you a reason to.
              </p>
              <p>
                I'm Aron Leijon, the founder of GumLab. I've spent alot of time thinking about how training, nutrition, and recovery actually work — and how rarely that translates into products you can actually verify, not just believe.
              </p>
              <p>
                Look closely at most gummy supplements and you'll find the same pattern: full ingredient lists buried in a product photo instead of written out in plain text, lab reports with the important details blacked out, and formulas built more for the label than for the dose. It's not that the category is bad — it's that almost nothing in it is checkable. We wanted to build the opposite of that.
              </p>
              <p>
                So GumLab is built around one non-negotiable rule: if we can't show it, we don't say it.
              </p>
              <ul className="space-y-3 pl-4">
                <li className="flex gap-3">
                  <span className="text-muted-ink">—</span>
                  <span>Every batch is assayed by an independent, EU-accredited laboratory — before it ships, not after a complaint.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-muted-ink">—</span>
                  <span>The full Certificate of Analysis is published on the product page itself, unredacted.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-muted-ink">—</span>
                  <span>Every ingredient, and its exact dose, is written out in plain text — never hidden in an image that can quietly change.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-muted-ink">—</span>
                  <span>No proprietary blends. No dose you can't verify against the label.</span>
                </li>
              </ul>
              <p>
                But honesty isn't just something we put on a batch certificate — it's how we want to run this whole company. That means being upfront when something isn't perfect yet, not just when it's convenient. We're a new, small team building this from scratch, and we will get things wrong sometimes. What we promise is that we'll say so plainly when we do, and fix it, rather than quietly hoping no one notices.
              </p>
              <p>
                That's also why your feedback matters more to us than almost anything else. We're not interested in five-star reviews we haven't earned — we'd rather hear the honest, slightly annoying feedback that actually makes the product better. Tell us the flavor's off, the dose feels wrong, the shipping was too slow, or the copy on this very page doesn't make sense. We read every message ourselves, and we'd genuinely rather know than not.
              </p>
              <p>
                Because at the end of the day, none of this — the lab tests, the transparency, the packaging — means anything if it doesn't actually serve the people taking these gummies every morning, afternoon, or night. You're not a review count or a subscription number to us. You're the reason any of this is worth building carefully in the first place.
              </p>
              <p>
                We make three gummies — Perform, Calm, Sleep — one for each part of the day. No powders, no pills, no guesswork. Just a product built to survive being checked, not just believed.
              </p>
              <p>
                This is only the beginning, and we'd love for you to help shape where it goes. Welcome to GumLab.
              </p>
            </div>
            <div className="hairline mt-10 inline-block bg-paper px-6 py-5">
              <div className="text-sm font-medium">ARON LEIJON</div>
              <div className="mono mt-1 text-[11px] uppercase tracking-widest text-muted-ink">
                FOUNDER, GUMLAB
              </div>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="hairline bg-paper p-6 md:sticky md:top-32">
              <div className="mono mb-4 text-[11px] uppercase tracking-widest text-muted-ink">
                What we believe
              </div>
              <ul className="space-y-4 text-sm">
                <li className="flex gap-3">
                  <span className="mono text-muted-ink">01</span>
                  <span>Transparency is non-negotiable — every batch is third-party assayed.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mono text-muted-ink">02</span>
                  <span>Every ingredient must have a purpose — no fillers or marketing fluff.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mono text-muted-ink">03</span>
                  <span>Quality over quantity — premium sourcing, EU manufacturing.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mono text-muted-ink">04</span>
                  <span>Wellness should be effortless — no pills, no powders, no friction.</span>
                </li>
              </ul>
              <div className="hairline-t mt-6 pt-6">
                <div className="mono text-[10px] uppercase tracking-widest text-muted-ink">
                  Founded
                </div>
                <div className="mt-1 font-display text-2xl">Sweden · 2026</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StickyCart({ count, total, isSub }: { count: number; total: number; isSub: boolean }) {
  return (
    <div className="fixed inset-x-0 bottom-4 z-50 px-4 md:hidden">
      <a
        href="#stack"
        className="hairline mx-auto flex max-w-md items-center justify-between bg-ink px-4 py-3 text-paper shadow-lg"
      >
        <span className="mono text-[11px] uppercase tracking-widest">
          {count} in cart
        </span>
        <span className="mono text-sm">€{fmt(total)}</span>
        <span className="mono text-[11px] uppercase tracking-widest">
          {isSub ? "Checkout →" : "Checkout →"}
        </span>
      </a>
    </div>
  );
}

function Footer() {
  return (
    <footer className="hairline-t">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <img src={gumlabLogo.url} alt="GumLab" className="h-14 w-auto" />
            <div className="mono mt-2 text-[11px] uppercase tracking-widest text-muted-ink">
              EU / 001
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-ink">
              Precision-dosed functional gummies. Third-party assayed, published batch-by-batch.
            </p>
            <NewsletterForm />

          </div>
          <FooterCol
            title="Shop"
            links={["Perform", "Calm", "Sleep", "Build your stack"]}
          />
          <FooterCol
            title="Verification"
            links={["Certificates", "Testing method", "Batch archive", "Ingredient sourcing"]}
          />
          <FooterCol
            title="Help"
            links={["Shipping (EU)", "Returns", "Contact\u00a0us", "Terms & privacy"]}
          />
        </div>

        <div className="hairline-t mt-16 pt-8">
          <p className="max-w-4xl text-[11px] leading-relaxed text-muted-ink">
            Food supplements should not be used as a substitute for a varied and balanced diet
            and a healthy lifestyle. Consult a doctor before use if you are pregnant,
            breastfeeding, on medication, or have a medical condition. These products are not
            intended to diagnose, treat, cure or prevent any disease. Claims used are limited to
            those authorised under EU Regulation (EC) No 1924/2006. Keep out of reach of children
            under age of 6.
          </p>
          <div className="mono mt-8 flex flex-wrap items-center justify-between gap-4 text-[10px] uppercase tracking-widest text-muted-ink">
            <span>© 2026 GumLab · Made in the EU</span>
            <span>Batch verification · Every shipment</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  const hrefFor = (label: string): string => {
    const normalized = label.replace(/\u00a0/g, " ").toLowerCase();
    if (normalized === "contact us" || normalized === "contact") return "/contact";
    return "#";
  };
  return (
    <div>
      <div className="mono mb-4 text-[11px] uppercase tracking-widest text-muted-ink">
        {title}
      </div>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l}>
            <a href={hrefFor(l)} className="hover:opacity-70">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");
    const { error } = await supabase.from("newsletter_signups").insert({
      email: email.trim().toLowerCase(),
      source: "footer",
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
    if (error) {
      const dup = error.code === "23505" || /duplicate/i.test(error.message);
      setStatus(dup ? "ok" : "error");
      setMessage(dup ? "You're already on the list." : error.message);
      if (dup) setEmail("");
    } else {
      setStatus("ok");
      setMessage("Thanks — you're on the list.");
      setEmail("");
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="hairline mt-6 flex max-w-sm items-center bg-card">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          disabled={status === "loading"}
          className="mono flex-1 bg-transparent px-3 py-2.5 text-xs outline-none placeholder:text-muted-ink"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-ink px-4 py-2.5 text-[11px] font-medium uppercase tracking-widest text-paper hover:opacity-90 disabled:opacity-60"
        >
          {status === "loading" ? "…" : "Subscribe"}
        </button>
      </form>
      <div
        className={`mono mt-2 text-[10px] uppercase tracking-widest ${
          status === "error" ? "text-perform" : "text-muted-ink"
        }`}
      >
        {status === "idle" || status === "loading"
          ? "Batch releases · lab reports · no spam"
          : message}
      </div>
    </>
  );
}

// Prevent tree-shake warning on unused import in some setups
void useMemo;
