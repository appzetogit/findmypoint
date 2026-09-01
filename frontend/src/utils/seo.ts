/**
 * Frontend SEO Management Utility: Meta Tags, Canonical Links, OpenGraph, and Schema.org JSON-LD Structured Data
 */

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string | string[];
  canonicalUrl?: string;
  robots?: string; // e.g. "index, follow" or "noindex, nofollow"
  og?: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
  };
  schemas?: Record<string, any>[];
}

function setOrCreateMeta(name: string, content: string, isProperty = false) {
  if (!content) return;
  const attribute = isProperty ? "property" : "name";
  let tag = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setOrCreateCanonical(url: string) {
  if (!url) return;
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

function setStructuredData(schemas: Record<string, any>[]) {
  const SCRIPT_ID = "fmp-jsonld-structured-data";
  const existingScript = document.getElementById(SCRIPT_ID);
  if (existingScript) {
    existingScript.remove();
  }

  if (!schemas || schemas.length === 0) return;

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.type = "application/ld+json";
  // If multiple schemas, wrap in an array or render main
  script.text = JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);
  document.head.appendChild(script);
}

/**
 * Apply SEO tags and structured data dynamically
 */
export function applySEO(config: SEOConfig) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // 1. Page Title
  if (config.title) {
    document.title = config.title;
  }

  // 2. Meta Description
  if (config.description) {
    setOrCreateMeta("description", config.description);
  }

  // 3. Meta Keywords
  if (config.keywords) {
    const kw = Array.isArray(config.keywords) ? config.keywords.join(", ") : config.keywords;
    setOrCreateMeta("keywords", kw);
  }

  // 4. Robots Directives
  setOrCreateMeta("robots", config.robots || "index, follow");

  // 5. Canonical Link
  if (config.canonicalUrl) {
    const fullCanonical = config.canonicalUrl.startsWith("http")
      ? config.canonicalUrl
      : `${window.location.origin}${config.canonicalUrl.startsWith("/") ? "" : "/"}${config.canonicalUrl}`;
    setOrCreateCanonical(fullCanonical);
  }

  // 6. Open Graph Tags
  if (config.og) {
    setOrCreateMeta("og:title", config.og.title || config.title || "", true);
    setOrCreateMeta("og:description", config.og.description || config.description || "", true);
    if (config.og.image) setOrCreateMeta("og:image", config.og.image, true);
    if (config.og.url) setOrCreateMeta("og:url", config.og.url, true);
    setOrCreateMeta("og:type", config.og.type || "website", true);
    setOrCreateMeta("og:site_name", "FindMyPoint", true);
  }

  // 7. Twitter Card Tags
  if (config.twitter) {
    setOrCreateMeta("twitter:card", config.twitter.card || "summary_large_image");
    setOrCreateMeta("twitter:title", config.twitter.title || config.title || "");
    setOrCreateMeta("twitter:description", config.twitter.description || config.description || "");
    if (config.twitter.image) setOrCreateMeta("twitter:image", config.twitter.image);
  }

  // 8. Schema.org JSON-LD
  if (config.schemas && config.schemas.length > 0) {
    setStructuredData(config.schemas);
  }
}

/**
 * Generate Structured Data objects for a business profile
 */
export function buildBusinessSchemas(biz: any, origin: string) {
  if (!biz || !biz.name) return [];

  const canonical = biz.canonicalUrl || `/${biz.citySlug || 'india'}/${biz.localitySlug || 'center'}/${biz.slug || biz.id}`;
  const fullUrl = `${origin}${canonical}`;
  const images = Array.isArray(biz.images) && biz.images.length > 0 ? biz.images : [];

  // 1. LocalBusiness / Organization Schema
  const localBusinessSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": biz.businessType || "LocalBusiness",
    "name": biz.name,
    "url": fullUrl,
    ...(images.length > 0 ? { "image": images } : {}),
    ...(biz.phone ? { "telephone": biz.phone } : {}),
    ...(biz.email ? { "email": biz.email } : {}),
    ...(biz.website ? { "sameAs": [biz.website] } : {}),
    "address": {
      "@type": "PostalAddress",
      "streetAddress": biz.address || biz.location || "",
      "addressLocality": biz.cityTown || biz.district || "",
      "addressRegion": biz.state || "",
      "postalCode": biz.pincode || "",
      "addressCountry": biz.country || "IN"
    },
    ...(biz.latitude && biz.longitude ? {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": Number(biz.latitude),
        "longitude": Number(biz.longitude)
      }
    } : {}),
    ...(biz.locationLink ? { "hasMap": biz.locationLink } : {}),
    ...(Number(biz.rating) > 0 && Number(biz.reviewCount) > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": Number(biz.rating).toFixed(1),
        "reviewCount": Number(biz.reviewCount),
        "bestRating": "5",
        "worstRating": "1"
      }
    } : {}),
    "priceRange": "₹₹"
  };

  // 2. BreadcrumbList Schema
  const city = biz.cityTown || biz.district || "";
  const locality = biz.location || "";

  const breadcrumbSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": origin
      },
      ...(city ? [{
        "@type": "ListItem",
        "position": 2,
        "name": city,
        "item": `${origin}/${biz.citySlug || encodeURIComponent(city.toLowerCase().replace(/\s+/g, '-'))}`
      }] : []),
      ...(locality ? [{
        "@type": "ListItem",
        "position": city ? 3 : 2,
        "name": locality,
        "item": `${origin}/${biz.citySlug || 'city'}/${biz.localitySlug || encodeURIComponent(locality.toLowerCase().replace(/\s+/g, '-'))}`
      }] : []),
      {
        "@type": "ListItem",
        "position": (city ? 1 : 0) + (locality ? 1 : 0) + 2,
        "name": biz.name,
        "item": `${origin}${biz.canonicalUrl || `/${biz.id}`}`
      }
    ]
  };

  const schemas = [localBusinessSchema, breadcrumbSchema];

  // 3. FAQPage Schema (if verified FAQs exist)
  if (Array.isArray(biz.faqs) && biz.faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": biz.faqs.map((faq: { question: string; answer: string }) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    });
  }

  return schemas;
}
