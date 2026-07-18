export interface AddressItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  pincode: string;
  city: string;
  landlineStd: string;
  landlineNum: string;
  tag: string; // "Home" or "Office" or "Other"
}

export interface UserProfile {
  id: string;
  personal: {
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    dobDD: string;
    dobMM: string;
    dobYYYY: string;
    maritalStatus: string;
    occupation: string;
    mobile1: string;
    mobile2: string; // WhatsApp Number
    avatar: string;
  };
  addresses: AddressItem[];
  selectedFavorites: string[];
}

const INITIAL_USERS: UserProfile[] = [];

export function loadAdminUsers(): UserProfile[] {
  const data = localStorage.getItem("fmp_admin_users:v2");
  if (!data) {
    localStorage.setItem("fmp_admin_users:v2", JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse admin users from localStorage", e);
    return INITIAL_USERS;
  }
}

export function saveAdminUsers(users: UserProfile[]): void {
  localStorage.setItem("fmp_admin_users:v2", JSON.stringify(users));
}
