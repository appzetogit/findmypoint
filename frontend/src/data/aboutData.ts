export interface AboutData {
  title: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
}

export const DEFAULT_ABOUT_DATA: AboutData = {
  title: "",
  paragraph1: "",
  paragraph2: "",
  paragraph3: "",
};

export function loadAboutData(): AboutData {
  const data = localStorage.getItem("fmp_about_data:v1");
  if (!data) {
    localStorage.setItem("fmp_about_data:v1", JSON.stringify(DEFAULT_ABOUT_DATA));
    return DEFAULT_ABOUT_DATA;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse about data from localStorage", e);
    return DEFAULT_ABOUT_DATA;
  }
}

export function saveAboutData(data: AboutData): void {
  localStorage.setItem("fmp_about_data:v1", JSON.stringify(data));
}
