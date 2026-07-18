export interface PlaceItem {
  id: string;
  name: string;
  rating: number;
  reviewsCount: number;
  image: string;
  desc: string;
  tags: string[];
  price?: string;
  businessId?: string;
}

export interface TouristPlaceDetailData {
  name: string;
  coverImage: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  tags: string[];
  description: string;
  categories: { name: string; icon: string }[];
  temples: PlaceItem[];
  hotels: PlaceItem[];
  restaurants: PlaceItem[];
  spas: PlaceItem[];
  activities: PlaceItem[];
  faqs: { question: string; answer: string }[];
  bestTime?: string;
  idealDuration?: string;
  nearestAirport?: string;
  localTransport?: string;
}

export const touristPlacesData: Record<string, TouristPlaceDetailData> = {};
