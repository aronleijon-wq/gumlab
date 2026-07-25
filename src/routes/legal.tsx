import { createFileRoute, Link } from "@tanstack/react-router";
import gumlabLogo from "@/assets/gumlab-logo.png.asset.json";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Legal Notice — GumLab" },
      {
        name: "description",
        content:
          "Legal notice, company information, disclaimers, shipping, returns, intellectual property and governing law for GumLab.",
      },
      { property: "og:title", content: "Legal Notice — GumLab" },
      {
        property: "og:description",
        content:
          "Company information, disclaimers, shipping, returns and intellectual property for GumLab.",
      },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://gumlab.se/legal" }],
  }),
  component: LegalPage,
});

function LegalPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-hairline bg-paper/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" aria-label="GumLab" className="flex items-center">
            <img src={gumlabLogo.url} alt="GumLab" className="h-14 w-auto" />
          </Link>
          <Link
            to="/"
            className="rounded-full border border-hairline px-4 py-2 text-xs uppercase tracking-widest transition hover:bg-paper-2"
          >
            Back to home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="mb-12">
          <div className="mono mb-4 text-[11px] uppercase tracking-[0.28em] text-muted-ink">
            Legal Notice
          </div>
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            Terms, disclaimers & contact.
          </h1>
        </div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-x-16 md:gap-y-12">
          <div>
            <h2 className="font-display text-xl text-ink">Company Information</h2>
            <div className="mt-4 space-y-2 text-sm leading-relaxed text-muted-ink">
              <p><strong className="text-ink">Operated by:</strong> GumLab.se</p>
              <p><strong className="text-ink">Registered Address:</strong><br />Karl Gerhards Väg 9<br />Sweden</p>
              <p><strong className="text-ink">Email:</strong> <a href="mailto:support@gumlab.se" className="underline underline-offset-4 hover:text-ink">support@gumlab.se</a></p>
              <p><strong className="text-ink">Website:</strong> <a href="https://gumlab.se" className="underline underline-offset-4 hover:text-ink">https://gumlab.se</a></p>
              <p><strong className="text-ink">Organization Number (VAT / Company Registration):</strong> Under construction</p>
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Disclaimer</h2>
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
            <h2 className="font-display text-xl text-ink">Product Information</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-ink">
              We strive to ensure that all product descriptions, nutritional information, ingredients, and images are accurate. However, packaging, formulations, or specifications may change over time.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-ink">
              Please always read the label on the product before use.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Shipping</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-ink">
              <li>We currently ship to selected European countries.</li>
              <li>Estimated delivery times are provided for guidance only and are not guaranteed.</li>
              <li>Delays caused by customs authorities, postal services, couriers, or circumstances beyond our control are not our responsibility.</li>
              <li>Customers are responsible for ensuring that dietary supplements may legally be imported into their country.</li>
              <li>Risk of loss transfers to the customer upon delivery.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Returns</h2>
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
            <h2 className="font-display text-xl text-ink">Intellectual Property</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-ink">
              All content on this website — including text, graphics, logos, images, branding, and design — is the property of GumLab unless otherwise stated and may not be copied, reproduced, or distributed without prior written permission.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Governing Law</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-ink">
              This website and any purchases made through it are governed by the laws of Sweden.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-ink">
              Any disputes shall be subject to the exclusive jurisdiction of the Swedish courts unless mandatory consumer protection laws provide otherwise.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Contact</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-ink">
              For any legal, shipping, or customer support inquiries, please contact:
            </p>
            <div className="mt-3 space-y-1 text-sm text-muted-ink">
              <p>Email: <a href="mailto:support@gumlab.se" className="underline underline-offset-4 hover:text-ink">support@gumlab.se</a></p>
              <p>Website: <a href="https://gumlab.se" className="underline underline-offset-4 hover:text-ink">https://gumlab.se</a></p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
