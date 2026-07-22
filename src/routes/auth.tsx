import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import gumlabLogo from "@/assets/gumlab-logo.png.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · GumLab" },
      { name: "description", content: "Sign in or create your GumLab account to manage subscriptions, dose, and orders." },
      { property: "og:title", content: "Sign in · GumLab" },
      { property: "og:description", content: "Sign in or create your GumLab account." },
      { property: "og:url", content: "https://gumlab.se/auth" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://gumlab.se/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/account" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/account" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (result.error) setError(result.error.message ?? "Google sign-in failed");
    if (!result.error && !result.redirected) navigate({ to: "/account" });
  }

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <header className="hairline-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center">
            <img src={gumlabLogo.url} alt="GumLab" className="h-14 w-auto" />
          </Link>
          <Link to="/" className="text-xs uppercase tracking-widest hover:opacity-70">← Back</Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <div className="mono text-[10px] uppercase tracking-[0.25em] text-muted-ink">
          {mode === "signup" ? "New account" : "Returning customer"}
        </div>
        <h1 className="mt-2 text-3xl">
          {mode === "signup" ? "Create your account" : "Sign in"}
        </h1>
        <p className="mt-3 text-sm text-muted-ink">
          Manage subscriptions, change dose, pause or cancel anytime, and view every batch you've received.
        </p>

        <button
          onClick={google}
          className="hairline mt-8 flex items-center justify-center gap-3 bg-paper px-4 py-3 text-sm hover:bg-paper-2"
        >
          <GoogleIcon /> Continue with Google
        </button>

        <div className="mt-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-muted-ink">
          <div className="h-px flex-1 bg-hairline" /> or email <div className="h-px flex-1 bg-hairline" />
        </div>

        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <input
              required
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="hairline w-full bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
            />
          )}
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="hairline w-full bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <input
            required
            type="password"
            minLength={6}
            placeholder="Password (min 6)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="hairline w-full bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
          />
          {error && (
            <div className="hairline border-perform/40 bg-perform/10 px-3 py-2 text-xs text-perform">
              {error}
            </div>
          )}
          <button
            disabled={busy}
            className="w-full bg-ink px-4 py-3 text-xs font-medium uppercase tracking-widest text-paper disabled:opacity-60"
          >
            {busy ? "…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="mt-6 text-xs text-muted-ink hover:text-ink"
        >
          {mode === "signup" ? "Have an account? Sign in" : "New here? Create an account"}
        </button>
      </main>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.4 13.6 17.7 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.7c-.5 2.8-2.2 5.2-4.7 6.8l7.5 5.8c4.4-4.1 6.9-10.1 6.9-16.9z"/>
      <path fill="#FBBC05" d="M10.4 28.7A14.5 14.5 0 019.5 24c0-1.6.3-3.2.9-4.7l-7.8-6.1A24 24 0 000 24c0 3.9.9 7.5 2.6 10.8l7.8-6.1z"/>
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z"/>
    </svg>
  );
}
