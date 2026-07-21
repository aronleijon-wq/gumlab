import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({
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
  rating: number;
  reviews: number;
  badge?: string;
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
    accent: "#B5652E",
    batch: "PF-24-0417",
    potency: "99.4%",
    lab: "Eurofins Scientific",
    description:
      "A morning gummy formulated around a single, well-studied compound. No stimulants, no proprietary blends.",
    rating: 4.8,
    reviews: 1247,
    badge: "Bestseller",
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
    accent: "#54613F",
    batch: "CA-24-0412",
    potency: "101.2%",
    lab: "Eurofins Scientific",
    description:
      "Standardised KSM-66 root extract paired with L-theanine. Take when the day calls for it.",
    rating: 4.7,
    reviews: 892,
  },
  {
    id: "recover",
    name: "RECOVER",
    timeTag: "22:00",
    timeLabel: "Night",
    ingredient: "Magnesium bisglycinate + melatonin",
    dose: "200 mg / 0.5 mg",
    claim: "Contributes to a normal wind-down routine and supports normal muscle function.",
    price1: 25,
    price2: 45,
    accent: "#2E2A54",
    batch: "RC-24-0421",
    potency: "98.7%",
    lab: "Eurofins Scientific",
    description:
      "A low, considered dose of melatonin with chelated magnesium. Built for the last hour of the day.",
    rating: 4.9,
    reviews: 1583,
    badge: "New batch",
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
      <AnnouncementBar />
      <Nav cartCount={selected.length} cartTotal={cycleTotal} />
      <Hero />
      <TrustRow />
      <DayArc />
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
    "Ships within 48 h from Rotterdam",
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

function Nav({ cartCount, cartTotal }: { cartCount: number; cartTotal: number }) {
  return (
    <header className="hairline-b sticky top-0 z-40 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#" className="font-display text-xl font-semibold tracking-tight">
          GumLab
        </a>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <a href="#products" className="hover:opacity-70">Shop</a>
          <a href="#verification" className="hover:opacity-70">Verification</a>
          <a href="#reviews" className="hover:opacity-70">Reviews</a>
          <a href="#faq" className="hover:opacity-70">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="#stack"
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

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "xs" }) {
  const full = Math.round(rating);
  const px = size === "xs" ? "text-[10px]" : "text-xs";
  return (
    <span className={`mono ${px} flex items-center gap-1`}>
      <span aria-hidden className="tracking-tight">
        {"★".repeat(full)}
        <span className="opacity-30">{"★".repeat(5 - full)}</span>
      </span>
      <span className="text-muted-ink">{rating.toFixed(1)}</span>
    </span>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-16 pb-16 md:pt-24 md:pb-24">
      <div className="mb-8 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-ink">
        <span className="mono">EU / 001</span>
        <span className="hairline-t inline-block h-px w-8" />
        <span>Third-party assayed · every batch</span>
      </div>
      <h1 className="font-display text-5xl leading-[1.02] tracking-tight md:text-7xl lg:text-8xl">
        One for the morning.<br />
        One for anytime.<br />
        One for the night.
      </h1>
      <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-ink">
        Three functional gummies — precisely dosed, independently assayed by a third-party lab
        before every shipment, and delivered in <span className="mono text-ink">28</span>-day bags
        matched to your billing cycle.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <a
          href="#stack"
          className="hairline bg-ink px-6 py-3 text-sm font-medium uppercase tracking-widest text-paper hover:opacity-90"
        >
          Shop the stack
        </a>
        <a
          href="#verification"
          className="hairline px-6 py-3 text-sm font-medium uppercase tracking-widest text-ink hover:bg-paper-2"
        >
          See the lab results
        </a>
        <div className="ml-2 flex items-center gap-3">
          <Stars rating={4.8} />
          <span className="mono text-xs text-muted-ink">3,722 verified reviews</span>
        </div>
      </div>
    </section>
  );
}

function TrustRow() {
  const items = [
    { k: "Free EU shipping", v: "Orders over €40" },
    { k: "60-day guarantee", v: "Full refund, no questions" },
    { k: "Cancel anytime", v: "Manage from your dashboard" },
    { k: "Batch certificate", v: "Ships with every order" },
  ];
  return (
    <section className="hairline-t hairline-b bg-paper-2/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
        {items.map((it, i) => (
          <div
            key={it.k}
            className={`px-6 py-6 ${i > 0 ? "border-l border-hairline" : ""}`}
          >
            <div className="mono text-[10px] uppercase tracking-widest text-muted-ink">
              0{i + 1}
            </div>
            <div className="mt-2 text-sm font-medium">{it.k}</div>
            <div className="mt-1 text-xs text-muted-ink">{it.v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DayArc() {
  return (
    <section className="hairline-b bg-paper">
      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-3">
        {PRODUCTS.map((p, i) => (
          <div
            key={p.id}
            className={`px-6 py-10 md:py-14 ${i > 0 ? "md:border-l md:border-hairline" : ""} ${i > 0 ? "hairline-t md:border-t-0" : ""}`}
          >
            <div className="flex items-baseline gap-3">
              <span className="mono text-sm text-muted-ink">{p.timeTag}</span>
              <span
                className="inline-block h-2 w-2"
                style={{ backgroundColor: p.accent }}
                aria-hidden
              />
              <span className="text-xs uppercase tracking-widest text-muted-ink">
                {p.timeLabel}
              </span>
            </div>
            <div className="mt-4 font-display text-3xl">{p.name}</div>
            <div className="mono mt-2 text-xs text-muted-ink">{p.ingredient}</div>
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
    <div className="hairline bg-card">
      <div className="hairline-b flex items-center justify-between px-6 py-4">
        <div className="mono text-xs uppercase tracking-widest text-muted-ink">
          Certificate of Analysis
        </div>
        <span
          className="inline-block h-2 w-2"
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
          <Row label="Assay date" value="2024-04-22" />
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
  // Clinical, structured "product tile" — hairline grid, dot cluster suggesting 28 gummies, accent bar.
  const dots = Array.from({ length: 28 });
  return (
    <div className="hairline-b relative aspect-[4/3] overflow-hidden bg-paper">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: product.accent }}
        aria-hidden
      />
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <span className="mono text-[10px] uppercase tracking-widest text-muted-ink">
          {product.name} · 28 ct
        </span>
      </div>
      <div className="absolute right-4 top-4 mono text-[10px] uppercase tracking-widest text-muted-ink">
        {product.timeTag}
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-center px-8 pb-8">
        <div className="grid grid-cols-7 gap-1.5">
          {dots.map((_, i) => (
            <span
              key={i}
              className="block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: product.accent, opacity: 0.15 + (i % 7) * 0.11 }}
            />
          ))}
        </div>
      </div>
      <div className="absolute bottom-3 left-4 mono text-[10px] text-muted-ink">
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
    <article className="hairline flex flex-col bg-card">
      <ProductVisual product={product} />

      <div className="hairline-b flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2"
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
          <Stars rating={product.rating} size="xs" />
        </div>
        <div
          className="mt-1 h-px w-8"
          style={{ backgroundColor: product.accent }}
        />
        <div className="mono mt-1 text-[10px] uppercase tracking-widest text-muted-ink">
          {product.reviews.toLocaleString()} reviews · In stock
        </div>
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
              className="hairline px-4 py-2.5 text-xs font-medium uppercase tracking-widest hover:bg-paper-2"
            >
              In cart ✓
            </button>
          ) : (
            <button
              onClick={onAdd}
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
  const items = [
    {
      p: "PERFORM",
      accent: "#B5652E",
      name: "Elin S.",
      loc: "Stockholm, SE",
      r: 5,
      title: "Actually assayed. Actually works.",
      body:
        "I switched from creatine powder for convenience and was skeptical. The published potency numbers on the batch page are the reason I stayed.",
      date: "2 weeks ago",
    },
    {
      p: "CALM",
      accent: "#54613F",
      name: "Marc L.",
      loc: "Amsterdam, NL",
      r: 5,
      title: "Quiet effect, no drowsiness.",
      body:
        "I take it before meetings. It doesn't sedate — it just takes the edge off. KSM-66 dose is honest.",
      date: "1 month ago",
    },
    {
      p: "RECOVER",
      accent: "#2E2A54",
      name: "Sofia G.",
      loc: "Barcelona, ES",
      r: 5,
      title: "The 0.5 mg melatonin is the right call.",
      body:
        "Most brands overshoot melatonin badly. A low dose plus magnesium is what I've wanted for years.",
      date: "3 weeks ago",
    },
  ];
  return (
    <section id="reviews" className="hairline-t bg-paper-2/40">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mono mb-4 text-xs uppercase tracking-[0.2em] text-muted-ink">
              § 04 — Reviews
            </div>
            <h2 className="font-display text-4xl leading-tight md:text-5xl">
              3,722 verified reviews.
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <div className="mono font-display text-4xl">4.8</div>
              <Stars rating={4.8} />
            </div>
            <div className="mono max-w-[14rem] text-xs text-muted-ink">
              Verified purchase reviews only. No paid placements, no gifted product.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {items.map((r) => (
            <div key={r.name} className="hairline flex flex-col bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="mono text-[10px] uppercase tracking-widest" style={{ color: r.accent }}>
                  {r.p}
                </span>
                <Stars rating={r.r} size="xs" />
              </div>
              <div className="mt-4 font-display text-lg leading-snug">{r.title}</div>
              <p className="mt-3 text-sm leading-relaxed text-muted-ink">{r.body}</p>
              <div className="hairline-t mt-6 flex items-center justify-between pt-4 text-xs">
                <div>
                  <div>{r.name}</div>
                  <div className="mono text-[10px] uppercase tracking-widest text-muted-ink">
                    {r.loc}
                  </div>
                </div>
                <div className="mono text-[10px] uppercase tracking-widest text-muted-ink">
                  Verified · {r.date}
                </div>
              </div>
            </div>
          ))}
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
          <p className="mt-6 text-sm text-muted-ink">
            Every subscription bills on a{" "}
            <span className="mono text-ink">28</span>-day cycle — not a calendar month — which
            works out to <span className="mono text-ink">13</span> cycles per year. Each bag
            contains <span className="mono text-ink">28</span> gummies, one per day, matched to
            your cycle.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">
          <div className="hairline bg-card">
            {PRODUCTS.map((p, i) => {
              const st = stack[p.id];
              const price = st.dose === 2 ? p.price2 : p.price1;
              return (
                <div
                  key={p.id}
                  className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-6 py-6 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] ${i > 0 ? "hairline-t" : ""}`}
                >
                  <button
                    onClick={() =>
                      setStack((s) => ({ ...s, [p.id]: { ...s[p.id], on: !s[p.id].on } }))
                    }
                    className={`hairline flex h-6 w-6 shrink-0 items-center justify-center ${st.on ? "bg-ink text-paper" : ""}`}
                    aria-label={`Toggle ${p.name}`}
                  >
                    {st.on && <span className="text-[11px]">✓</span>}
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 shrink-0"
                        style={{ backgroundColor: p.accent }}
                      />
                      <span className="font-display text-lg">{p.name}</span>
                    </div>
                    <div className="mono mt-0.5 text-xs text-muted-ink truncate">
                      {p.ingredient} · {p.dose}
                    </div>
                  </div>
                  <div className="hairline col-span-2 grid grid-cols-2 text-xs sm:col-span-1">
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
                disabled={selectedCount === 0}
                className="w-full bg-paper px-4 py-3 text-xs font-medium uppercase tracking-widest text-ink hover:opacity-90 disabled:opacity-30"
              >
                {isSub ? "Checkout · Start subscription" : "Checkout · One-time order"}
              </button>
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
      a: "Before a batch ships, an independent EU laboratory (Eurofins Scientific) assays potency, heavy metals, and microbial content. The full Certificate of Analysis is published on the product page and shipped with your order.",
    },
    {
      q: "Shipping and returns?",
      a: "Free EU shipping over €40, otherwise €3.90. Ships within 48 h from Rotterdam. 60-day satisfaction guarantee — full refund, no questions asked.",
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
            <div className="font-display text-2xl">GumLab</div>
            <div className="mono mt-2 text-[11px] uppercase tracking-widest text-muted-ink">
              EU / 001
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-ink">
              Precision-dosed functional gummies. Third-party assayed, published batch-by-batch.
            </p>
            <form className="hairline mt-6 flex max-w-sm items-center bg-card">
              <input
                type="email"
                placeholder="Your email"
                className="mono flex-1 bg-transparent px-3 py-2.5 text-xs outline-none placeholder:text-muted-ink"
              />
              <button
                type="button"
                className="bg-ink px-4 py-2.5 text-[11px] font-medium uppercase tracking-widest text-paper hover:opacity-90"
              >
                Subscribe
              </button>
            </form>
            <div className="mono mt-2 text-[10px] uppercase tracking-widest text-muted-ink">
              Batch releases · lab reports · no spam
            </div>
          </div>
          <FooterCol
            title="Shop"
            links={["Perform", "Calm", "Recover", "Build your stack"]}
          />
          <FooterCol
            title="Verification"
            links={["Certificates", "Testing method", "Batch archive", "Ingredient sourcing"]}
          />
          <FooterCol
            title="Help"
            links={["Shipping (EU)", "Returns", "Contact", "Terms & privacy"]}
          />
        </div>

        <div className="hairline-t mt-16 pt-8">
          <p className="max-w-4xl text-[11px] leading-relaxed text-muted-ink">
            Food supplements should not be used as a substitute for a varied and balanced diet
            and a healthy lifestyle. Consult a doctor before use if you are pregnant,
            breastfeeding, on medication, or have a medical condition. These products are not
            intended to diagnose, treat, cure or prevent any disease. Claims used are limited to
            those authorised under EU Regulation (EC) No 1924/2006. Keep out of reach of
            children.
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
  return (
    <div>
      <div className="mono mb-4 text-[11px] uppercase tracking-widest text-muted-ink">
        {title}
      </div>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="hover:opacity-70">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Prevent tree-shake warning on unused import in some setups
void useMemo;
