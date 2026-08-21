/**
 * Deterministic and URL-safe slug generator utility
 */

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Normalize accented characters
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric except space and hyphen
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphen
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens
}

/**
 * Generate standard business slugs: citySlug, localitySlug, businessSlug, and canonicalUrl
 */
function generateBusinessSlugs(data) {
  const { name, location, cityTown, district, state, id } = data;

  // City slug precedence: cityTown -> district -> state -> 'india'
  const cityRaw = cityTown || district || state || 'india';
  const citySlug = slugify(cityRaw) || 'india';

  // Locality slug precedence: location -> district -> 'center'
  const localityRaw = location || district || 'center';
  const localitySlug = slugify(localityRaw) || 'center';

  // Business slug: name (or existing custom id if name missing)
  const nameRaw = name || id || 'business';
  const slug = slugify(nameRaw) || 'business';

  const canonicalUrl = `/${citySlug}/${localitySlug}/${slug}`;

  return {
    citySlug,
    localitySlug,
    slug,
    canonicalUrl
  };
}

module.exports = {
  slugify,
  generateBusinessSlugs
};
