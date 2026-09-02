/**
 * Crawler Pre-Rendering Middleware
 * 
 * Detects search engine crawlers (Googlebot, Bingbot, etc.) and serves them
 * a fully rendered HTML page with complete SEO metadata, structured data,
 * and visible business content — instead of the empty React SPA shell.
 * 
 * Normal users still get the React SPA (index.html) as before.
 */

const Business = require('../models/Business');
const Category = require('../models/Category');
const TouristPlace = require('../models/TouristPlace');
const Article = require('../models/Article');
const { slugify } = require('../utils/slugify');

// Known search engine crawler User-Agent patterns
const CRAWLER_PATTERNS = [
  'googlebot',
  'google-inspectiontool',       // Google Search Console URL Inspection
  'google-structured-data-testing-tool',
  'bingbot',
  'slurp',                       // Yahoo
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'sogou',
  'exabot',
  'facebot',                     // Facebook crawler
  'facebookexternalhit',
  'ia_archiver',                 // Alexa
  'twitterbot',
  'linkedinbot',
  'embedly',
  'showyoubot',
  'outbrain',
  'pinterest',
  'applebot',
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'dotbot',
  'petalbot',
  'bytespider',
  'gptbot',
  'claudebot',
];

// Reserved route prefixes that should NOT be pre-rendered
const RESERVED_ROUTES = [
  'admin', 'client', 'api', 'uploads', 'src', 'assets', 'public',
  'sidebar', 'tab', 'verify', 'employee', 'node_modules', '.well-known',
  'favicon', 'manifest', 'service-worker', 'sitemap.xml', 'robots.txt'
];

/**
 * Check if a User-Agent string belongs to a known search engine crawler
 */
function isCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return CRAWLER_PATTERNS.some(pattern => ua.includes(pattern));
}

/**
 * Get the base URL for canonical links
 */
function getBaseUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  if (process.env.PRODUCTION_URL) return process.env.PRODUCTION_URL.replace(/\/$/, '');
  const host = req ? req.get('host') : null;
  if (!host || host.includes('localhost') || host.includes('127.0.0.1')) {
    return 'https://findmypoint.app';
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  return `${protocol}://${host}`;
}

/**
 * Escape HTML special characters to prevent XSS in pre-rendered content
 */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generate a full pre-rendered HTML page for a business
 */
