Perfekt — då kör vi BYOK Stripe med ditt befintliga konto.

Rekommendation

Ja, det är både möjligt och, i GumLabs fall, **smart att byta till Stripe med ditt eget befintliga konto**. Vi använder då Lovable's "bring your own Stripe key"-integration (BYOK), vilket innebär att checkout och prenumerationer hanteras direkt av ditt Stripe-konto men sköts från GumLab-sajten.

Viktigt att ha med sig:
- **Alla nya kunder** går via Stripe Checkout.
- **De 2 aktiva Shopify-prenumerationerna** får löpa klart i Shopify — Stripe har inget smidigt sätt att automatiskt importera Shopify-subscription contracts.
- **De 3 historiska Shopify-ordrarna** behålls som read-only i `/account` så kunderna fortfarande ser sin historik.
- **Kostnad:** Du slipper Shopify-plattformens månadsavgifter, men du får själv se till att frakt och moms är korrekt konfigurerat i Stripe.

Förutsättningar — vad jag behöver från dig

1. **Stripe API-nycklar**
   - `STRIPE_SECRET_KEY` (test och live) — sparas säkert via Lovable secrets.
   - `STRIPE_PUBLISHABLE_KEY` (kan ligga i koden, är ju publik).
2. **Har du redan skapat produkt och priser i Stripe?** (Subscription 390 SEK / 60 dagar och One-time 449 SEK.) Säg till om de redan finns, annars skapar vi dem via Stripe API.
3. **Har du Stripe Tax aktiverat i ditt Stripe-konto?** Det behövs för att räkna ut EU-moms på fysiska varor.
4. **Bekräfta frakt:** Ska vi behålla "gratis EU-frakt över €40, annars €3.90" även i Stripe Checkout?
5. **Nuvarande Shopify-prenumerationer:** Ska de få löpa ut av sig själva, eller vill du manuellt kontakta de 2 kunderna och få dem att skapa nya Stripe-prenumerationer?

Plan

1. **Aktivera BYOK Stripe-integration**
   - Lägg till `STRIPE_SECRET_KEY` i projektets secrets (via add_secret).
   - Lägg till `STRIPE_PUBLISHABLE_KEY` i koden.

2. **Skapa produkt och priser i Stripe (om inte redan gjort)**
   - Produkt: "Creatine Gummies — 180 Gummies".
   - Prenumerationspris: 390 SEK var 60:e dag.
   - Engångspris: 449 SEK.
   - Sätt korrekt Stripe tax-code för kosttillskott.

3. **Byt ut checkout på startsidan**
   - Ersätt Shopify-cart-knapparna i `src/routes/index.tsx` med Stripe Checkout-sessioner.
   - Subscription-knapp → Stripe Checkout i `subscription` mode.
   - One-time-knapp → Stripe Checkout i `payment` mode.
   - Skicka med kundens e-post om de är inloggade.

4. **Frakt och moms i Stripe**
   - Konfigurera shipping rates i Stripe Checkout (gratis EU-frakt över tröskel, annars flat fee).
   - Aktivera Stripe Tax om möjligt, annars hanterar vi momsen manuellt i priserna.

5. **Stripe-webhook**
   - Skapa `src/routes/api/public/stripe-webhook.ts`.
   - Hantera `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`.
   - Spara ordrar och prenumerationer i Supabase, länkade mot e-post.

6. **Uppdatera `/account`**
   - Hämta Stripe-prenumerationer och ordrar via Stripe API.
   - Lägg till "Manage billing"-länk till Stripe Customer Portal för paus, avbokning och betalkortsändring.
   - Behåll Shopify-historiken som read-only.

7. **Rensa Shopify-kod**
   - Ta bort Shopify storefront/admin-anrop och variant-ID:n från `src/lib/shopify.ts` och `src/routes/index.tsx`.
   - Behåll Shopify-webhooken (`src/routes/api/public/shopify-webhook.ts`) tills sista aktiva prenumeration är avslutad, sedan ta bort den.

8. **Test och live**
   - Testa hela flödet med Stripe test mode.
   - Byt till live keys och publicera.
   - Verifiera att nya prenumerationer och ordrar dyker upp i `/account`.

Nästa steg

Svara på de fem förutsättningarna ovan — särskilt behöver jag Stripe API-nycklarna och veta om produkt/priser redan finns i Stripe — så börjar jag implementera.