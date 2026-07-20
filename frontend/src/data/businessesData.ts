export interface ProductService {
  name: string;
  price: string;
  img: string;
  desc: string;
  addedDate?: string;
}

export interface UserReview {
  userName: string;
  userInitial: string;
  userColor: string;
  rating: number;
  date: string;
  reviewText: string;
  image?: string;
  userEmail?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SimilarListing {
  id: string;
  name: string;
  location: string;
  rating: number;
  img: string;
  category: string;
}

export interface BusinessListingData {
  id: string;
  name: string;
  location: string;
  category: string;
  rating: number;
  reviewCount: number;
  phone: string;
  address: string;
  timings: string;
  openStatus: string;
  website: string;
  images: string[];
  description: string;
  products: ProductService[];
  reviews: UserReview[];
  faqs: FAQItem[];
  similarListings: SimilarListing[];
  // Extra fields from Admin Entry Form
  whatsapp?: string;
  extraNumbers?: string[];
  branches?: string[];
  openTime?: string;
  closeTime?: string;
  holidayTime?: string;
  officers?: { name: string; designation: string }[];
  facilities?: string[];
  email?: string;
  videoLink?: string;
  locationLink?: string;
  othersDestination?: string;
  subCategoryLine?: string;
  categoryLine?: string;
  highlightsName?: string;
  isVerified?: boolean;
  isBookingDisabled?: boolean;
  bookingButtonLabel?: string;
  isTimingMandatory?: boolean;
  country?: string;
  state?: string;
  district?: string;
  cityTown?: string;
  pincode?: string;
  password?: string;
  clientPassword?: string; // Plain text — admin reference only
  ownerName?: string;
}

export const businessesData: BusinessListingData[] = [];
