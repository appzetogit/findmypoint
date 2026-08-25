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
  tagline: "",
  socials: [
    { id: "facebook", name: "Facebook", url: "", show: false },
    { id: "youtube", name: "YouTube", url: "", show: false },
    { id: "instagram", name: "Instagram", url: "", show: false },
    { id: "linkedin", name: "LinkedIn", url: "", show: false },
    { id: "x", name: "X (Twitter)", url: "", show: false },
  ],
  playstoreUrl: "",
  appstoreUrl: "",
  copyright: "",
};

export function loadFooterData(): FooterData {
  try {
    // Clear legacy mock data key if present
    localStorage.removeItem("fmp_footer_data:v1");

    const data = localStorage.getItem("fmp_footer_data");
    if (!data) {
      return DEFAULT_FOOTER_DATA;
    }
    const parsed = JSON.parse(data);
    return {
      tagline: parsed.tagline || "",
      socials: Array.isArray(parsed.socials) ? parsed.socials : DEFAULT_FOOTER_DATA.socials,
      playstoreUrl: parsed.playstoreUrl || "",
      appstoreUrl: parsed.appstoreUrl || "",
      copyright: parsed.copyright || "",
    };
  } catch (e) {
    console.error("Failed to parse footer data from localStorage", e);
    return DEFAULT_FOOTER_DATA;
  }
}

export function saveFooterData(data: FooterData): void {
  localStorage.setItem("fmp_footer_data", JSON.stringify(data));
}
