import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import creatineCover from "@/assets/creatine-cover.png.asset.json";
import creatineBenefits from "@/assets/creatine-benefits.png.asset.json";
import creatineVerification from "@/assets/creatine-verification.png.asset.json";
import gumlabLogo from "@/assets/gumlab-logo.png.asset.json";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { CartButton, CartDrawer } from "@/components/CartDrawer";
import { useCartSync } from "@/hooks/useCartSync";
import { useCartStore } from "@/stores/cartStore";
import { CREATINE_PRODUCT } from "@/lib/shopify";


const OG_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/nGL6NvM1vUQWq9gkC6u6fSG8FWA3/social-images/social-1784754043982-ChatGPT_Image_22_juli_2026_22_26_50.webp";

const SUB_PRICE_SEK = 385;
const ONETIME_PRICE_SEK = 449;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GumLab — Creatine Gummies · 180 count, 60-day supply" },
      { name: "description", content: "Creatine monohydrate gummies. 1 g per gummy, 3 gummies daily, 180 per bag — a 60-day supply. Subscribe from 385 SEK, delivered every 2 months." },
      { property: "og:title", content: "GumLab — Creatine Gummies" },
      { property: "og:description", content: "180 creatine monohydrate gummies. 1 g per gummy, 3 daily, a 60-day supply." },
      { property: "og:url", content: "https://gumlab.se/" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "GumLab — Creatine Gummies" },
      { name: "twitter:description", content: "180 creatine monohydrate gummies. A 60-day supply." },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: "https://gumlab.se/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Creatine Gummies",
          description: "Creatine monohydrate gummies — 1 g per gummy, 3 gummies daily, 180 per bag, a 60-day supply.",
          brand: { "@type": "Brand", name: "GumLab" },
          offers: [
            { "@type": "Offer", price: String(SUB_PRICE_SEK), priceCurrency: "SEK", availability: "https://schema.org/PreOrder", url: "https://gumlab.se/#buy" },
            { "@type": "Offer", price: String(ONETIME_PRICE_SEK), priceCurrency: "SEK", availability: "https://schema.org/PreOrder", url: "https://gumlab.se/#buy" },
          ],
        }),
      },
    ],
  }),
  component: Index,
});

type Mode = "subscribe" | "onetime";

function fmtSEK(n: number) {
  return `${n.toLocaleString("sv-SE")} SEK`;
}

function Index() {
  const [mode, setMode] = useState<Mode>("subscribe");
  useCartSync();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <AnnouncementBar />
      <Nav />
      <Hero />
      <TrustRow />
      <Buy mode={mode} setMode={setMode} />
      <Whats />
      <Routine />
      <Reviews />
      <Faq />
      <About />
      <Newsletter />
      <LegalNotice />
      <Footer />
      <StickyBuy mode={mode} />
      <CartDrawer />
    </div>
  );
}


/* ============================== NAV ============================== */

