export interface AboutData {
  title: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
}

export const DEFAULT_ABOUT_DATA: AboutData = {
  title: "One-Stop for All Local Businesses, Services, & Stores Nearby Across India",
  paragraph1:
    'Welcome to FindmyPoint, your "one stop shop" where you are assisted with day-to-day and exclusive planning and purchasing activities. We take pride in our curated search listings, advanced search filters, and the fact that we own a strong, verified hold on local business information pan India.',
  paragraph2:
    "Our service extends from providing address and contact details of business establishments around the country, to making orders and reservations for leisure, medical, financial, travel and domestic purposes. We enlist business information across varied sectors like Hotels, Restaurants, Auto Care, Home Decor, Personal and Pet Care, Fitness, Insurance, Real Estate, Sports, Schools, etc. from all over the country. Holding information right from major cities like Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Ahmedabad and Pune, our reach stretches out to other smaller cities across the country too.",
  paragraph3:
    'Our "Free Listing" feature gives a platform to showcase varied specialities. We then furnish you with the information via web and mobile application as well as create a space for you to share your experiences through our "Rate & Review" feature. Through the "Best Deals" and "Live Quotes", we make sure that you are offered the best bargains in the market.',
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
