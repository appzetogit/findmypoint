import { BACKEND_ORIGIN } from "../config";

export const getCategoryImage = (label: string, imgFromDb: string): string => {
  if (!imgFromDb) return "";
  if (imgFromDb.startsWith("data:") || imgFromDb.startsWith("http")) return imgFromDb;
  return `${BACKEND_ORIGIN}${imgFromDb}`;
};