function AnnouncementBar() {
  const items = [
    "Free shipping in Sweden",
    "Ships within 24h from Sweden",
    "Cancel anytime",
  ];
  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-6 py-2 text-[10px] uppercase tracking-[0.22em] sm:gap-10">
        {items.map((t, i) => (
          <span key={t} className={`mono ${i > 0 ? "hidden sm:inline" : ""}`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Nav() {
  const { user, loading } = useSession();
  return (
    <header className="sticky top-0 z-40 border-b border-hairline/60 bg-paper/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#" aria-label="GumLab" className="flex items-center">
          <img src={gumlabLogo.url} alt="GumLab" className="h-14 w-auto" />
        </a>
        <nav className="hidden items-center gap-10 text-sm text-ink/80 md:flex">
          <a href="#buy" className="transition hover:text-ink">Shop</a>
          <a href="#whats" className="transition hover:text-ink">What's inside</a>
          <a href="#routine" className="transition hover:text-ink">Routine</a>
          <a href="#faq" className="transition hover:text-ink">FAQ</a>
          <a href="#about" className="transition hover:text-ink">About</a>
        </nav>
        <div className="flex items-center gap-2">
          {!loading && (
            user ? (
              <Link
                to="/account"
                className="rounded-full border border-hairline px-4 py-2 text-xs uppercase tracking-widest transition hover:bg-paper-2"
              >
                Account
              </Link>
            ) : (
              <Link
                to="/auth"
                className="rounded-full border border-hairline px-4 py-2 text-xs uppercase tracking-widest transition hover:bg-paper-2"
              >
                Sign in
              </Link>
            )
          )}
          <CartButton />

        </div>
      </div>
    </header>
  );
}

/* ============================== HERO ============================== */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 20%, rgba(255,122,61,0.10) 0%, transparent 55%), radial-gradient(ellipse at 80% 30%, rgba(216,242,78,0.14) 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(122,92,250,0.08) 0%, transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-14 md:pb-28 md:pt-24">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className="order-2 md:order-1">
            <div className="mono mb-6 text-[11px] uppercase tracking-[0.28em] text-muted-ink">
              New · Creatine Gummies
            </div>
            <h1 className="font-display text-5xl leading-[1.02] tracking-tight text-ink md:text-7xl">
              Creatine, made simple.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-ink md:text-lg">
              Three gummies a day. One clean bag lasts 60 days.
              <br />
              <span className="mono text-ink">1&nbsp;g</span> creatine monohydrate per gummy —
              <span className="mono text-ink"> 3&nbsp;g</span> daily serving.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#buy"
                className="rounded-full bg-ink px-7 py-4 text-sm font-medium uppercase tracking-widest text-paper shadow-[0_8px_24px_-8px_rgba(28,26,16,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-10px_rgba(28,26,16,0.45)]"
              >
                Shop now — {SUB_PRICE_SEK} SEK
              </a>
              <a
                href="#whats"
                className="rounded-full border border-hairline px-6 py-4 text-sm font-medium uppercase tracking-widest text-ink transition hover:bg-paper-2"
              >
                What's inside
              </a>
            </div>

            <dl className="mono mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-hairline pt-6 text-xs uppercase tracking-widest text-muted-ink">
              <div>
                <dt>Gummies</dt>
                <dd className="mt-1 text-lg text-ink">180</dd>
              </div>
              <div>
                <dt>Supply</dt>
                <dd className="mt-1 text-lg text-ink">60 days</dd>
              </div>
              <div>
                <dt>Per gummy</dt>
                <dd className="mt-1 text-lg text-ink">1 g</dd>
              </div>
            </dl>
          </div>

          <div className="order-1 flex items-center justify-center md:order-2">
            <div className="relative w-full max-w-[560px]">
              <div
                aria-hidden
                className="hero-shadow absolute inset-x-8 bottom-6 h-10 rounded-[50%]"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(28,26,16,0.28) 0%, transparent 70%)",
                  filter: "blur(18px)",
                }}
              />
              <div className="hero-float relative">
                <img
                  src={creatineCover.url}
                  alt="GumLab creatine gummies — 180 count bag with loose gummies at the base"
                  className="relative w-full select-none"
                  draggable={false}
                  style={{ filter: "drop-shadow(0 30px 40px rgba(28,26,16,0.18))" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================== TRUST ROW ============================== */

function TrustRow() {
  const items = [
    {
      label: "Third-party assayed",
      icon: "check",
      bg: "bg-trust-sage",
      ink: "text-trust-sage-ink",
      hover: "group-hover:bg-trust-sage-ink group-hover:text-trust-sage",
    },
    {
      label: "Made in EU",
      icon: "globe",
      bg: "bg-trust-clay",
      ink: "text-trust-clay-ink",
      hover: "group-hover:bg-trust-clay-ink group-hover:text-trust-clay",
    },
    {
      label: "Free shipping in Sweden",
      icon: "package",
      bg: "bg-trust-slate",
      ink: "text-trust-slate-ink",
      hover: "group-hover:bg-trust-slate-ink group-hover:text-trust-slate",
    },
    {
      label: "Cancel anytime",
      icon: "close",
      bg: "bg-trust-gold",
      ink: "text-trust-gold-ink",
      hover: "group-hover:bg-trust-gold-ink group-hover:text-trust-gold",
    },
    {
      label: "60-day supply",
      icon: "calendar",
      bg: "bg-trust-sky",
      ink: "text-trust-sky-ink",
      hover: "group-hover:bg-trust-sky-ink group-hover:text-trust-sky",
    },
    {
      label: "Ships within 24h",
      icon: "lightning",
      bg: "bg-trust-rose",
      ink: "text-trust-rose-ink",
      hover: "group-hover:bg-trust-rose-ink group-hover:text-trust-rose",
    },
  ];

  const iconSvg: Record<string, ReactNode> = {
    check: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    globe: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    package: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    close: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    calendar: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    lightning: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  };

  const track = [...items, ...items];

  return (
    <section className="relative overflow-hidden border-y border-hairline/70 bg-paper-2/40 py-8">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-paper-2/40 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-paper-2/40 to-transparent" />
      <div className="marquee-track flex w-max items-center gap-12">
        {track.map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            className="group flex shrink-0 items-center gap-4"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-500 group-hover:scale-110 ${item.bg} ${item.ink} ${item.hover}`}
            >
              {iconSvg[item.icon]}
            </div>
            <span className="font-display text-xl italic text-ink">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================== BUY ============================== */

const GALLERY_IMAGES = [
  { src: creatineCover.url, alt: "Creatine gummies — pack" },
  { src: creatineBenefits.url, alt: "Creatine gummies — benefits: physical performance, no artificial flavours, 3g creatine per serving" },
  { src: creatineVerification.url, alt: "Creatine gummies — independently verified dosage by Eurofins" },
];

function ProductGallery() {
  const [active, setActive] = useState(0);
  const current = GALLERY_IMAGES[active];
  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full overflow-hidden rounded-[36px] bg-card p-6 shadow-[0_20px_60px_-30px_rgba(28,26,16,0.4)]">
        <img
          src={current.src}
          alt={current.alt}
          className="mx-auto w-full max-w-[520px] object-contain transition-opacity duration-300"
          style={{ filter: "drop-shadow(0 20px 30px rgba(28,26,16,0.15))" }}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {GALLERY_IMAGES.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
            aria-current={i === active}
            className={`relative overflow-hidden rounded-2xl bg-card p-2 transition ${
              i === active
                ? "ring-2 ring-ink"
                : "ring-1 ring-hairline hover:ring-ink/40"
            }`}
          >
            <img src={img.src} alt="" className="h-20 w-full object-contain sm:h-24" />
          </button>
        ))}
      </div>
    </div>
  );
}


function Buy({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  const price = mode === "subscribe" ? SUB_PRICE_SEK : ONETIME_PRICE_SEK;
  const savings = ONETIME_PRICE_SEK - SUB_PRICE_SEK;
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const handleAdd = async () => {
    const variantId = mode === "subscribe" ? CREATINE_PRODUCT.variants.subscribe : CREATINE_PRODUCT.variants.onetime;
    await addItem({
      variantId,
      productTitle: "Creatine Gummies — 180",
      variantTitle: mode === "subscribe" ? "Subscription (every 2 months)" : "One-time purchase",
      image: creatineCover.url,
      price: { amount: String(price), currencyCode: "SEK" },
      quantity: 1,
    });
  };

  return (
    <section id="buy" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
      <div className="grid gap-12 md:grid-cols-[1fr_1.05fr] md:gap-16">
        <ProductGallery />

        <div>
          <div className="mono mb-4 text-[11px] uppercase tracking-[0.28em] text-muted-ink">
            §&nbsp;01 — Shop
          </div>
          <h2 className="font-display text-4xl leading-tight md:text-5xl">
            Creatine Gummies
          </h2>
          <p className="mt-3 max-w-md text-sm text-muted-ink md:text-base">
            180 gummies · 1&nbsp;g creatine monohydrate per gummy · 3 gummies daily · 60-day supply.
          </p>

          <div className="mt-8 space-y-3">
            <PlanOption
              selected={mode === "subscribe"}
              onSelect={() => setMode("subscribe")}
              label="Subscription"
              badge="BEST SELLER"
              price={SUB_PRICE_SEK}
              cadence="Delivered every 2 months"
              savings={`Save ${savings} SEK vs one-time`}
              perks={[
                "Automatic delivery every 60 days",
                "Cancel anytime",
                "Secure checkout",
              ]}
            />
            <PlanOption
              selected={mode === "onetime"}
              onSelect={() => setMode("onetime")}
              label="One-time purchase"
              price={ONETIME_PRICE_SEK}
              cadence="One-time payment"
              perks={["180 gummies · 60-day supply"]}
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAdd}
              disabled={isLoading}
              className="rounded-full bg-ink px-8 py-4 text-sm font-medium uppercase tracking-widest text-paper transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
            >
              {isLoading ? "Adding…" : `Add to cart — ${fmtSEK(price)}`}
            </button>
            <div className="mono text-[11px] uppercase tracking-widest text-muted-ink">
              Secure checkout · Free SE shipping
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function PlanOption({
  selected,
  onSelect,
  label,
  badge,
  price,
  cadence,
  savings,
  perks,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  badge?: string;
  price: number;
  cadence: string;
  savings?: string;
  perks: string[];
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`block w-full rounded-3xl border p-6 text-left transition ${
        selected
          ? "border-ink bg-card shadow-[0_18px_44px_-24px_rgba(28,26,16,0.5)]"
          : "border-hairline bg-paper hover:border-ink/40 hover:bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
              selected ? "border-ink bg-ink" : "border-hairline"
            }`}
          >
            {selected && <span className="h-2 w-2 rounded-full bg-paper" />}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <div className="font-display text-lg">{label}</div>
              {badge && (
                <span className="relative inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-paper shadow-[0_4px_14px_-4px_rgba(28,26,16,0.35)]">
                  <span
                    aria-hidden
                    className="badge-glow absolute -inset-1 rounded-full bg-gradient-to-r from-perform via-brand to-calm opacity-70 blur-sm"
                  />
                  <span className="relative flex items-center gap-1">
                    <svg className="relative h-3 w-3 text-brand" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {badge}
                  </span>
                </span>
              )}
            </div>
            <div className="mono mt-1 text-[11px] uppercase tracking-widest text-muted-ink">
              {cadence}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="mono text-2xl">{price} SEK</div>
          {savings && (
            <div className="mono mt-1 text-[10px] uppercase tracking-widest text-muted-ink">
              {savings}
            </div>
          )}
        </div>
      </div>
      <ul className="mono mt-4 space-y-1.5 pl-8 text-[11px] uppercase tracking-widest text-muted-ink">
        {perks.map((p) => (
          <li key={p} className="flex items-start gap-2">
            <span aria-hidden className="mt-1 h-1 w-1 shrink-0 rounded-full bg-ink/40" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

/* ============================== WHAT'S INSIDE ============================== */

function Whats() {
  const rows = [
    { k: "Active ingredient", v: "Creatine Monohydrate" },
    { k: "Per gummy", v: "1 g" },
    { k: "Daily serving", v: "3 gummies (3 g)" },
    { k: "Per bag", v: "180 gummies" },
    { k: "Supply", v: "60 days" },
  ];
  return (
    <section id="whats" className="border-t border-hairline bg-paper-2/30">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:gap-16 md:py-28">
        <div>
          <div className="mono mb-4 text-[11px] uppercase tracking-[0.28em] text-muted-ink">
            §&nbsp;02 — What's inside
          </div>
          <h2 className="font-display text-4xl leading-tight md:text-5xl">
            One ingredient.<br />No filler.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-ink">
            Pure creatine monohydrate at a considered 1&nbsp;g per gummy. Three gummies is a full
            3&nbsp;g daily serving. That's it — no proprietary blends, no theatre.
          </p>
        </div>
        <div className="rounded-3xl border border-hairline bg-card p-8">
          <dl className="divide-y divide-hairline">
            {rows.map((r) => (
              <div key={r.k} className="flex items-baseline justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <dt className="text-sm text-muted-ink">{r.k}</dt>
                <dd className="mono text-right text-ink">{r.v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 border-t border-hairline pt-6">
            <div className="text-sm text-muted-ink">Ingredients</div>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              Sugar, Glucose Syrup, Creatine Monohydrate, Humectant (Glycerol), Water, Gelling Agent (Pectins),
              Acidity Regulators (Trisodium Citrate, Tricalcium Phosphate), Acid (Citric Acid), Natural Flavourings,
              Colour (Anthocyanins).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================== ROUTINE ============================== */

function Routine() {
  const steps = [
    { n: "01", t: "Take 3 gummies", d: "Any time of day, with or without food." },
    { n: "02", t: "Every day", d: "Consistency is what makes creatine work." },
    { n: "03", t: "One bag lasts 60 days", d: "Your next bag arrives before you run out." },
  ];
  return (
    <section id="routine" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
      <div className="mb-12 max-w-2xl">
        <div className="mono mb-4 text-[11px] uppercase tracking-[0.28em] text-muted-ink">
          §&nbsp;03 — Daily routine
        </div>
        <h2 className="font-display text-4xl leading-tight md:text-5xl">
          Three gummies. Every day.
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="rounded-3xl border border-hairline bg-card p-8">
            <div className="mono text-xs uppercase tracking-widest text-muted-ink">{s.n}</div>
            <div className="mt-3 font-display text-2xl">{s.t}</div>
            <p className="mt-3 text-sm leading-relaxed text-muted-ink">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================== REVIEWS ============================== */

const TRUSTPILOT_URL = "https://www.trustpilot.com/review/gumlab.se";

function Reviews() {
  return (
    <section id="reviews" className="border-t border-hairline bg-paper-2/30">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="mb-10 max-w-2xl">
          <div className="mono mb-4 text-[11px] uppercase tracking-[0.28em] text-muted-ink">
            §&nbsp;04 — Reviews
          </div>
          <h2 className="font-display text-4xl leading-tight md:text-5xl">
            Verified on Trustpilot.
          </h2>
          <p className="mt-4 max-w-md text-sm text-muted-ink">
            We're new. Every review comes from a real, verified purchase — no exceptions.
          </p>
        </div>
        <a
          href={TRUSTPILOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 rounded-full bg-[#00B67A] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.5l7.1-.6z" />
          </svg>
          Read more reviews on Trustpilot →
        </a>
      </div>
    </section>
  );
}

/* ============================== FAQ ============================== */

function Faq() {
  const items = [
    {
      q: "What are Creatine Gummies?",
      a: "Our Creatine Gummies are a tasty and convenient way to supplement with creatine. Each serving delivers 3g of creatine monohydrate, which is scientifically proven to increase physical performance in successive bursts of short-term, high-intensity exercise. They're perfect for those who struggle to take creatine powder and prefer a tastier, chewable supplement.",
    },
    {
      q: "How do Creatine Gummies work?",
      a: "Creatine increases your body's stores of phosphocreatine, a molecule used to produce energy during high-intensity exercise. By increasing these stores, our Creatine Gummies can help you perform better in activities like weightlifting and sprinting. This means you could potentially lift heavier, sprint faster, and recover quicker.",
    },
    {
      q: "What are the benefits of using Creatine Gummies?",
      a: "Creatine is one of the most researched sports supplements, and its benefits are well established. By supplementing with our Creatine Gummies, you can expect improvements in high-intensity exercise performance, such as increased strength, power, and speed. The convenient gummy format also makes them easy to take on the go.",
    },
    {
      q: "How do I take Creatine Gummies?",
      a: "Simply chew up to three gummies per day. They're easy to incorporate into your routine and can be taken at any time that suits you.",
    },
    {
      q: "Are Creatine Gummies suitable for vegetarians and vegans?",
      a: "Yes, our Creatine Gummies are suitable for both vegetarians and vegans, making them a great option for those following plant-based diets.",
    },
    {
      q: "What flavour are Creatine Gummies?",
      a: "Our Creatine Gummies come in a delicious Raspberry flavour. Maybe more flavours comming soon..\u00a0",
    },
    {
      q: "Are there any side effects of taking Creatine Gummies?",
      a: "Creatine is a very safe and well-tolerated supplement. Some people may experience minor digestive discomfort if they take too much at once, but this is usually temporary. We recommend sticking to the recommended dose of 3 gummies per day.",
    },
    {
      q: "How long does it take to see results from Creatine Gummies?",
      a: "While everyone is different, some people notice improvements in their performance within a few days, while others may take a couple of weeks. Consistency is key, so make sure you take your creatine gummies daily to maximise their benefits.",
    },
    {
      q: "Can I take Creatine Gummies with other supplements?",
      a: "Yes, creatine can be safely combined with other supplements. Many athletes take creatine alongside protein powder, pre-workout, or BCAAs.",
    },
    {
      q: "Are Creatine Gummies suitable for women?",
      a: "Absolutely! Creatine can be just as beneficial for women as it is for men. It can help with strength training, power output, and overall athletic performance, regardless of gender.",
    },
    {
      q: "How are Creatine Gummies different from creatine powder?",
      a: "The main difference is the format. Our Creatine Gummies offer a convenient and tasty alternative to traditional creatine powder. They deliver the same creatine monohydrate but in a chewable form, which can be more appealing to some.",
    },
    {
      q: "What if I don't like the taste of creatine powder?",
      a: "If you find the taste or texture of creatine powder unpleasant, our Creatine Gummies are a fantastic alternative. They offer a delicious Raspberry flavour and a convenient chewable format, so you can easily get your daily dose of creatine.",
    },
  ];
  return (
    <section id="faq" className="mx-auto max-w-4xl px-6 py-20 md:py-28">
      <div className="mb-10">
        <div className="mono mb-4 text-[11px] uppercase tracking-[0.28em] text-muted-ink">
          §&nbsp;05 — FAQ
        </div>
        <h2 className="font-display text-4xl leading-tight md:text-5xl">
          Answers.
        </h2>
      </div>
      <div className="divide-y divide-hairline overflow-hidden rounded-3xl border border-hairline bg-card">
        {items.map((it) => (
          <details key={it.q} className="group">
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left text-base font-medium text-ink transition hover:bg-paper-2/50">
              <span>{it.q}</span>
              <span
                aria-hidden
                className="mono text-lg text-muted-ink transition group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="px-6 pb-6 text-sm leading-relaxed text-muted-ink">{it.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ============================== ABOUT ============================== */

function About() {
  return (
    <section id="about" className="border-t border-hairline bg-paper-2/30">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[1fr_1.1fr] md:gap-16 md:py-28">
        <div>
          <div className="mono mb-4 text-[11px] uppercase tracking-[0.28em] text-muted-ink">
            §&nbsp;06 — About GumLab
          </div>
          <h2 className="font-display text-4xl leading-tight md:text-5xl">
            Swedish craft.<br />No theatre.
          </h2>
        </div>
        <div className="space-y-5 text-base leading-relaxed text-muted-ink">
          <p>
            I'm Aron Leijon, the founder of GumLab. I've spent a lot of time thinking about what
            makes a supplement worth taking every day. The answer, honestly, is short:
            a single, well-studied ingredient, at a real dose, in a form you actually enjoy.
          </p>
          <p className="text-ink">
            GumLab is a Myprotein company. I did not create or manufacture these products myself —
            that work is done by the Myprotein team. What I can stand behind is that they are made in
            the EU under strict quality standards, and every batch is third-party assayed.
          </p>
          <p>
            We started with one product because one product done properly is worth more than ten
            that aren't. If you try it, tell us what you think — honestly.
          </p>
          <div className="mono pt-2 text-xs uppercase tracking-widest text-ink">
            — Aron Leijon, founder
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================== LEGAL NOTICE ============================== */

function LegalNotice() {
  return (
    <section id="legal" className="border-t border-hairline bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="mb-12">
          <div className="mono mb-4 text-[11px] uppercase tracking-[0.28em] text-muted-ink">
            §&nbsp;07 — Legal Notice
          </div>
          <h2 className="font-display text-4xl leading-tight md:text-5xl">
            Terms, disclaimers & contact.
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-x-16 md:gap-y-12">
          <div>
            <h3 className="font-display text-xl text-ink">Company Information</h3>
            <div className="mt-4 space-y-2 text-sm leading-relaxed text-muted-ink">
              <p><strong className="text-ink">Operated by:</strong> GumLab.se</p>
              <p><strong className="text-ink">Registered Address:</strong><br />Karl Gerhards Väg 9<br />Sweden</p>
              <p><strong className="text-ink">Email:</strong> <a href="mailto:support@gumlab.se" className="underline underline-offset-4 hover:text-ink">support@gumlab.se</a></p>
              <p><strong className="text-ink">Website:</strong> <a href="https://gumlab.se" className="underline underline-offset-4 hover:text-ink">https://gumlab.se</a></p>
              <p><strong className="text-ink">Organization Number (VAT / Company Registration):</strong> Under construction</p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl text-ink">Disclaimer</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-ink">
              The information provided on this website is for general informational purposes only and should not be considered medical advice.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-ink">
              Our food supplements are not intended to diagnose, treat, cure, or prevent any disease. Always consult a qualified healthcare professional before using dietary supplements if you are pregnant, breastfeeding, under 18 years of age, taking medication, or have a medical condition.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-ink">
              Do not exceed the recommended daily dose. Food supplements should not be used as a substitute for a varied, balanced diet and a healthy lifestyle. Keep products out of reach of young children.
            </p>
          </div>

          <div>
            <h3 className="font-display text-xl text-ink">Product Information</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-ink">
              We strive to ensure that all product descriptions, nutritional information, ingredients, and images are accurate. However, packaging, formulations, or specifications may change over time.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-ink">
              Please always read the label on the product before use.
            </p>
          </div>

          <div>
            <h3 className="font-display text-xl text-ink">Shipping</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-ink">
              <li>We currently ship to selected European countries.</li>
              <li>Estimated delivery times are provided for guidance only and are not guaranteed.</li>
              <li>Delays caused by customs authorities, postal services, couriers, or circumstances beyond our control are not our responsibility.</li>
              <li>Customers are responsible for ensuring that dietary supplements may legally be imported into their country.</li>
              <li>Risk of loss transfers to the customer upon delivery.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xl text-ink">Returns</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-ink">
              If you are located within the European Union, you may have the right to withdraw from your purchase within 14 days in accordance with applicable consumer protection laws.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-ink">
              For health and hygiene reasons, opened food supplements cannot be returned unless they are defective or incorrect.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-ink">
              Please contact <a href="mailto:support@gumlab.se" className="underline underline-offset-4 hover:text-ink">support@gumlab.se</a> before returning any order.
            </p>
          </div>

          <div>
            <h3 className="font-display text-xl text-ink">Intellectual Property</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-ink">
              All content on this website — including text, graphics, logos, images, branding, and design — is the property of GumLab unless otherwise stated and may not be copied, reproduced, or distributed without prior written permission.
            </p>
          </div>

          <div>
            <h3 className="font-display text-xl text-ink">Governing Law</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-ink">
              This website and any purchases made through it are governed by the laws of Sweden.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-ink">
              Any disputes shall be subject to the exclusive jurisdiction of the Swedish courts unless mandatory consumer protection laws provide otherwise.
            </p>
          </div>

          <div>
            <h3 className="font-display text-xl text-ink">Contact</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-ink">
              For any legal, shipping, or customer support inquiries, please contact:
            </p>
            <div className="mt-3 space-y-1 text-sm text-muted-ink">
              <p>Email: <a href="mailto:support@gumlab.se" className="underline underline-offset-4 hover:text-ink">support@gumlab.se</a></p>
              <p>Website: <a href="https://gumlab.se" className="underline underline-offset-4 hover:text-ink">https://gumlab.se</a></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================== NEWSLETTER ============================== */

function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading" || !email.trim()) return;
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
    <section className="border-t border-hairline">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center md:py-24">
        <div className="mono mb-4 text-[11px] uppercase tracking-[0.28em] text-muted-ink">
          Launch list
        </div>
        <h2 className="font-display text-4xl leading-tight md:text-5xl">
          Be first to know when we ship.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm text-muted-ink">
          One email per batch. No spam.
        </p>
        <form
          onSubmit={onSubmit}
          className="mx-auto mt-8 flex w-full max-w-md flex-col items-stretch gap-2 sm:flex-row"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            disabled={status === "loading"}
            className="mono flex-1 rounded-full border border-hairline bg-paper px-5 py-3 text-sm text-ink outline-none transition focus:border-ink"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full bg-ink px-6 py-3 text-sm font-medium uppercase tracking-widest text-paper transition hover:opacity-90 disabled:opacity-60"
          >
            {status === "loading" ? "…" : "Notify me"}
          </button>
        </form>
        {status !== "idle" && status !== "loading" && (
          <div className="mono mt-3 text-[11px] uppercase tracking-widest text-muted-ink">
            {message}
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================== FOOTER ============================== */

function Footer() {
  return (
    <footer className="border-t border-hairline bg-paper-2/40">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <img src={gumlabLogo.url} alt="GumLab" className="h-14 w-auto" />
            <p className="mt-4 max-w-xs text-sm text-muted-ink">
              Creatine gummies. One product, done properly.
            </p>
          </div>
          <FooterCol
            title="Shop"
            links={[
              { l: "Creatine Gummies", h: "#buy" },
              { l: "Subscription", h: "#buy" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { l: "About", h: "#about" },
              { l: "FAQ", h: "#faq" },
              { l: "Contact us", h: "/contact" },
              { l: "Legal notice", h: "#legal" },
            ]}
          />
          <div>
            <div className="mono text-[11px] uppercase tracking-widest text-muted-ink">Social</div>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="https://www.instagram.com/gumlab.se/?hl=en" target="_blank" rel="noopener noreferrer" className="hover:text-ink text-muted-ink">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://www.tiktok.com/@israelofficialgovernment" target="_blank" rel="noopener noreferrer" className="hover:text-ink text-muted-ink">
                  TikTok
                </a>
              </li>
              <li>
                <span className="text-muted-ink/60">LinkedIn (soon)</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mono mt-12 flex flex-col items-start justify-between gap-4 border-t border-hairline pt-6 text-[11px] uppercase tracking-widest text-muted-ink md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} GumLab</div>
          <div className="max-w-2xl text-[10px] normal-case tracking-normal">
            Food supplement. Do not exceed the recommended daily dose. This product is not a
            substitute for a varied, balanced diet and a healthy lifestyle. Keep out of reach of
            children under age of 6.
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { l: string; h: string }[] }) {
  return (
    <div>
      <div className="mono text-[11px] uppercase tracking-widest text-muted-ink">{title}</div>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.l}>
            <a href={l.h} className="text-muted-ink transition hover:text-ink">
              {l.l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================== STICKY BUY ============================== */

function StickyBuy({ mode }: { mode: Mode }) {
  const price = mode === "subscribe" ? SUB_PRICE_SEK : ONETIME_PRICE_SEK;
  const label = mode === "subscribe" ? "Subscribe" : "Buy once";
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const handleAdd = async () => {
    const variantId = mode === "subscribe" ? CREATINE_PRODUCT.variants.subscribe : CREATINE_PRODUCT.variants.onetime;
    await addItem({
      variantId,
      productTitle: "Creatine Gummies — 180",
      variantTitle: mode === "subscribe" ? "Subscription (every 2 months)" : "One-time purchase",
      image: creatineCover.url,
      price: { amount: String(price), currencyCode: "SEK" },
      quantity: 1,
    });
  };
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-paper/95 px-4 py-3 backdrop-blur-xl md:hidden">
      <button
        type="button"
        onClick={handleAdd}
        disabled={isLoading}
        className="flex w-full items-center justify-between rounded-full bg-ink px-5 py-3 text-sm font-medium uppercase tracking-widest text-paper disabled:opacity-60"
      >
        <span>{isLoading ? "Adding…" : label}</span>
        <span className="mono">{price} SEK</span>
      </button>
    </div>
  );
}
