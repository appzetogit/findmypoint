export interface SocialLinkItem {
  id: "facebook" | "youtube" | "instagram" | "linkedin" | "x";
  name: string;
  url: string;
  show: boolean;
}

export interface FooterData {
  tagline: string;
  socials: SocialLinkItem[];
  playstoreUrl: string;
  appstoreUrl: string;
  copyright: string;
}

export const DEFAULT_FOOTER_DATA: FooterData = {
  tagline:
    "A premium local discovery platform connecting millions of buyers with verified businesses across the country.",
  socials: [
    { id: "facebook", name: "Facebook", url: "https://facebook.com/findmypoint", show: true },
    { id: "youtube", name: "YouTube", url: "https://youtube.com/findmypoint", show: true },
    { id: "instagram", name: "Instagram", url: "https://instagram.com/findmypoint", show: true },
    {
      id: "linkedin",
      name: "LinkedIn",
      url: "https://linkedin.com/company/findmypoint",
      show: true,
    },
    { id: "x", name: "X (Twitter)", url: "https://x.com/findmypoint", show: true },
  ],
  playstoreUrl: "https://play.google.com/store",
  appstoreUrl: "https://apple.com/app-store",
  copyright: "© 2026 FindmyPoint Directory Services. All rights reserved.",
};

export function loadFooterData(): FooterData {
  const data = localStorage.getItem("fmp_footer_data:v1");
  if (!data) {
    localStorage.setItem("fmp_footer_data:v1", JSON.stringify(DEFAULT_FOOTER_DATA));
    return DEFAULT_FOOTER_DATA;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse footer data from localStorage", e);
    return DEFAULT_FOOTER_DATA;
  }
}

export function saveFooterData(data: FooterData): void {
  localStorage.setItem("fmp_footer_data:v1", JSON.stringify(data));
}
