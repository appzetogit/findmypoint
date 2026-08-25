import { BACKEND_ORIGIN } from "../config";

export const getCategoryImage = (label?: string, imgFromDb?: string): string => {
  if (!imgFromDb) return "";
  if (imgFromDb.startsWith("data:") || imgFromDb.startsWith("http")) return imgFromDb;
  const isBrowser = typeof window !== 'undefined';
  const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const origin = (isBrowser && !isLocalhost) ? window.location.origin : BACKEND_ORIGIN;
  return `${origin}${imgFromDb}`;
};

export const getSubcategoryEmoji = (category: string, subcatName: string): string => {
  const name = subcatName.toLowerCase();
  const cat = category.toLowerCase();

  if (name.includes("massage")) return "💆";
  if (name.includes("salon")) return "💇";
  if (name.includes("parlour")) return "💄";

  if (name.includes("india")) return "🇮🇳";
  if (name.includes("nepal")) return "🇳🇵";
  if (name.includes("sri lanka")) return "🇱🇰";
  if (name.includes("bangladesh")) return "🇧🇩";
  if (name.includes("indonesia")) return "🇮🇩";
  if (name.includes("dubai")) return "🇦🇪";
  if (name.includes("uk")) return "🇬🇧";
  if (name.includes("usa")) return "🇺🇸";
  if (name.includes("australia")) return "🇦🇺";
  if (name.includes("japan")) return "🇯🇵";
  if (name.includes("china")) return "🇨🇳";
  if (name.includes("russia")) return "🇷🇺";
  if (name.includes("thailand")) return "🇹🇭";
  if (name.includes("france")) return "🇫🇷";
  if (name.includes("germany")) return "🇩🇪";
  if (name.includes("switzerland")) return "🇨🇭";

  if (name.includes("accounting") || name.includes("bank")) return "💰";
  if (name.includes("fresher") || name.includes("student")) return "👶";
  if (name.includes("government")) return "🏛️";
  if (name.includes("it") || name.includes("computer")) return "💻";
  if (name.includes("marketing") || name.includes("sales")) return "📈";
  if (name.includes("delivery")) return "🛵";

  if (name.includes("ac repair") || name.includes("ac service")) return "❄️";
  if (name.includes("carpenter")) return "🪚";
  if (name.includes("plumber")) return "🪠";
  if (name.includes("electrician")) return "⚡";
  if (name.includes("cleaner") || name.includes("cleaning")) return "🧹";

  if (name.includes("school") || name.includes("college") || name.includes("university"))
    return "🏫";
  if (name.includes("coaching") || name.includes("institute")) return "📚";

  if (name.includes("medicine") || name.includes("pharmacy")) return "💊";
  if (name.includes("clinic") || name.includes("hospital") || name.includes("nursing")) return "🏥";
  if (name.includes("doctor")) return "🩺";

  if (name.includes("resort")) return "🏖️";
  if (name.includes("banquet")) return "🏰";

  if (name.includes("women")) return "👚";
  if (name.includes("men")) return "👕";
  if (name.includes("kids")) return "🧒";

  if (
    name.includes("vedic") ||
    name.includes("palm") ||
    name.includes("horoscope") ||
    name.includes("tarot")
  )
    return "🔮";

  if (name.includes("restaurant") || name.includes("cafe")) return "🍲";
  if (name.includes("sweet") || name.includes("bakery")) return "🍰";

  if (name.includes("courier") || name.includes("parcel")) return "📦";

  if (cat.includes("find")) return "📍";
  if (cat.includes("spa")) return "💆";
  if (cat.includes("tour")) return "✈️";
  if (cat.includes("job")) return "💼";
  if (cat.includes("service")) return "🛠️";
  if (cat.includes("education")) return "🎓";
  if (cat.includes("health")) return "🏥";
  if (cat.includes("hotel")) return "🏨";
  if (cat.includes("doctor")) return "🩺";
  if (cat.includes("garment")) return "👗";
  if (cat.includes("astrologer")) return "🔮";
  if (cat.includes("product")) return "🛒";
  if (cat.includes("food")) return "🍲";
  if (cat.includes("courier")) return "📦";
  if (cat.includes("car")) return "🚗";

  return "🏷️";
};
