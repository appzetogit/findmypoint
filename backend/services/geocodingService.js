/**
 * geocodingService.js
 * Server-side Google Geocoding & Places API utility functions
 * Used for: address → lat/lng, lat/lng → address (reverse geocoding)
 */

const https = require('https');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Fetch JSON from a URL (returns a Promise)
 */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse response'));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Geocode an address string → { lat, lng, placeId, formattedAddress }
 * Uses Google Geocoding API
 */
async function geocodeAddress(address) {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('GOOGLE_MAPS_API_KEY not set in environment');
  }
  if (!address || !address.trim()) {
    throw new Error('Address is required for geocoding');
  }

  const encodedAddress = encodeURIComponent(address.trim());
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&region=in&key=${GOOGLE_MAPS_API_KEY}`;

  const data = await fetchJson(url);

  if (data.status === 'ZERO_RESULTS' || !data.results || data.results.length === 0) {
    return null;
  }

  if (data.status !== 'OK') {
    throw new Error(`Geocoding API error: ${data.status} — ${data.error_message || ''}`);
  }

  const result = data.results[0];
  const { lat, lng } = result.geometry.location;

  // Extract address components
  const components = result.address_components || [];
  const get = (type) => {
    const comp = components.find(c => c.types.includes(type));
    return comp ? comp.long_name : '';
  };

  return {
    lat,
    lng,
    placeId: result.place_id || '',
    formattedAddress: result.formatted_address || address,
    city: get('locality') || get('administrative_area_level_2') || '',
    state: get('administrative_area_level_1') || '',
    country: get('country') || '',
    pincode: get('postal_code') || '',
  };
}

/**
 * Reverse geocode lat/lng → { city, area, formattedAddress }
 * Uses Google Geocoding API
 */
async function reverseGeocode(lat, lng) {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('GOOGLE_MAPS_API_KEY not set in environment');
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
  const data = await fetchJson(url);

  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    return null;
  }

  const result = data.results[0];
  const components = result.address_components || [];
  const get = (type) => {
    const comp = components.find(c => c.types.includes(type));
    return comp ? comp.long_name : '';
  };

  return {
    formattedAddress: result.formatted_address || '',
    area: get('sublocality_level_1') || get('sublocality') || get('neighborhood') || '',
    city: get('locality') || get('administrative_area_level_2') || '',
    state: get('administrative_area_level_1') || '',
    country: get('country') || '',
    pincode: get('postal_code') || '',
  };
}

/**
 * Build location_geo GeoJSON object from lat/lng (for MongoDB 2dsphere)
 * Returns null if coordinates are invalid
 */
function buildGeoPoint(lat, lng) {
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || isNaN(lngNum)) return null;
  if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) return null;

  return {
    type: 'Point',
    coordinates: [lngNum, latNum] // GeoJSON: [longitude, latitude]
  };
}

/**
 * Auto-geocode a business by its address if lat/lng not already set
 * Returns { lat, lng, placeId, location_geo } or null
 */
async function autoGeocodeBusiness(business) {
  // Skip if already has coordinates
  if (business.latitude && business.longitude) {
    return null;
  }

  // Build a comprehensive address string
  const addressParts = [
    business.address,
    business.location,
    business.cityTown,
    business.district,
    business.state,
    'India'
  ].filter(Boolean);

  if (addressParts.length === 0) return null;

  const fullAddress = addressParts.join(', ');

  try {
    const result = await geocodeAddress(fullAddress);
    if (!result) return null;

    return {
      latitude: result.lat,
      longitude: result.lng,
      placeId: result.placeId,
      location_geo: buildGeoPoint(result.lat, result.lng)
    };
  } catch (err) {
    console.error(`[GeocodingService] Failed to geocode "${fullAddress}":`, err.message);
    return null;
  }
}

module.exports = {
  geocodeAddress,
  reverseGeocode,
  buildGeoPoint,
  autoGeocodeBusiness,
};
