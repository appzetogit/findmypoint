export interface SavedItem {
  id: string;
  _id?: string;
  name: string;
  category?: string;
  sub?: string;
  address?: string;
  rating?: number | string;
  image?: string;
  slug?: string;
  canonicalUrl?: string;
  type?: "business" | "place" | "article";
  savedAt?: string;
}

export const SAVED_STORAGE_KEY = "fmp_saved_listings:v1";
const LEGACY_STORAGE_KEY = "fmp_saved_listings";

export function getSavedListings(): SavedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data =
      localStorage.getItem(SAVED_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to parse saved listings from localStorage:", err);
    return [];
  }
}

export function isListingSaved(identifier?: string | null): boolean {
  if (!identifier) return false;
  const listings = getSavedListings();
  const cleanId = String(identifier).trim().toLowerCase();
  return listings.some((item) => {
    const itemId = String(item.id || "").trim().toLowerCase();
    const item_Id = String(item._id || "").trim().toLowerCase();
    const itemSlug = String(item.slug || "").trim().toLowerCase();
    const itemCanonical = String(item.canonicalUrl || "").trim().toLowerCase();

    if (itemId && itemId === cleanId) return true;
    if (item_Id && item_Id === cleanId) return true;
    if (itemSlug && itemSlug === cleanId) return true;
    if (itemCanonical && itemCanonical === cleanId) return true;
    if (cleanId.length > 3 && itemCanonical && itemCanonical.endsWith(cleanId)) return true;
    if (cleanId.length > 3 && itemSlug && cleanId.includes(itemSlug)) return true;
    return false;
  });
}

export function saveListing(item: SavedItem): void {
  if (typeof window === "undefined" || !item) return;
  try {
    const listings = getSavedListings();
    const idToMatch = String(item.id || item._id || item.slug || "").trim().toLowerCase();
    const filtered = listings.filter((it) => {
      const itId = String(it.id || "").trim().toLowerCase();
      const it_Id = String(it._id || "").trim().toLowerCase();
      const itSlug = String(it.slug || "").trim().toLowerCase();
      return itId !== idToMatch && it_Id !== idToMatch && itSlug !== idToMatch;
    });

    const updated = [
      {
        ...item,
        savedAt: item.savedAt || new Date().toISOString(),
      },
      ...filtered,
    ];

    localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("fmp_saved_changed", { detail: updated }));
  } catch (err) {
    console.error("Failed to save listing to localStorage:", err);
  }
}

export function removeSavedListing(identifier: string): void {
  if (typeof window === "undefined" || !identifier) return;
  try {
    const listings = getSavedListings();
    const cleanId = String(identifier).trim().toLowerCase();
    const updated = listings.filter((it) => {
      const itId = String(it.id || "").trim().toLowerCase();
      const it_Id = String(it._id || "").trim().toLowerCase();
      const itSlug = String(it.slug || "").trim().toLowerCase();
      const itCanonical = String(it.canonicalUrl || "").trim().toLowerCase();
      const isMatch =
        itId === cleanId ||
        it_Id === cleanId ||
        itSlug === cleanId ||
        itCanonical === cleanId ||
        (cleanId.length > 3 && itCanonical.endsWith(cleanId));
      return !isMatch;
    });

    localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("fmp_saved_changed", { detail: updated }));
  } catch (err) {
    console.error("Failed to remove saved listing from localStorage:", err);
  }
}

export function clearAllSavedListings(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SAVED_STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("fmp_saved_changed", { detail: [] }));
  } catch (err) {
    console.error("Failed to clear saved listings from localStorage:", err);
  }
}

export function toggleSavedListing(item: SavedItem): boolean {
  const identifier = item.id || item._id || item.slug || item.canonicalUrl;
  if (isListingSaved(identifier)) {
    if (identifier) removeSavedListing(identifier);
    return false;
  } else {
    saveListing(item);
    return true;
  }
}