function renderBusinessPage(biz, baseUrl) {
  const locParts = [biz.location, biz.cityTown || biz.district].filter(Boolean);
  const title = biz.seoTitle || `${biz.name}${locParts.length ? ` in ${locParts.join(', ')}` : ''} - ${biz.category || 'Local Business'} | FindMyPoint`;
  const description = biz.seoDescription || `${biz.name} in ${locParts.join(', ')}. ${Number(biz.rating) > 0 ? `Rated ${biz.rating}/5 (${biz.reviewCount || 0} reviews). ` : ''}View contact info, services, photos, address and send enquiries on FindMyPoint.`;
  const canonicalPath = biz.canonicalUrl || `/${biz.citySlug || 'india'}/${biz.localitySlug || 'center'}/${biz.slug || biz.id}`;
  const canonicalUrl = `${baseUrl}${canonicalPath}`;
  const ogImage = (biz.images && biz.images.length > 0) ? biz.images[0] : `${baseUrl}/src/assets/logo.png`;
  const keywords = (biz.seoKeywords && biz.seoKeywords.length > 0)
    ? biz.seoKeywords.join(', ')
    : [biz.name, biz.category, biz.location, biz.cityTown, biz.district, 'FindMyPoint'].filter(Boolean).join(', ');

  // Build structured data schemas
  const schemas = [];

  // 1. LocalBusiness Schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": biz.businessType || "LocalBusiness",
    "name": biz.name,
    "url": canonicalUrl,
    ...(biz.images && biz.images.length > 0 ? { "image": biz.images } : {}),
    ...(biz.phone ? { "telephone": biz.phone } : {}),
    ...(biz.email ? { "email": biz.email } : {}),
    ...(biz.website ? { "sameAs": [biz.website] } : {}),
    ...(biz.description ? { "description": biz.description } : {}),
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
  schemas.push(localBusinessSchema);

  // 2. BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
      ...(biz.cityTown || biz.district ? [{
        "@type": "ListItem", "position": 2,
        "name": biz.cityTown || biz.district,
        "item": `${baseUrl}/${biz.citySlug || 'india'}`
      }] : []),
      ...(biz.location ? [{
        "@type": "ListItem", "position": 3,
        "name": biz.location,
        "item": `${baseUrl}/${biz.citySlug || 'india'}/${biz.localitySlug || 'center'}`
      }] : []),
      {
        "@type": "ListItem",
        "position": (biz.cityTown || biz.district ? 1 : 0) + (biz.location ? 1 : 0) + 2,
        "name": biz.name,
        "item": canonicalUrl
      }
    ]
  };
  schemas.push(breadcrumbSchema);

  // 3. FAQPage Schema
  if (biz.faqs && biz.faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": biz.faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
      }))
    });
  }

  // Build visible HTML content for crawlers
  const reviewsHtml = (biz.reviews && biz.reviews.length > 0)
    ? biz.reviews.slice(0, 5).map(r =>
      `<div class="review"><strong>${escHtml(r.userName)}</strong> — ⭐ ${r.rating}/5<p>${escHtml(r.reviewText)}</p></div>`
    ).join('\n')
    : '';

  const productsHtml = (biz.products && biz.products.length > 0)
    ? `<section><h2>Products & Services</h2><ul>${biz.products.map(p =>
      `<li><strong>${escHtml(p.name)}</strong> — ₹${escHtml(p.price)}${p.desc ? ` — ${escHtml(p.desc)}` : ''}</li>`
    ).join('')}</ul></section>`
    : '';

  const faqsHtml = (biz.faqs && biz.faqs.length > 0)
    ? `<section><h2>Frequently Asked Questions</h2>${biz.faqs.map(f =>
      `<div><h3>${escHtml(f.question)}</h3><p>${escHtml(f.answer)}</p></div>`
    ).join('')}</section>`
    : '';

  const facilitiesHtml = (biz.facilities && biz.facilities.length > 0)
    ? `<section><h2>Facilities</h2><ul>${biz.facilities.map(f => `<li>${escHtml(f)}</li>`).join('')}</ul></section>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escHtml(title)}</title>
  <meta name="description" content="${escHtml(description)}">
  <meta name="keywords" content="${escHtml(keywords)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${escHtml(canonicalUrl)}">
  
  <!-- Open Graph -->
  <meta property="og:site_name" content="FindMyPoint">
  <meta property="og:type" content="business.business">
  <meta property="og:title" content="${escHtml(title)}">
  <meta property="og:description" content="${escHtml(description)}">
  <meta property="og:url" content="${escHtml(canonicalUrl)}">
  <meta property="og:image" content="${escHtml(ogImage)}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escHtml(title)}">
  <meta name="twitter:description" content="${escHtml(description)}">
  <meta name="twitter:image" content="${escHtml(ogImage)}">
  
  <!-- Google Site Verification -->
  <meta name="google-site-verification" content="googleb386caefcdc89a69">
  
  <link rel="icon" type="image/png" href="/src/assets/chromelogo.png">
  
  <!-- Structured Data -->
  <script type="application/ld+json">${JSON.stringify(schemas)}</script>
  
  <!-- Google Fonts (match SPA) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background: #f9fafb; color: #1a1a1a; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { font-size: 1.8rem; margin-bottom: 8px; color: #111; }
    .meta { color: #666; font-size: 0.9rem; margin-bottom: 16px; }
    .rating { color: #f59e0b; font-weight: 600; }
    .section { margin: 24px 0; }
    .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; margin-right: 8px; }
    .review { border-bottom: 1px solid #e5e7eb; padding: 12px 0; }
    .cta { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 8px 4px; }
    .cta:hover { background: #1d4ed8; }
    a { color: #2563eb; }
    ul { padding-left: 20px; }
    img { max-width: 100%; height: auto; border-radius: 8px; }
    .breadcrumb { font-size: 0.85rem; color: #888; margin-bottom: 16px; }
    .breadcrumb a { color: #888; text-decoration: none; }
    .breadcrumb a:hover { color: #2563eb; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Breadcrumb -->
    <nav class="breadcrumb" aria-label="breadcrumb">
      <a href="${baseUrl}/">Home</a> ›
      ${biz.cityTown || biz.district ? `<a href="${baseUrl}/${biz.citySlug || 'india'}">${escHtml(biz.cityTown || biz.district)}</a> ›` : ''}
      ${biz.location ? `<a href="${baseUrl}/${biz.citySlug || 'india'}/${biz.localitySlug || 'center'}">${escHtml(biz.location)}</a> ›` : ''}
      <strong>${escHtml(biz.name)}</strong>
    </nav>

    <!-- Business Header -->
    <header>
      <h1>${escHtml(biz.name)}</h1>
      <p class="meta">
        ${biz.category ? `<span class="badge">${escHtml(biz.category)}</span>` : ''}
        ${biz.subCategoryLine ? `<span class="badge">${escHtml(biz.subCategoryLine)}</span>` : ''}
        ${biz.isVerified ? '<span class="badge" style="background:#dcfce7;color:#166534;">✓ Verified</span>' : ''}
      </p>
      ${Number(biz.rating) > 0 ? `<p class="rating">⭐ ${Number(biz.rating).toFixed(1)} / 5 (${biz.reviewCount || 0} reviews)</p>` : ''}
    </header>

    <!-- Images -->
    ${biz.images && biz.images.length > 0
      ? `<section class="section">${biz.images.slice(0, 3).map((img, i) =>
        `<img src="${escHtml(img)}" alt="${escHtml(biz.name)} - Photo ${i + 1}" loading="lazy">`
      ).join('\n')}</section>`
      : ''}

    <!-- Description -->
    ${biz.description ? `<section class="section"><h2>About ${escHtml(biz.name)}</h2><p>${escHtml(biz.description)}</p></section>` : ''}

    <!-- Contact Info -->
    <section class="section">
      <h2>Contact Information</h2>
      ${biz.address ? `<p>📍 <strong>Address:</strong> ${escHtml(biz.address)}</p>` : ''}
      ${biz.location ? `<p>📍 <strong>Location:</strong> ${escHtml(biz.location)}${biz.cityTown ? `, ${escHtml(biz.cityTown)}` : ''}${biz.district ? `, ${escHtml(biz.district)}` : ''}${biz.state ? `, ${escHtml(biz.state)}` : ''}${biz.pincode ? ` - ${escHtml(biz.pincode)}` : ''}</p>` : ''}
      ${biz.phone ? `<p>📞 <strong>Phone:</strong> <a href="tel:${escHtml(biz.phone)}">${escHtml(biz.phone)}</a></p>` : ''}
      ${biz.whatsapp ? `<p>💬 <strong>WhatsApp:</strong> <a href="https://wa.me/${escHtml(biz.whatsapp)}">${escHtml(biz.whatsapp)}</a></p>` : ''}
      ${biz.email ? `<p>✉️ <strong>Email:</strong> <a href="mailto:${escHtml(biz.email)}">${escHtml(biz.email)}</a></p>` : ''}
      ${biz.website ? `<p>🌐 <strong>Website:</strong> <a href="${escHtml(biz.website)}" rel="noopener">${escHtml(biz.website)}</a></p>` : ''}
      ${biz.timings ? `<p>🕐 <strong>Timings:</strong> ${escHtml(biz.timings)}</p>` : ''}
      ${biz.openTime ? `<p>🕐 <strong>Open:</strong> ${escHtml(biz.openTime)}${biz.closeTime ? ` – ${escHtml(biz.closeTime)}` : ''}</p>` : ''}
    </section>

    <!-- Products & Services -->
    ${productsHtml}

    <!-- Facilities -->
    ${facilitiesHtml}

    <!-- Reviews -->
    ${reviewsHtml ? `<section class="section"><h2>Customer Reviews</h2>${reviewsHtml}</section>` : ''}

    <!-- FAQs -->
    ${faqsHtml}

    <!-- CTA Buttons -->
    <section class="section">
      <a href="${escHtml(canonicalUrl)}" class="cta">View Full Details on FindMyPoint</a>
      ${biz.phone ? `<a href="tel:${escHtml(biz.phone)}" class="cta" style="background:#16a34a;">📞 Call Now</a>` : ''}
      ${biz.whatsapp ? `<a href="https://wa.me/${escHtml(biz.whatsapp)}" class="cta" style="background:#25d366;">💬 WhatsApp</a>` : ''}
    </section>

    <!-- Footer -->
    <footer style="margin-top:40px;padding:20px 0;border-top:1px solid #e5e7eb;color:#888;font-size:0.85rem;">
      <p><a href="${baseUrl}/">FindMyPoint</a> — Premium Local Business Directory. Discover trusted businesses, verified professionals and curated services across your city.</p>
      <p><a href="${baseUrl}/categories">All Categories</a> | <a href="${baseUrl}/advertise">Advertise</a></p>
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Generate a pre-rendered HTML page for a category
 */
function renderCategoryPage(categoryName, businesses, baseUrl) {
  const title = `${categoryName} — Best ${categoryName} Services Near You | FindMyPoint`;
  const description = `Find the best ${categoryName} services and businesses near you on FindMyPoint. Browse verified listings with ratings, reviews, contact details and more.`;
  const canonicalUrl = `${baseUrl}/category/${encodeURIComponent(categoryName)}`;

  const bizListHtml = businesses.slice(0, 20).map(biz => {
    const bizUrl = biz.canonicalUrl
      ? `${baseUrl}${biz.canonicalUrl}`
      : `${baseUrl}/business/${encodeURIComponent(biz.id)}`;
    return `<li>
      <a href="${escHtml(bizUrl)}"><strong>${escHtml(biz.name)}</strong></a>
      ${biz.location ? ` — ${escHtml(biz.location)}` : ''}
      ${biz.cityTown ? `, ${escHtml(biz.cityTown)}` : ''}
      ${Number(biz.rating) > 0 ? ` ⭐ ${Number(biz.rating).toFixed(1)}` : ''}
    </li>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escHtml(title)}</title>
  <meta name="description" content="${escHtml(description)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${escHtml(canonicalUrl)}">
  <meta property="og:site_name" content="FindMyPoint">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escHtml(title)}">
  <meta property="og:description" content="${escHtml(description)}">
  <meta property="og:url" content="${escHtml(canonicalUrl)}">
  <meta name="google-site-verification" content="googleb386caefcdc89a69">
  <link rel="icon" type="image/png" href="/src/assets/chromelogo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background: #f9fafb; color: #1a1a1a; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { font-size: 1.8rem; color: #111; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <nav style="font-size:0.85rem;color:#888;margin-bottom:16px;">
      <a href="${baseUrl}/">Home</a> › <a href="${baseUrl}/categories">Categories</a> › <strong>${escHtml(categoryName)}</strong>
    </nav>
    <h1>${escHtml(categoryName)} on FindMyPoint</h1>
    <p>${escHtml(description)}</p>
    ${bizListHtml ? `<h2>Top ${escHtml(categoryName)} Businesses</h2><ul>${bizListHtml}</ul>` : '<p>No businesses listed yet in this category.</p>'}
    <footer style="margin-top:40px;padding:20px 0;border-top:1px solid #e5e7eb;color:#888;font-size:0.85rem;">
      <p><a href="${baseUrl}/">FindMyPoint</a> — Premium Local Business Directory.</p>
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Generate a pre-rendered HTML page for the homepage
 */
