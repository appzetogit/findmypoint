import { BACKEND_ORIGIN } from "../config";

export const getCategoryImage = (label?: string, imgFromDb?: string): string => {
  if (!imgFromDb) return "";
  if (imgFromDb.startsWith("data:") || imgFromDb.startsWith("http")) return imgFromDb;
  const isBrowser = typeof window !== 'undefined';
  const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const origin = (isBrowser && !isLocalhost) ? window.location.origin : BACKEND_ORIGIN;
  return `${origin}${imgFromDb}`;
};

export const getSubcategoryEmoji = (category?: string, subcatName?: string): string => {
  return "🏷️";
};
