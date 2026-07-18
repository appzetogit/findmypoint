import { useState, useEffect } from "react";
import {
  Save,
  Plus,
  Trash2,
  Check,
  Video,
  MapPin,
  User,
  ShieldCheck,
  Mail,
  Globe,
  Image as ImageIcon,
  Sparkles,
  Tag,
  Clock,
  Upload,
} from "lucide-react";
import { useCategories } from "../context/CategoryContext";
import { BusinessListingData } from "../data/businessesData";
import { API_BASE_URL } from "../config";
import statesData from "../data/states-and-districts.json";
import countryCodesData from "../data/country-by-calling-code.json";

interface CountryCodeItem {
  country: string;
  calling_code: number | string;
}

const rawCodes: CountryCodeItem[] = (countryCodesData as any) || [];
const ALL_CALLING_CODES: string[] = Array.from(
  new Set(
    rawCodes
      .map((item) => {
        const code = String(item.calling_code).trim();
        return code.startsWith("+") ? code : `+${code}`;
      })
      .filter((code) => code !== "+")
  )
).sort((a, b) => {
  const numA = parseInt(a.replace(/[^\d]/g, ""), 10);
  const numB = parseInt(b.replace(/[^\d]/g, ""), 10);
  return numA - numB;
});

const PRIORITY_CODES = ["+91", "+1", "+44", "+61", "+65", "+971"];
const SORTED_CALLING_CODES = [
  ...PRIORITY_CODES,
  ...ALL_CALLING_CODES.filter((code) => !PRIORITY_CODES.includes(code))
];

interface StateItem {
  state: string;
  districts: string[];
}

const statesList: StateItem[] = (statesData as any).states || [];

const STATE_DISTRICTS_MAP: Record<string, string[]> = {};
statesList.forEach((item) => {
  STATE_DISTRICTS_MAP[item.state] = [...item.districts, "Other"];
});
STATE_DISTRICTS_MAP["Other State"] = ["Other"];

const GLOBAL_LOCATIONS_MAP: Record<string, Record<string, string[]>> = {
  "India": STATE_DISTRICTS_MAP,
  "United States": {
    "California": ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Other"],
    "New York": ["New York City", "Buffalo", "Rochester", "Yonkers", "Other"],
    "Texas": ["Houston", "San Antonio", "Dallas", "Austin", "Other"],
    "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville", "Other"],
    "Illinois": ["Chicago", "Aurora", "Naperville", "Joliet", "Other"],
    "Washington": ["Seattle", "Spokane", "Tacoma", "Bellevue", "Other"],
    "Other State": ["Other"]
  },
  "Canada": {
    "Ontario": ["Toronto", "Ottawa", "Mississauga", "Hamilton", "Other"],
    "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau", "Other"],
    "British Columbia": ["Vancouver", "Victoria", "Burnaby", "Richmond", "Other"],
    "Alberta": ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "Other"],
    "Manitoba": ["Winnipeg", "Brandon", "Steinbach", "Thompson", "Other"],
    "Other State": ["Other"]
  },
  "Australia": {
    "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Other"],
    "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Other"],
    "Queensland": ["Brisbane", "Gold Coast", "Sunshine Coast", "Cairns", "Other"],
    "Western Australia": ["Perth", "Mandurah", "Bunbury", "Other"],
    "South Australia": ["Adelaide", "Mount Gambier", "Whyalla", "Other"],
    "Other State": ["Other"]
  },
  "United Kingdom": {
    "England": ["London", "Birmingham", "Manchester", "Leeds", "Liverpool", "Other"],
    "Scotland": ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Other"],
    "Wales": ["Cardiff", "Swansea", "Newport", "Wrexham", "Other"],
    "Northern Ireland": ["Belfast", "Derry", "Lisburn", "Newry", "Other"],
    "Other State": ["Other"]
  },
  "United Arab Emirates": {
    "Dubai": ["Dubai City", "Jebel Ali", "Hatta", "Other"],
    "Abu Dhabi": ["Abu Dhabi City", "Al Ain", "Al Dhafra", "Other"],
    "Sharjah": ["Sharjah City", "Khor Fakkan", "Kalba", "Other"],
    "Ajman": ["Ajman City", "Masfout", "Manama", "Other"],
    "Ras Al Khaimah": ["RAK City", "Al Jazirah Al Hamra", "Other"],
    "Fujairah": ["Fujairah City", "Dibba Al-Fujairah", "Other"],
    "Umm Al Quwain": ["UAQ City", "Falaj Al Mualla", "Other"],
    "Other State": ["Other"]
  },
  "Singapore": {
    "Central Region": ["Downtown Core", "Bukit Merah", "Queenstown", "Geylang", "Other"],
    "East Region": ["Tampines", "Bedok", "Pasir Ris", "Other"],
    "North Region": ["Woodlands", "Yishun", "Sembawang", "Other"],
    "North-East Region": ["Sengkang", "Hougang", "Punggol", "Serangoon", "Other"],
    "West Region": ["Jurong West", "Choa Chu Kang", "Bukit Batok", "Other"],
    "Other State": ["Other"]
  },
  "Others": {
    "Other State": ["Other"]
  }
};

