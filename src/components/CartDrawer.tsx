import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";

export function CartButton() {
  const { items, setOpen } = useCartStore();
  const total = items.reduce((s, i) => s + i.quantity, 0);
  return (
    <button
      type="button"
      aria-label="Open cart"
      onClick={() => setOpen(true)}
      className="relative inline-flex h-10 items-center gap-2 rounded-full border border-hairline bg-paper px-4 text-xs uppercase tracking-widest text-ink transition hover:border-ink"
    >
      Cart
      {total > 0 && (
        <span className="mono grid h-5 min-w-[20px] place-items-center rounded-full bg-ink px-1 text-[10px] text-paper">
          {total}
        </span>
      )}
    </button>
  );
}

export function CartDrawer() {
  const { items, isOpen, setOpen, updateQuantity, removeItem, getCheckoutUrl, isLoading, isSyncing, syncCart } = useCartStore();
  const total = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "SEK";

  useEffect(() => { if (isOpen) syncCart(); }, [isOpen, syncCart]);

  const handleCheckout = () => {
    const url = getCheckoutUrl();
    if (url) {
      window.open(url, "_blank");
      setOpen(false);
    }
  };

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-[120] transition ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-ink/40 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-label="Shopping cart"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl transition-transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <header className="flex items-center justify-between border-b border-hairline px-6 py-5">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.28em] text-muted-ink">Your cart</div>
            <div className="font-display text-xl">{items.length === 0 ? "Empty" : `${items.reduce((s, i) => s + i.quantity, 0)} item(s)`}</div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mono rounded-full border border-hairline px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-ink hover:border-ink hover:text-ink"
          >
            Close
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="mt-16 text-center">
              <div className="mono text-[11px] uppercase tracking-widest text-muted-ink">Your cart is empty.</div>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((i) => (
                <li key={i.variantId} className="flex gap-4 rounded-2xl border border-hairline bg-card p-4">
                  {i.image && (
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-paper-2">
                      <img src={i.image} alt={i.productTitle} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-base">{i.productTitle}</div>
                    <div className="mono text-[10px] uppercase tracking-widest text-muted-ink">{i.variantTitle}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="mono text-sm">{parseFloat(i.price.amount).toFixed(0)} {i.price.currencyCode}</div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(i.variantId, i.quantity - 1)}
                          className="h-7 w-7 rounded-full border border-hairline text-sm hover:border-ink"
                          aria-label="Decrease quantity"
                        >−</button>
                        <span className="mono w-6 text-center text-sm">{i.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(i.variantId, i.quantity + 1)}
                          className="h-7 w-7 rounded-full border border-hairline text-sm hover:border-ink"
                          aria-label="Increase quantity"
                        >+</button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(i.variantId)}
                      className="mono mt-2 text-[10px] uppercase tracking-widest text-muted-ink underline underline-offset-4 hover:text-ink"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-hairline px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="mono text-[10px] uppercase tracking-widest text-muted-ink">Subtotal</div>
              <div className="mono text-lg">{total.toFixed(0)} {currency}</div>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isLoading || isSyncing}
              className="w-full rounded-full bg-ink px-6 py-4 text-sm font-medium uppercase tracking-widest text-paper transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
            >
              {isLoading || isSyncing ? "Working…" : "Checkout — Secure"}
            </button>
            <div className="mono mt-3 text-center text-[10px] uppercase tracking-widest text-muted-ink">
              Taxes & shipping calculated at checkout
            </div>
          </footer>
        )}
      </aside>
    </div>
  );
}