function renderHomePage(businesses, categories, baseUrl) {
  const title = 'FindMyPoint — Premium Local Business Directory | Find Trusted Businesses Near You';
  const description = 'Discover trusted businesses, verified professionals and curated services across your city on FindMyPoint. Search restaurants, spas, doctors, hotels, services and more.';

  const categoryListHtml = categories.map(cat => {
    const catName = cat.label || cat.name;
    return `<li><a href="${baseUrl}/category/${encodeURIComponent(catName)}">${escHtml(catName)}</a></li>`;
  }).join('\n');

  const bizListHtml = businesses.slice(0, 20).map(biz => {
    const bizUrl = biz.canonicalUrl
      ? `${baseUrl}${biz.canonicalUrl}`
      : `${baseUrl}/business/${encodeURIComponent(biz.id)}`;
    return `<li><a href="${escHtml(bizUrl)}">${escHtml(biz.name)}</a>${biz.location ? ` — ${escHtml(biz.location)}` : ''}${biz.cityTown ? `, ${escHtml(biz.cityTown)}` : ''}</li>`;
  }).join('\n');

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "FindMyPoint",
    "url": baseUrl,
    "description": description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FindMyPoint",
    "url": baseUrl,
    "logo": `${baseUrl}/src/assets/logo.png`,
    "description": "Premium Local Business Directory — Find Trusted Businesses Near You"
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escHtml(title)}</title>
  <meta name="description" content="${escHtml(description)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${baseUrl}/">
  <meta property="og:site_name" content="FindMyPoint">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escHtml(title)}">
  <meta property="og:description" content="${escHtml(description)}">
  <meta property="og:url" content="${baseUrl}/">
  <meta name="google-site-verification" content="googleb386caefcdc89a69">
  <link rel="icon" type="image/png" href="/src/assets/chromelogo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script type="application/ld+json">${JSON.stringify([websiteSchema, orgSchema])}</script>
  <style>
    body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background: #f9fafb; color: #1a1a1a; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { font-size: 1.8rem; color: #111; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
    li { margin: 6px 0; }
    .grid { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; padding: 0; }
    .grid li a { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 6px 16px; border-radius: 20px; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>FindMyPoint — Premium Local Business Directory</h1>
    <p>Discover trusted businesses, verified professionals and curated services across your city.</p>
    
    ${categoryListHtml ? `<section><h2>Browse Categories</h2><ul class="grid">${categoryListHtml}</ul></section>` : ''}
    ${bizListHtml ? `<section><h2>Featured Businesses</h2><ul>${bizListHtml}</ul></section>` : ''}
    
    <footer style="margin-top:40px;padding:20px 0;border-top:1px solid #e5e7eb;color:#888;font-size:0.85rem;">
      <p><a href="${baseUrl}/">FindMyPoint</a> — Premium Local Business Directory.</p>
      <p><a href="${baseUrl}/categories">All Categories</a> | <a href="${baseUrl}/advertise">Advertise Your Business</a></p>
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Parse the request URL to determine page type and extract parameters
 */
function parseRequestPath(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return { type: 'home' };

  const first = segments[0].toLowerCase();

  // Skip reserved routes, sitemaps, robots, and static files
  if (RESERVED_ROUTES.includes(first) || first.endsWith('.xml') || first.endsWith('.txt') || /\.\w{2,5}$/.test(first)) {
    return { type: 'skip' };
  }

  // /business/:id
  if (first === 'business' && segments[1]) {
    return { type: 'business-id', id: decodeURIComponent(segments[1]) };
  }

  // /category/:name
  if (first === 'category' && segments[1]) {
    return { type: 'category', name: decodeURIComponent(segments[1]) };
  }

  // /categories
  if (first === 'categories') return { type: 'categories' };

  // /place/:name
  if (first === 'place' && segments[1]) {
    return { type: 'place', name: decodeURIComponent(segments[1]) };
  }

  // /article/:id
  if (first === 'article' && segments[1]) {
    return { type: 'article', id: segments[1] };
  }

  // /search
  if (first === 'search') return { type: 'skip' };

  // /advertise
  if (first === 'advertise') return { type: 'static-page', page: 'advertise' };

  // 3-segment SEO path: /:city/:locality/:slug
  if (segments.length === 3 && !RESERVED_ROUTES.includes(first)) {
    return {
      type: 'business-seo',
      city: decodeURIComponent(segments[0]),
      locality: decodeURIComponent(segments[1]),
      slug: decodeURIComponent(segments[2])
    };
  }

  // 2-segment path: /:city/:slug
  if (segments.length === 2 && !RESERVED_ROUTES.includes(first)) {
    return {
      type: 'business-seo-2',
      city: decodeURIComponent(segments[0]),
      slug: decodeURIComponent(segments[1])
    };
  }

  return { type: 'home' };
}


/**
 * Main middleware function
 */
async function crawlerPrerender(req, res, next) {
  try {
    // Only intercept GET requests
    if (req.method !== 'GET') return next();

    // Check if this is a crawler
    const userAgent = req.headers['user-agent'] || '';
    if (!isCrawler(userAgent)) return next();

    // Parse the URL
    const parsed = parseRequestPath(req.path);
    if (parsed.type === 'skip') return next();

    const baseUrl = getBaseUrl(req);

    // Handle different page types
    switch (parsed.type) {
      case 'business-seo': {
        const citySlug = slugify(parsed.city);
        const localitySlug = slugify(parsed.locality);
        const slug = slugify(parsed.slug);

        const biz = await Business.findOne({
          citySlug, localitySlug, slug,
          status: 'published'
        }).lean();

        if (biz) {
          const html = renderBusinessPage(biz, baseUrl);
          res.set('Content-Type', 'text/html; charset=utf-8');
          res.set('X-Prerendered', 'true');
          return res.status(200).send(html);
        }
        break;
      }

      case 'business-seo-2': {
        const citySlug = slugify(parsed.city);
        const slug = slugify(parsed.slug);

        const biz = await Business.findOne({
          citySlug, slug,
          status: 'published'
        }).lean();

        if (biz) {
          const html = renderBusinessPage(biz, baseUrl);
          res.set('Content-Type', 'text/html; charset=utf-8');
          res.set('X-Prerendered', 'true');
          return res.status(200).send(html);
        }
        break;
      }

      case 'business-id': {
        const biz = await Business.findOne({
          $or: [{ id: parsed.id }, { slug: parsed.id }],
          status: 'published'
        }).lean();

        if (biz) {
          const html = renderBusinessPage(biz, baseUrl);
          res.set('Content-Type', 'text/html; charset=utf-8');
          res.set('X-Prerendered', 'true');
          return res.status(200).send(html);
        }
        break;
      }

      case 'category': {
        const businesses = await Business.find({
          category: { $regex: new RegExp(`^${parsed.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
          status: 'published'
        }, 'id name location cityTown rating canonicalUrl slug').lean().catch(() => []);

        const html = renderCategoryPage(parsed.name, businesses, baseUrl);
        res.set('Content-Type', 'text/html; charset=utf-8');
        res.set('X-Prerendered', 'true');
        return res.status(200).send(html);
      }

      case 'home': {
        const [businesses, categories] = await Promise.all([
          Business.find({ status: 'published' }, 'id name location cityTown canonicalUrl slug').limit(20).lean().catch(() => []),
          Category.find({}, 'label name').lean().catch(() => [])
        ]);

        const html = renderHomePage(businesses, categories, baseUrl);
        res.set('Content-Type', 'text/html; charset=utf-8');
        res.set('X-Prerendered', 'true');
        return res.status(200).send(html);
      }
    }

    // If no match found or business not found, continue to normal SPA
    return next();
  } catch (err) {
    console.error('[CrawlerPrerender] Error:', err.message);
    // On error, fall back to normal SPA serving
    return next();
  }
}

module.exports = crawlerPrerender;