const splitPhoneNumber = (fullPhone: string) => {
  const cleanPhone = (fullPhone || "").trim();
  const match = cleanPhone.match(/^(\+\d+)\s*(.*)$/);
  if (match) {
    return {
      code: match[1],
      number: match[2]
    };
  }
  return {
    code: "+91",
    number: cleanPhone
  };
};

const COMMON_HOLIDAYS = [
  "Sunday",
  "Saturday & Sunday",
  "Open All Days",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "National Holidays"
];

interface TimeSelectorProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}

function TimeSelector({ label, value, onChange, required }: TimeSelectorProps) {
  const parseTime = (timeStr: string) => {
    const trimmed = (timeStr || "").trim();
    const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      return {
        hour: match[1].padStart(2, "0"),
        minute: match[2],
        period: match[3].toUpperCase()
      };
    }
    return {
      hour: "09",
      minute: "00",
      period: "AM"
    };
  };

  const { hour, minute, period } = parseTime(value);

  const setTimePart = (part: "hour" | "minute" | "period", val: string) => {
    const nextHour = part === "hour" ? val : hour;
    const nextMin = part === "minute" ? val : minute;
    const nextPeriod = part === "period" ? val : period;
    onChange(`${nextHour}:${nextMin} ${nextPeriod}`);
  };

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
  const periods = ["AM", "PM"];

  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-wider block font-bold text-slate-900 dark:text-slate-100">
        {label} {required && <span className="text-rose-500 font-bold">*</span>}
      </label>
      <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
        <select
          value={hour}
          onChange={(e) => setTimePart("hour", e.target.value)}
          className="bg-transparent text-sm py-1 px-1.5 outline-none text-slate-900 dark:text-slate-100 font-semibold cursor-pointer grow text-center"
        >
          {hours.map((h) => (
            <option key={h} value={h} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
              {h}
            </option>
          ))}
        </select>
        <span className="text-slate-400 font-bold">:</span>
        <select
          value={minute}
          onChange={(e) => setTimePart("minute", e.target.value)}
          className="bg-transparent text-sm py-1 px-1.5 outline-none text-slate-900 dark:text-slate-100 font-semibold cursor-pointer grow text-center"
        >
          {minutes.map((m) => (
            <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
              {m}
            </option>
          ))}
        </select>
        <select
          value={period}
          onChange={(e) => setTimePart("period", e.target.value)}
          className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-705 dark:text-indigo-300 text-xs font-bold py-1.5 px-2 rounded-lg outline-none cursor-pointer text-center"
        >
          {periods.map((p) => (
            <option key={p} value={p} className="bg-white dark:bg-slate-900 text-slate-905 dark:text-slate-100 font-semibold">
              {p}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

interface AdminEntryFormProps {
  businessId: string | null; // If null, we are in Add mode, otherwise Edit mode
  onCancel: () => void;
  onSuccess: () => void;
  isClient?: boolean;
}

type TabType = "basic" | "contact" | "timings" | "media" | "extra";

export default function AdminEntryForm({ businessId, onCancel, onSuccess, isClient = false }: AdminEntryFormProps) {
  const { categories, subcategoriesData } = useCategories();
  const isEditMode = !!businessId;
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [originalBusiness, setOriginalBusiness] = useState<BusinessListingData | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [highlightsName, setHighlightsName] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [extraNumbers, setExtraNumbers] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [openTime, setOpenTime] = useState("09:00 AM");
  const [closeTime, setCloseTime] = useState("09:00 PM");
  const [selectedHoliday, setSelectedHoliday] = useState("Sunday");
  const [customHoliday, setCustomHoliday] = useState("");
  const [isTimingMandatory, setIsTimingMandatory] = useState(false);
  const [country, setCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [customState, setCustomState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [customDistrict, setCustomDistrict] = useState("");
  const [cityTown, setCityTown] = useState("");
  const [pincode, setPincode] = useState("");
  const [description, setDescription] = useState("");
  const [officers, setOfficers] = useState<{ name: string; designation: string }[]>([]);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [frontPhoto, setFrontPhoto] = useState("");
  const [interiorPhotos, setInteriorPhotos] = useState<string[]>([]);
  const [locationLink, setLocationLink] = useState("");
  const [othersDestination, setOthersDestination] = useState("");
  const [categoryLine, setCategoryLine] = useState("");
  const [subCategoryLine, setSubCategoryLine] = useState("");
  const [bookingButtonLabel, setBookingButtonLabel] = useState("");

  // Subcategories matching active category
  const availableSubcategories = subcategoriesData[category] || [];

  // Update initial category once loaded
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].label);
    }
  }, [categories, category]);

  // Update subcategory default when category changes
  useEffect(() => {
    if (availableSubcategories.length > 0 && (!subCategory || !availableSubcategories.includes(subCategory))) {
      setSubCategory(availableSubcategories[0]);
    }
  }, [category, availableSubcategories, subCategory]);

  const populateForm = (biz: BusinessListingData) => {
    setName(biz.name || "");
    setHighlightsName(biz.highlightsName || "");

    const [mainCat, subCat] = biz.category.split(" > ");
    setCategory(mainCat || (categories.length > 0 ? categories[0].label : ""));
    setSubCategory(subCat || "");

    setAddress(biz.address || "");
    setPhone(biz.phone || "");
    setWhatsapp(biz.whatsapp || "");
    setExtraNumbers(biz.extraNumbers || []);
    setBranches(biz.branches || []);
    setOpenTime(biz.openTime || "09:00 AM");
    setCloseTime(biz.closeTime || "09:00 PM");
    const dbHoliday = biz.holidayTime || "Sunday";
    if (COMMON_HOLIDAYS.includes(dbHoliday)) {
      setSelectedHoliday(dbHoliday);
      setCustomHoliday("");
    } else {
      setSelectedHoliday("Custom");
      setCustomHoliday(dbHoliday);
    }
    setIsTimingMandatory(biz.isTimingMandatory || false);
    const dbCountry = biz.country || "India";
    setCountry(dbCountry);

    const countryMap = GLOBAL_LOCATIONS_MAP[dbCountry] || { "Other State": ["Other"] };
    const dbState = biz.state || "";
    const stateKeys = Object.keys(countryMap);
    if (stateKeys.includes(dbState) && dbState !== "Other State") {
      setSelectedState(dbState);
      setCustomState("");
    } else if (dbState) {
      setSelectedState("Other State");
      setCustomState(dbState);
    } else {
      setSelectedState(stateKeys[0] || "Other State");
      setCustomState("");
    }

    const dbDistrict = biz.district || "";
    const currentStateKey = stateKeys.includes(dbState) && dbState !== "Other State" ? dbState : "Other State";
    const districtsForState = countryMap[currentStateKey] || [];
    if (districtsForState.includes(dbDistrict) && dbDistrict !== "Other") {
      setSelectedDistrict(dbDistrict);
      setCustomDistrict("");
    } else if (dbDistrict) {
      setSelectedDistrict("Other");
      setCustomDistrict(dbDistrict);
    } else {
      setSelectedDistrict(districtsForState[0] || "Other");
      setCustomDistrict("");
    }
    setCityTown(biz.cityTown || "");
    setPincode(biz.pincode || "");
    setDescription(biz.description || "");
    setOfficers(biz.officers || []);
    setFacilities(biz.facilities || []);
    setEmail(biz.email || "");
    setWebsite(biz.website || "");
    setVideoLink(biz.videoLink || "");
    setFrontPhoto(biz.images[0] || "");
    setInteriorPhotos(biz.images.slice(1) || []);
    setLocationLink(biz.locationLink || "");
    setOthersDestination(biz.othersDestination || "");
    setCategoryLine(biz.categoryLine || "");
    setSubCategoryLine(biz.subCategoryLine || "");
    setBookingButtonLabel(biz.bookingButtonLabel || "");
  };

  // Load existing business details if in Edit Mode
  useEffect(() => {
    if (isEditMode && businessId) {
      fetch(`${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setOriginalBusiness(data.data);
            populateForm(data.data);
          }
        })
        .catch((e) => console.error("Failed to load business details:", e));
    } else {
      try {
        const savedSession = localStorage.getItem("fmp_client_session:v1");
        if (savedSession) {
          const session = JSON.parse(savedSession);
          if (session.email) setEmail(session.email);
          if (session.phone) setPhone(session.phone);
        }
      } catch (e) {}
    }
  }, [businessId, isEditMode]);

  // Dynamic add/remove handlers
  const handleAddExtraNumber = () => setExtraNumbers([...extraNumbers, ""]);
  const handleRemoveExtraNumber = (index: number) => {
    setExtraNumbers(extraNumbers.filter((_, idx) => idx !== index));
  };
  const handleExtraNumberChange = (index: number, val: string) => {
    const updated = [...extraNumbers];
    updated[index] = val;
    setExtraNumbers(updated);
  };

  const handleAddBranch = () => setBranches([...branches, ""]);
  const handleRemoveBranch = (index: number) => {
    setBranches(branches.filter((_, idx) => idx !== index));
  };
  const handleBranchChange = (index: number, val: string) => {
    const updated = [...branches];
    updated[index] = val;
    setBranches(updated);
  };

  const handleAddOfficer = () => setOfficers([...officers, { name: "", designation: "" }]);
  const handleRemoveOfficer = (index: number) => {
    setOfficers(officers.filter((_, idx) => idx !== index));
  };
  const handleOfficerChange = (index: number, field: "name" | "designation", val: string) => {
    const updated = [...officers];
    updated[index] = { ...updated[index], [field]: val };
    setOfficers(updated);
  };

  const handleAddInteriorPhoto = () => setInteriorPhotos([...interiorPhotos, ""]);
  const handleRemoveInteriorPhoto = (index: number) => {
    setInteriorPhotos(interiorPhotos.filter((_, idx) => idx !== index));
  };
  const handleInteriorPhotoChange = (index: number, val: string) => {
    const updated = [...interiorPhotos];
    updated[index] = val;
    setInteriorPhotos(updated);
  };

  const handleImageUpload = (file: File, setter: (val: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Facilities predefined list
  const standardFacilities = [
    "Free Wi-Fi",
    "Parking Space",
    "AC Facility",
    "Card Payments",
    "UPI Payments",
    "CCTV Surveillance",
    "Waiting Lounge",
    "Home Delivery",
    "Wheelchair Friendly",
  ];

  const handleFacilityToggle = (facility: string) => {
    if (facilities.includes(facility)) {
      setFacilities(facilities.filter((f) => f !== facility));
    } else {
      setFacilities([...facilities, facility]);
    }
  };


  // Save / Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Business Name is required.");
      return;
    }
    if (!address.trim()) {
      alert("Business Address is required.");
      return;
    }

    const finalState = selectedState === "Other State" ? customState : selectedState;
    const finalDistrict = selectedDistrict === "Other" ? customDistrict : selectedDistrict;
    const finalHolidayTime = selectedHoliday === "Custom" ? customHoliday.trim() : selectedHoliday;

    if (!finalState.trim()) {
      alert("State is required.");
      return;
    }
    if (!finalDistrict.trim()) {
      alert("District is required.");
      return;
    }
    if (!cityTown.trim()) {
      alert("Area / City / Town is required.");
      return;
    }
    if (!pincode.trim()) {
      alert("Pincode is required.");
      return;
    }
    if (!phone.trim()) {
      alert("Contact Number is required.");
      return;
    }
    if (isTimingMandatory) {
      if (!openTime.trim()) {
        alert("Open Time is required because timings are set to mandatory.");
        return;
      }
      if (!closeTime.trim()) {
        alert("Close Time is required because timings are set to mandatory.");
        return;
      }
    }

    const finalFrontPhoto = frontPhoto.trim();
    const cleanInteriorPhotos = interiorPhotos.map((p) => p.trim()).filter(Boolean);

    // Save/Update Object matching BusinessListingData schema
    const newBusiness: BusinessListingData = {
      id: businessId || `custom-${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: name.trim(),
      location: cityTown.trim() || address.trim(),
      category: `${category} > ${subCategory}`,
      rating: isEditMode ? originalBusiness?.rating || 0 : 0,
      reviewCount: isEditMode ? originalBusiness?.reviewCount || 0 : 0,
      phone: phone.trim(),
      address: address.trim(),
      timings: `${openTime} - ${closeTime} (${finalHolidayTime})`,
      openStatus: "Open Now",
      website: website.trim(),
      images: [finalFrontPhoto, ...cleanInteriorPhotos],
      description: description.trim(),
      products: isEditMode ? originalBusiness?.products || [] : [],
      reviews: isEditMode ? originalBusiness?.reviews || [] : [],
      faqs: isEditMode ? originalBusiness?.faqs || [] : [],
      similarListings: [],
      // Custom Extra Fields
      whatsapp: whatsapp.trim(),
      extraNumbers: extraNumbers.map((n) => n.trim()).filter(Boolean),
      branches: branches.map((b) => b.trim()).filter(Boolean),
      openTime,
      closeTime,
      holidayTime: finalHolidayTime,
      officers: officers.filter((o) => o.name.trim() && o.designation.trim()),
      facilities,
      email: email.trim(),
      videoLink: videoLink.trim(),
      locationLink: locationLink.trim(),
      othersDestination: othersDestination.trim(),
      categoryLine: category.trim(),
      subCategoryLine: subCategory.trim(),
      highlightsName: highlightsName.trim(),
      bookingButtonLabel: bookingButtonLabel.trim(),
      isTimingMandatory,
      country: country.trim(),
      state: finalState.trim(),
      district: finalDistrict.trim(),
      cityTown: cityTown.trim(),
      pincode: pincode.trim(),
      password: password.trim() || undefined,
    };

    const token = localStorage.getItem("fmp_admin_token") || localStorage.getItem("fmp_user_token");
    const url = isEditMode && businessId
      ? `${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}`
      : `${API_BASE_URL}/businesses`;
    const method = isEditMode && businessId ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(newBusiness)
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        alert(isEditMode ? "Listing updated successfully!" : "Listing registered successfully!");
        onSuccess();
      } else {
        alert(data.message || "Failed to save business listing.");
      }
    })
    .catch((e) => {
      console.error(e);
      alert("Failed to save business listing.");
    });
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 text-left">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isEditMode ? `Edit: ${name || "Listing"}` : "Register New Business"}
          </h1>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-px no-scrollbar">
        {[
          { id: "basic", label: "1. Basic Details", icon: Tag },
          { id: "contact", label: "2. Contact & Branches", icon: MapPin },
          { id: "timings", label: "3. Timings & Facilities", icon: Clock },
          { id: "media", label: "4. Media & Videos", icon: ImageIcon },
          { id: "extra", label: "5. Officers & Options", icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-[11px] font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Container (Flat background, card wrapper styles removed) */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 [&_input]:bg-white [&_input]:dark:bg-slate-900 [&_select]:bg-white [&_select]:dark:bg-slate-900 [&_textarea]:bg-white [&_textarea]:dark:bg-slate-900 [&_input]:shadow-sm [&_select]:shadow-sm [&_textarea]:shadow-sm [&_input]:py-2 [&_input]:px-3.5 [&_input]:text-xs [&_input]:rounded-lg [&_select]:py-2 [&_select]:px-3.5 [&_select]:text-xs [&_select]:rounded-lg [&_textarea]:py-2 [&_textarea]:px-3.5 [&_textarea]:text-xs [&_textarea]:rounded-lg [&_label]:text-[10px] [&_label]:text-slate-900 [&_label]:dark:text-slate-100 [&_label]:font-extrabold [&_h3]:text-sm [&_.grid]:gap-4 [&_.space-y-6]:space-y-4"
      >
        {/* TAB 1: BASIC DETAILS */}
        {activeTab === "basic" && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" /> Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Name */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vishal Mega Mart"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Login Password */}
              {!isClient && (
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider">
                    Login Password {isEditMode ? "(Leave blank to keep unchanged)" : "*"}
                  </label>
                  <input
                    type="password"
                    required={!isEditMode}
                    placeholder="Set account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              )}

              {/* Category of Business */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase text-slate-900 dark:text-slate-100 tracking-wider">
                  Category of Business *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-952 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer font-semibold"
                >
                  {categories.map((cat) => (
                    <option key={cat.label} value={cat.label}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-Category of Business */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase text-slate-900 dark:text-slate-100 tracking-wider">
                  Business Sub-Category *
                </label>
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-952 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer font-semibold"
                >
                  {availableSubcategories.map((subcat) => (
                    <option key={subcat} value={subcat}>
                      {subcat}
                    </option>
                  ))}
                  {availableSubcategories.length === 0 && (
                    <option value="">No subcategories available</option>
                  )}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase text-slate-900 dark:text-slate-100 tracking-wider">
                Business Description
              </label>
              <textarea
                rows={5}
                placeholder="Describe your business services, products, history, and location advantages..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>
          </div>
        )}

        {/* TAB 2: CONTACT & BRANCHES */}
        {activeTab === "contact" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-500" /> Address & Contact Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Address */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-wider">
                  Business Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheme 54, Near Tukoganj Square, South Tukoganj, Indore"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Country Selection */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider">
                  Country *
                </label>
                <select
                  value={country}
                  onChange={(e) => {
                    const c = e.target.value;
                    setCountry(c);
                    const states = Object.keys(GLOBAL_LOCATIONS_MAP[c] || {});
                    const defaultState = states[0] || "Other State";
                    setSelectedState(defaultState);
                    const districts = GLOBAL_LOCATIONS_MAP[c]?.[defaultState] || [];
                    setSelectedDistrict(districts[0] || "Other");
                    setCustomState("");
                    setCustomDistrict("");
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-955 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer font-semibold"
                >
                  {Object.keys(GLOBAL_LOCATIONS_MAP).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* State */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider">
                  State *
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedState(val);
                    const nextDistricts = GLOBAL_LOCATIONS_MAP[country]?.[val] || [];
                    setSelectedDistrict(nextDistricts[0] || "Other");
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-955 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer font-semibold"
                >
                  {Object.keys(GLOBAL_LOCATIONS_MAP[country] || {}).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                {selectedState === "Other State" && (
                  <input
                    type="text"
                    required
                    placeholder="Type custom state name..."
                    value={customState}
                    onChange={(e) => setCustomState(e.target.value)}
                    className="w-full mt-2 bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                )}
              </div>

              {/* District */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider">
                  District *
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-955 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer font-semibold"
                >
                  {(GLOBAL_LOCATIONS_MAP[country]?.[selectedState] || ["Other"]).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {(selectedState === "Other State" || selectedDistrict === "Other") && (
                  <input
                    type="text"
                    required
                    placeholder="Type custom district/city name..."
                    value={customDistrict}
                    onChange={(e) => setCustomDistrict(e.target.value)}
                    className="w-full mt-2 bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-450 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                )}
              </div>

              {/* Area / City / Town */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider">
                  Area / City / Town *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Tukoganj"
                  value={cityTown}
                  onChange={(e) => setCityTown(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Pincode */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 452001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Contact Number */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider">
                  Contact Number *
                </label>
                {(() => {
                  const splitVal = splitPhoneNumber(phone);
                  const selectOptions = SORTED_CALLING_CODES.includes(splitVal.code)
                    ? SORTED_CALLING_CODES
                    : [splitVal.code, ...SORTED_CALLING_CODES];
                  return (
                    <div className="flex gap-2">
                      <select
                        value={splitVal.code}
                        onChange={(e) => setPhone(`${e.target.value} ${splitVal.number}`.trim())}
                        className="w-24 bg-slate-50 dark:bg-slate-955 text-sm px-2 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold cursor-pointer shrink-0 text-center"
                      >
                        {selectOptions.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 98765 43210"
                        value={splitVal.number}
                        onChange={(e) => setPhone(`${splitVal.code} ${e.target.value}`.trim())}
                        className="flex-1 bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  );
                })()}
              </div>

              {/* Whatsapp Number */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider">
                  Whatsapp Number
                </label>
                {(() => {
                  const splitVal = splitPhoneNumber(whatsapp);
                  const selectOptions = SORTED_CALLING_CODES.includes(splitVal.code)
                    ? SORTED_CALLING_CODES
                    : [splitVal.code, ...SORTED_CALLING_CODES];
                  return (
                    <div className="flex gap-2">
                      <select
                        value={splitVal.code}
                        onChange={(e) => setWhatsapp(`${e.target.value} ${splitVal.number}`.trim())}
                        className="w-24 bg-slate-50 dark:bg-slate-955 text-sm px-2 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-955 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold cursor-pointer shrink-0 text-center"
                      >
                        {selectOptions.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        placeholder="e.g. 98765 43210"
                        value={splitVal.number}
                        onChange={(e) => setWhatsapp(`${splitVal.code} ${e.target.value}`.trim())}
                        className="flex-1 bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  );
                })()}
              </div>

              {/* Business Location link */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-wider">
                  Business Location link (Google Maps Embed/Direction URL)
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://maps.google.com/?q=indore"
                  value={locationLink}
                  onChange={(e) => setLocationLink(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>


          </div>
        )}

        {/* TAB 3: TIMINGS & FACILITIES */}
        {activeTab === "timings" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" /> Timing, Email & Facilities
            </h3>

            {/* Timings Requirement Switcher */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20 max-w-xl">
              <div>
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block">
                  Timings Requirement
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                  Select if Open & Close Times are mandatory to fill.
                </span>
              </div>
              <div className="inline-flex items-center bg-slate-100/80 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsTimingMandatory(true)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isTimingMandatory
                      ? "bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Mandatory
                </button>
                <button
                  type="button"
                  onClick={() => setIsTimingMandatory(false)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !isTimingMandatory
                      ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm"
                      : "text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Not Mandatory
                </button>
              </div>
            </div>

            {/* Operating Times */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Open Time */}
              <TimeSelector
                label="Open Time"
                value={openTime}
                onChange={setOpenTime}
                required={isTimingMandatory}
              />

              {/* Close Time */}
              <TimeSelector
                label="Close Time"
                value={closeTime}
                onChange={setCloseTime}
                required={isTimingMandatory}
              />

              {/* Holiday time */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-extrabold text-slate-900 dark:text-slate-100">
                  Holiday time / Days Closed
                </label>
                <select
                  value={selectedHoliday}
                  onChange={(e) => setSelectedHoliday(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-955 text-sm px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer font-semibold"
                >
                  {COMMON_HOLIDAYS.map((day) => (
                    <option key={day} value={day} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {day}
                    </option>
                  ))}
                  <option value="Custom" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Custom...</option>
                </select>
                {selectedHoliday === "Custom" && (
                  <input
                    type="text"
                    placeholder="e.g. Sunday Closed / National Holidays"
                    value={customHoliday}
                    onChange={(e) => setCustomHoliday(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-955 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all mt-2"
                  />
                )}
              </div>
            </div>

            {/* Email & Web Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              {/* Business Email */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="h-4 w-4" /> Business Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. info@businessname.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Business websites */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="h-4 w-4" /> Business websites
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://www.businessname.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Facilities checklist */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs uppercase tracking-wider">
                Business Facilities / Amenities
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {standardFacilities.map((fac) => {
                  const isChecked = facilities.includes(fac);
                  return (
                    <button
                      key={fac}
                      type="button"
                      onClick={() => handleFacilityToggle(fac)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                        isChecked
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-850 dark:text-emerald-300 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-950/30 dark:border-slate-800 dark:text-slate-400"
                      }`}
                    >
                      <div
                        className={`h-4.5 w-4.5 rounded-md flex items-center justify-center border shrink-0 ${
                          isChecked
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                        }`}
                      >
                        {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{fac}</span>
                    </button>
                  );
                })}
              </div>

              {/* Unified facilities text input field */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">
                  Or enter facilities manually (comma separated)
                </span>
                <input
                  type="text"
                  placeholder="e.g. Free Wi-Fi, Parking Space, AC Facility, CCTV"
                  value={facilities.join(", ")}
                  onChange={(e) => {
                    const val = e.target.value;
                    const list = val.split(",").map((item) => item.trim()).filter(Boolean);
                    setFacilities(list);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MEDIA & VIDEOS */}
        {activeTab === "media" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-indigo-500" /> Business Photos & Video Embeds
            </h3>

            {/* Business front photo */}
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider font-bold">
                Business Front Photo (Primary Banner)
              </label>
              <div className="relative border border-dashed border-slate-250 dark:border-slate-800 rounded-xl p-6 bg-slate-50/40 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, setFrontPhoto);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="h-6 w-6 text-slate-400 mb-1" />
                <span className="text-xs font-bold text-slate-650 dark:text-slate-400">
                  Click to upload image file
                </span>
                <span className="text-[10px] text-slate-400">PNG, JPG, JPEG up to 10MB</span>
              </div>
              {frontPhoto && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50 rounded-xl flex items-center gap-3 text-left">
                  <div className="h-14 w-24 bg-white dark:bg-slate-850 border border-slate-200/30 rounded-lg overflow-hidden flex items-center justify-center shadow-sm shrink-0">
                    <img
                      src={frontPhoto}
                      alt="Front Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Front Photo Selected
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">Banner Preview Ready</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFrontPhoto("")}
                    className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Business interior photos */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider font-bold">
                  Business Interior Photos (Additional)
                </label>
                <button
                  type="button"
                  onClick={handleAddInteriorPhoto}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add Photo Slot
                </button>
              </div>

              <div className="space-y-4">
                {interiorPhotos.map((photo, idx) => (
                  <div key={idx} className="p-3 bg-slate-50/50 dark:bg-slate-950/10 border border-slate-150 dark:border-slate-850 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-650 dark:text-slate-400">
                        Interior Photo #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInteriorPhoto(idx)}
                        className="text-xs text-rose-500 hover:text-rose-650 flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove Slot
                      </button>
                    </div>

                    {!photo ? (
                      <div className="relative border border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file, (val) => {
                                const updated = [...interiorPhotos];
                                updated[idx] = val;
                                setInteriorPhotos(updated);
                              });
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <Upload className="h-4 w-4 text-slate-400 mb-1" />
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                          Click to upload file
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-left">
                        <div className="h-12 w-20 bg-white dark:bg-slate-850 border border-slate-200/30 rounded-lg overflow-hidden flex items-center justify-center shadow-sm shrink-0">
                          <img
                            src={photo}
                            alt={`Interior Preview #${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-slate-700 dark:text-slate-350">
                            Image Selected
                          </p>
                          <p className="text-[9px] text-slate-400 truncate">Ready</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...interiorPhotos];
                            updated[idx] = "";
                            setInteriorPhotos(updated);
                          }}
                          className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {interiorPhotos.length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                    No additional interior images added.
                  </p>
                )}
              </div>
            </div>

            {/* Business vido link */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Video className="h-4 w-4 text-rose-500" /> Business Video Link (YouTube Share / Embed Link)
              </label>
              <input
                type="url"
                placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        )}

        {/* TAB 5: OFFICERS & EXTRA DETAILS */}
        {activeTab === "extra" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-500" /> Officers & Custom Options
            </h3>

            {/* Officers dynamic list */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider">
                  Business Officers / Management Team
                </label>
                <button
                  type="button"
                  onClick={handleAddOfficer}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add Officer
                </button>
              </div>

              <div className="space-y-3">
                {officers.map((off, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
                  >
                    <input
                      type="text"
                      placeholder="Officer Full Name"
                      value={off.name}
                      onChange={(e) => handleOfficerChange(idx, "name", e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Designation (e.g. Managing Director)"
                      value={off.designation}
                      onChange={(e) => handleOfficerChange(idx, "designation", e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOfficer(idx)}
                      className="h-11 w-full sm:w-11 shrink-0 flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
                {officers.length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                    No business officers added.
                  </p>
                )}
              </div>
            </div>

            {/* Destination detail */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs uppercase tracking-wider">
                Business Others Destination (Other Details/Features)
              </label>
              <input
                type="text"
                placeholder="e.g. Near Indiranagar Metro Station / Famous for street shopping / ISO 9001 Certified"
                value={othersDestination}
                onChange={(e) => setOthersDestination(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Booking Button Custom Label */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs uppercase tracking-wider">
                Booking Button Name (e.g. Book Table, Book Appointment, Order Now)
              </label>
              <input
                type="text"
                placeholder="Defaults to Book Now / Book Table / Book Room based on category"
                value={bookingButtonLabel}
                onChange={(e) => setBookingButtonLabel(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        )}

        {/* Bottom Actions Row */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 px-6 py-3 text-sm font-bold transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-sm font-bold shadow-md shadow-indigo-600/10 transition cursor-pointer"
          >
            <Save className="h-4.5 w-4.5" />
            <span>{isEditMode ? "Save Changes" : "Register Listing"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
