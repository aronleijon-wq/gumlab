import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact us — GumLab" },
      {
        name: "description",
        content:
          "Get in touch with GumLab. Questions about batch certificates, subscriptions, or ingredients — we read every message ourselves.",
      },
      { property: "og:title", content: "Contact us — GumLab" },
      {
        property: "og:description",
        content: "Talk to the GumLab team directly.",
      },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [feedback, setFeedback] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setFeedback("");
    try {
      // Store as newsletter signup fallback with metadata; a dedicated
      // messages table can replace this later.
      const { error } = await supabase.from("newsletter_signups").insert({
        email,
        source: `contact: ${name} — ${message}`.slice(0, 500),
      });
      if (error) throw error;
      setStatus("ok");
      setFeedback("Thanks — we'll get back to you shortly.");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
      setFeedback("Something went wrong. Please email hello@gumlab.se instead.");
    }
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <div className="mono mb-4 text-xs uppercase tracking-[0.2em] text-muted-ink">
          § — Contact
        </div>
        <h1 className="font-display text-4xl leading-tight md:text-5xl">
          Talk to us directly.
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-ink/80">
          Questions about batch certificates, subscriptions, ingredients, or
          feedback on the product? We read every message ourselves and reply
          within one working day.
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-5">
          <div>
            <label className="mono mb-2 block text-[11px] uppercase tracking-widest text-muted-ink">
              Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="hairline w-full bg-card px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </div>
          <div>
            <label className="mono mb-2 block text-[11px] uppercase tracking-widest text-muted-ink">
              Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="hairline w-full bg-card px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </div>
          <div>
            <label className="mono mb-2 block text-[11px] uppercase tracking-widest text-muted-ink">
              Message
            </label>
            <textarea
              required
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="hairline w-full resize-none bg-card px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="mono bg-ink px-6 py-3 text-[11px] uppercase tracking-widest text-paper transition hover:opacity-90 disabled:opacity-50"
          >
            {status === "loading" ? "Sending…" : "Send message"}
          </button>
          {feedback && (
            <p
              className={`mono text-[11px] uppercase tracking-widest ${
                status === "ok" ? "text-ink" : "text-destructive"
              }`}
            >
              {feedback}
            </p>
          )}
        </form>

        <div className="hairline-t mt-16 pt-8 text-sm text-muted-ink">
          <div>
            Or email us directly at{" "}
            <a href="mailto:hello@gumlab.se" className="text-ink underline">
              hello@gumlab.se
            </a>
            .
          </div>
          <div className="mt-6">
            <Link to="/" className="mono text-[11px] uppercase tracking-widest hover:opacity-70">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
