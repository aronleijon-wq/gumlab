import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import creatineCover from "@/assets/creatine-cover.png.asset.json";
import creatineBenefits from "@/assets/creatine-benefits.png.asset.json";
import creatineVerification from "@/assets/creatine-verification.png.asset.json";
import gumlabLogo from "@/assets/gumlab-logo.png.asset.json";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";

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
      <Footer />
      <StickyBuy mode={mode} />
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
          <a
            href="#buy"
            className="rounded-full bg-ink px-5 py-2 text-xs font-medium uppercase tracking-widest text-paper transition hover:opacity-90"
          >
            Buy
          </a>
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
                className="absolute inset-x-8 bottom-6 h-10 rounded-[50%]"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(28,26,16,0.28) 0%, transparent 70%)",
                  filter: "blur(18px)",
                }}
              />
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
    </section>
  );
}

/* ============================== TRUST ROW ============================== */

function TrustRow() {
  const items = [
    "Third-party assayed",
    "Made in EU",
    "Free shipping in Sweden",
    "Cancel anytime",
    "60-day supply",
    "Ships within 24h",
  ];
  return (
    <section className="border-y border-hairline/70 bg-paper-2/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-4 px-6 py-6 sm:grid-cols-3 md:grid-cols-6">
        {items.map((t) => (
          <div key={t} className="mono flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-ink">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink/60" aria-hidden />
            <span className="truncate">{t}</span>
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
              badge="Recommended"
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
              className="rounded-full bg-ink px-8 py-4 text-sm font-medium uppercase tracking-widest text-paper transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Add to cart — {fmtSEK(price)}
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
                <span className="mono rounded-full bg-brand px-2 py-0.5 text-[10px] uppercase tracking-widest text-ink">
                  {badge}
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
      q: "How many gummies come in a bag?",
      a: "180 gummies. At 3 gummies per day, one bag is a 60-day supply.",
    },
    {
      q: "How much creatine will I get?",
      a: "Each gummy contains 1 g of creatine monohydrate. Three gummies a day gives you a 3 g daily serving.",
    },
    {
      q: "How does the subscription work?",
      a: "Your bag ships automatically every 60 days at 385 SEK. Skip, pause, or cancel anytime from your account.",
    },
    {
      q: "Shipping and returns?",
      a: "Free shipping in Sweden. Orders ship within 24h. 30-day satisfaction guarantee — full refund, no questions asked.",
    },
    {
      q: "Are they suitable for everyone?",
      a: "Adults only. Not recommended for children under 6, pregnant or breastfeeding women. Consult your doctor if you take medication or have a medical condition.",
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
            Our rule is simple. If we can't show it, we don't say it. Every batch is third-party
            assayed. Every claim is one we can back up with a certificate.
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
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-paper/95 px-4 py-3 backdrop-blur-xl md:hidden">
      <a
        href="#buy"
        className="flex w-full items-center justify-between rounded-full bg-ink px-5 py-3 text-sm font-medium uppercase tracking-widest text-paper"
      >
        <span>{label}</span>
        <span className="mono">{price} SEK</span>
      </a>
    </div>
  );
}
