// Shopify Storefront API client + cart mutations
export const SHOPIFY_API_VERSION = "2025-07";
export const SHOPIFY_STORE_PERMANENT_DOMAIN = "saveeruope.myshopify.com";
export const SHOPIFY_STOREFRONT_TOKEN = "96c22fb706cd08fe36ccaa48b0a32762";
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

// Product created in Shopify
export const CREATINE_PRODUCT = {
  handle: "creatine-gummies-180-gummies",
  variants: {
    subscribe: "gid://shopify/ProductVariant/56567088447828",
    onetime: "gid://shopify/ProductVariant/56567129080148",
  },
};

export type ShopifyImage = { url: string; altText: string | null };
export type ShopifyVariant = {
  id: string;
  title: string;
  price: { amount: string; currencyCode: string };
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
};
export type ShopifyProduct = {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
    images: { edges: Array<{ node: ShopifyImage }> };
    variants: { edges: Array<{ node: ShopifyVariant }> };
    options: Array<{ name: string; values: string[] }>;
  };
};

export async function storefrontApiRequest<T = any>(query: string, variables: any = {}): Promise<{ data?: T; errors?: any } | undefined> {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (response.status === 402) {
    console.error("Shopify billing required — upgrade store plan at https://admin.shopify.com");
    return;
  }
  if (!response.ok) throw new Error(`Shopify HTTP ${response.status}`);
  const data = await response.json();
  if (data.errors) throw new Error(`Shopify error: ${data.errors.map((e: any) => e.message).join(", ")}`);
  return data;
}

function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    // Force the Shopify-hosted checkout domain. If the shop has a custom
    // primary domain (e.g. gumlab.se) Shopify returns that host, which routes
    // back into this app and 404s instead of hitting Shopify's checkout.
    url.host = SHOPIFY_STORE_PERMANENT_DOMAIN;
    url.protocol = "https:";
    url.searchParams.set("channel", "online_store");
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

function isCartNotFound(errors: Array<{ message: string }>): boolean {
  return errors.some((e) => {
    const m = e.message.toLowerCase();
    return m.includes("cart not found") || m.includes("does not exist");
  });
}

const CART_CREATE = `mutation cartCreate($input: CartInput!){cartCreate(input:$input){cart{id checkoutUrl lines(first:100){edges{node{id merchandise{... on ProductVariant{id}}}}}} userErrors{field message}}}`;
const CART_LINES_ADD = `mutation cartLinesAdd($cartId:ID!,$lines:[CartLineInput!]!){cartLinesAdd(cartId:$cartId,lines:$lines){cart{id lines(first:100){edges{node{id merchandise{... on ProductVariant{id}}}}}} userErrors{field message}}}`;
const CART_LINES_UPDATE = `mutation cartLinesUpdate($cartId:ID!,$lines:[CartLineUpdateInput!]!){cartLinesUpdate(cartId:$cartId,lines:$lines){cart{id} userErrors{field message}}}`;
const CART_LINES_REMOVE = `mutation cartLinesRemove($cartId:ID!,$lineIds:[ID!]!){cartLinesRemove(cartId:$cartId,lineIds:$lineIds){cart{id} userErrors{field message}}}`;
export const CART_QUERY = `query cart($id:ID!){cart(id:$id){id totalQuantity}}`;

export type CartLineInput = { variantId: string; quantity: number };

export async function createShopifyCart(item: CartLineInput): Promise<{ cartId: string; checkoutUrl: string; lineId: string } | null> {
  const data = await storefrontApiRequest(CART_CREATE, {
    input: { lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] },
  });
  const errs = data?.data?.cartCreate?.userErrors ?? [];
  if (errs.length) { console.error("cartCreate failed", errs); return null; }
  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) return null;
  const lineId = cart.lines.edges[0]?.node?.id;
  if (!lineId) return null;
  return { cartId: cart.id, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId };
}

export async function addLineToShopifyCart(cartId: string, item: CartLineInput): Promise<{ success: boolean; lineId?: string; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_ADD, {
    cartId,
    lines: [{ quantity: item.quantity, merchandiseId: item.variantId }],
  });
  const errs = data?.data?.cartLinesAdd?.userErrors ?? [];
  if (isCartNotFound(errs)) return { success: false, cartNotFound: true };
  if (errs.length) { console.error("cartLinesAdd failed", errs); return { success: false }; }
  const lines = data?.data?.cartLinesAdd?.cart?.lines?.edges ?? [];
  const line = lines.find((l: any) => l.node.merchandise.id === item.variantId);
  return { success: true, lineId: line?.node?.id };
}

export async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number) {
  const data = await storefrontApiRequest(CART_LINES_UPDATE, {
    cartId, lines: [{ id: lineId, quantity }],
  });
  const errs = data?.data?.cartLinesUpdate?.userErrors ?? [];
  if (isCartNotFound(errs)) return { success: false, cartNotFound: true };
  if (errs.length) return { success: false };
  return { success: true };
}

export async function removeLineFromShopifyCart(cartId: string, lineId: string) {
  const data = await storefrontApiRequest(CART_LINES_REMOVE, { cartId, lineIds: [lineId] });
  const errs = data?.data?.cartLinesRemove?.userErrors ?? [];
  if (isCartNotFound(errs)) return { success: false, cartNotFound: true };
  if (errs.length) return { success: false };
  return { success: true };
}
