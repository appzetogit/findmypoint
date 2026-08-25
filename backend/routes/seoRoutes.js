const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const Category = require('../models/Category');
const TouristPlace = require('../models/TouristPlace');
const Article = require('../models/Article');
const { slugify } = require('../utils/slugify');

const getBaseUrl = (req) => {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.get('host') || 'localhost:5173';
  // If host is backend port 5000 in dev, default to frontend 5173 or current origin
  return `${protocol}://${host}`;
};

// @desc    Dynamic XML Sitemap
// @route   GET /sitemap.xml, /api/sitemap.xml
router.get(['/sitemap.xml', '/api/sitemap.xml'], async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);

    // Fetch published & indexable businesses
    const businesses = await Business.find(
      { status: 'published', isIndexable: { $ne: false } },
      'canonicalUrl updatedAt name'
    ).lean();

    // Fetch categories
    const categories = await Category.find({}, 'label name updatedAt').lean().catch(() => []);

    // Fetch tourist places
    const places = await TouristPlace.find({}, 'name updatedAt').lean().catch(() => []);

    // Fetch articles
    const articles = await Article.find({}, 'id title updatedAt').lean().catch(() => []);

    const nowIso = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // Static Pages
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${nowIso}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${baseUrl}/categories</loc>\n    <lastmod>${nowIso}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${baseUrl}/advertise</loc>\n    <lastmod>${nowIso}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;

    // Business Profile URLs
    for (const biz of businesses) {
      if (biz.canonicalUrl) {
        const lastmod = biz.updatedAt ? new Date(biz.updatedAt).toISOString() : nowIso;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}${biz.canonicalUrl}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        xml += `  </url>\n`;
      }
    }

    // Category URLs
    for (const cat of categories) {
      const categoryName = cat.label || cat.name;
      if (categoryName) {
        const lastmod = cat.updatedAt ? new Date(cat.updatedAt).toISOString() : nowIso;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/category/${encodeURIComponent(categoryName)}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      }
    }

    // Tourist Place URLs
    for (const place of places) {
      if (place.name) {
        const lastmod = place.updatedAt ? new Date(place.updatedAt).toISOString() : nowIso;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/place/${encodeURIComponent(place.name)}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      }
    }

    // Article URLs
    for (const art of articles) {
      if (art.id) {
        const lastmod = art.updatedAt ? new Date(art.updatedAt).toISOString() : nowIso;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/article/${art.id}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      }
    }

    xml += `</urlset>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// @desc    Dynamic robots.txt
// @route   GET /robots.txt
router.get('/robots.txt', (req, res) => {
  const baseUrl = getBaseUrl(req);
  const robots = `User-agent: *
Allow: /
Allow: /indore/
Allow: /business/
Allow: /category/
Allow: /place/
Allow: /article/
Allow: /service/
Allow: /categories
Allow: /advertise
Allow: /assets/
Allow: /public/
Allow: /src/
Disallow: /admin/
Disallow: /client/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.status(200).send(robots);
});

// @desc    Google Search Console Verification File Handler
// @route   GET /google:code.html
router.get('/google:code.html', (req, res) => {
  const code = req.params.code;
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`google-site-verification: google${code}.html`);
});

// @desc    Generate Complete SEO & Structured Data for a Business
// @route   GET /api/seo/business/:city/:locality/:slug
router.get('/api/seo/business/:city/:locality/:slug', async (req, res) => {
  try {
    const citySlug = slugify(req.params.city);
    const localitySlug = slugify(req.params.locality);
    const slug = slugify(req.params.slug);

    const business = await Business.findOne({
      citySlug,
      localitySlug,
      slug,
      status: 'published'
    }).lean();

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found or not published' });
    }

    const baseUrl = getBaseUrl(req);
    const canonicalUrl = `${baseUrl}${business.canonicalUrl || `/${citySlug}/${localitySlug}/${slug}`}`;

    const title = business.seoTitle || `${business.name} in ${business.location || ''}, ${business.cityTown || business.district || ''} - ${business.category || 'Local Business'} | FindMyPoint`;
    const description = business.seoDescription || `${business.name} in ${business.location || ''}, ${business.cityTown || ''}. ${business.rating > 0 ? `Rated ${business.rating}/5 (${business.reviewCount || 0} reviews). ` : ''}View contact info, services, photos, address and send enquiries.`;

    // LocalBusiness Schema
    const localBusinessSchema = {
      "@context": "https://schema.org",
      "@type": business.businessType || "LocalBusiness",
      "name": business.name,
      "url": canonicalUrl,
      ...(business.images && business.images.length > 0 ? { "image": business.images } : {}),
      ...(business.phone ? { "telephone": business.phone } : {}),
      ...(business.email ? { "email": business.email } : {}),
      ...(business.website ? { "sameAs": [business.website] } : {}),
      "address": {
        "@type": "PostalAddress",
        "streetAddress": business.address || business.location || "",
        "addressLocality": business.cityTown || business.district || "",
        "addressRegion": business.state || "",
        "postalCode": business.pincode || "",
        "addressCountry": business.country || "IN"
      },
      ...(business.rating > 0 && business.reviewCount > 0 ? {
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": Number(business.rating).toFixed(1),
          "reviewCount": Number(business.reviewCount),
          "bestRating": "5",
          "worstRating": "1"
        }
      } : {}),
      "priceRange": "₹₹"
    };

    // Breadcrumb Schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": business.cityTown || citySlug,
          "item": `${baseUrl}/${citySlug}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": business.location || localitySlug,
          "item": `${baseUrl}/${citySlug}/${localitySlug}`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": business.name,
          "item": canonicalUrl
        }
      ]
    };

    // FAQ Schema (if FAQs available)
    let faqSchema = null;
    if (business.faqs && business.faqs.length > 0) {
      faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": business.faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      };
    }

    res.status(200).json({
      success: true,
      seo: {
        title,
        description,
        canonicalUrl,
        keywords: business.seoKeywords || [],
        og: {
          title,
          description,
          url: canonicalUrl,
          type: "business.business",
          image: (business.images && business.images[0]) || `${baseUrl}/src/assets/logo.png`
        },
        schemas: [
          localBusinessSchema,
          breadcrumbSchema,
          ...(faqSchema ? [faqSchema] : [])
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
