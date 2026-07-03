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
} from "lucide-react";
import { categories } from "../pages/Home";
import { subcategoriesData } from "../pages/CategoryDetail";
import { businessesData, BusinessListingData } from "../data/businessesData";

interface AdminEntryFormProps {
  businessId: string | null; // If null, we are in Add mode, otherwise Edit mode
  onCancel: () => void;
  onSuccess: () => void;
}

type TabType = "basic" | "contact" | "timings" | "media" | "extra";

export default function AdminEntryForm({ businessId, onCancel, onSuccess }: AdminEntryFormProps) {
  const isEditMode = !!businessId;
  const [activeTab, setActiveTab] = useState<TabType>("basic");

  // Form State
  const [name, setName] = useState("");
  const [highlightsName, setHighlightsName] = useState("");
  const [category, setCategory] = useState(categories[0]?.label || "Spa Point");
  const [subCategory, setSubCategory] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [extraNumbers, setExtraNumbers] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [openTime, setOpenTime] = useState("09:00 AM");
  const [closeTime, setCloseTime] = useState("09:00 PM");
  const [holidayTime, setHolidayTime] = useState("Sunday");
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

  // Update subcategory default when category changes
  useEffect(() => {
    if (!isEditMode) {
      setSubCategory(availableSubcategories[0] || "");
    }
  }, [category, isEditMode]);

  // Load existing business details if in Edit Mode
  useEffect(() => {
    if (isEditMode && businessId) {
      const biz = businessesData.find((b) => b.id === businessId);
      if (biz) {
        setName(biz.name || "");
        setHighlightsName(biz.highlightsName || "");

        const [mainCat, subCat] = biz.category.split(" > ");
        setCategory(mainCat || categories[0]?.label || "Spa Point");
        setSubCategory(subCat || "");

        setAddress(biz.address || "");
        setPhone(biz.phone || "");
        setWhatsapp(biz.whatsapp || "");
        setExtraNumbers(biz.extraNumbers || []);
        setBranches(biz.branches || []);
        setOpenTime(biz.openTime || "09:00 AM");
        setCloseTime(biz.closeTime || "09:00 PM");
        setHolidayTime(biz.holidayTime || "Sunday");
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
      }
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

  // Custom facility text input
  const [customFacility, setCustomFacility] = useState("");
  const handleAddCustomFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (customFacility.trim() && !facilities.includes(customFacility.trim())) {
      setFacilities([...facilities, customFacility.trim()]);
      setCustomFacility("");
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
    if (!phone.trim()) {
      alert("Contact Number is required.");
      return;
    }

    // Default Images fallback if empty
    const finalFrontPhoto =
      frontPhoto.trim() ||
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80";
    const cleanInteriorPhotos = interiorPhotos.map((p) => p.trim()).filter(Boolean);

    // Save/Update Object matching BusinessListingData schema
    const newBusiness: BusinessListingData = {
      id: businessId || `custom-${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: name.trim(),
      location: address.includes("Indore") ? "South Tukoganj - Indore" : "Andheri West - Mumbai", // default location parsed or fallback
      category: `${category} > ${subCategory}`,
      rating: isEditMode ? businessesData.find((b) => b.id === businessId)?.rating || 4.8 : 5.0,
      reviewCount: isEditMode
        ? businessesData.find((b) => b.id === businessId)?.reviewCount || 1
        : 1,
      phone: phone.trim(),
      address: address.trim(),
      timings: `${openTime} - ${closeTime} (${holidayTime})`,
      openStatus: "Open Now",
      website: website.trim(),
      images: [finalFrontPhoto, ...cleanInteriorPhotos],
      description:
        description.trim() ||
        `${name} is a leading premium business serving your requirements in the region.`,
      products: isEditMode
        ? businessesData.find((b) => b.id === businessId)?.products || []
        : [
            {
              name: `Standard ${subCategory} Service`,
              price: "₹499 onwards",
              img: finalFrontPhoto,
              desc: `Full professional package for standard ${subCategory} requirements.`,
            },
          ],
      reviews: isEditMode
        ? businessesData.find((b) => b.id === businessId)?.reviews || []
        : [
            {
              userName: "Admin Panel",
              userInitial: "A",
              userColor: "from-indigo-500 to-purple-600",
              rating: 5,
              date: "Just now",
              reviewText: "Listing registered officially via the Admin Panel.",
            },
          ],
      faqs: isEditMode
        ? businessesData.find((b) => b.id === businessId)?.faqs || []
        : [
            {
              question: "What forms of payment are accepted?",
              answer:
                "We support cash, major credit cards, UPI (GPay/PhonePe), and online banking.",
            },
          ],
      similarListings: [],
      // Custom Extra Fields
      whatsapp: whatsapp.trim(),
      extraNumbers: extraNumbers.map((n) => n.trim()).filter(Boolean),
      branches: branches.map((b) => b.trim()).filter(Boolean),
      openTime,
      closeTime,
      holidayTime,
      officers: officers.filter((o) => o.name.trim() && o.designation.trim()),
      facilities,
      email: email.trim(),
      videoLink: videoLink.trim(),
      locationLink: locationLink.trim(),
      othersDestination: othersDestination.trim(),
      categoryLine: categoryLine.trim(),
      subCategoryLine: subCategoryLine.trim(),
      highlightsName: highlightsName.trim(),
      bookingButtonLabel: bookingButtonLabel.trim(),
    };

    try {
      const saved = localStorage.getItem("fmp_custom_businesses");
      let customList = saved ? JSON.parse(saved) : [];

      if (isEditMode && businessId) {
        customList = customList.map((b: any) => (b.id === businessId ? newBusiness : b));

        // Update in active memory array
        const idx = businessesData.findIndex((b) => b.id === businessId);
        if (idx > -1) {
          businessesData[idx] = newBusiness;
        }
      } else {
        customList.push(newBusiness);

        // Push in active memory array
        businessesData.push(newBusiness);
      }

      localStorage.setItem("fmp_custom_businesses", JSON.stringify(customList));
      alert(isEditMode ? "Listing updated successfully!" : "Listing registered successfully!");

      // Dispatch storage event to alert lists
      window.dispatchEvent(new Event("storage"));
      onSuccess();
    } catch (e) {
      console.error(e);
      alert("Failed to save business listing.");
    }
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
        className="space-y-6 [&_input]:bg-white [&_input]:dark:bg-slate-900 [&_select]:bg-white [&_select]:dark:bg-slate-900 [&_textarea]:bg-white [&_textarea]:dark:bg-slate-900 [&_input]:shadow-sm [&_select]:shadow-sm [&_textarea]:shadow-sm [&_input]:py-2 [&_input]:px-3.5 [&_input]:text-xs [&_input]:rounded-lg [&_select]:py-2 [&_select]:px-3.5 [&_select]:text-xs [&_select]:rounded-lg [&_textarea]:py-2 [&_textarea]:px-3.5 [&_textarea]:text-xs [&_textarea]:rounded-lg [&_label]:text-[10px] [&_h3]:text-sm [&_.grid]:gap-4 [&_.space-y-6]:space-y-4"
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
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
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

              {/* Highlights Name */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                  1. Highlights Name / Promo Tagline
                  <span className="normal-case text-[10px] text-slate-400 font-normal">
                    (Promoted label in listings)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 50% Off / Pure Organic / Best Rated"
                  value={highlightsName}
                  onChange={(e) => setHighlightsName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Category of Business */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  2. Category of Business *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer font-semibold"
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
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  19. Business Sub-Category *
                </label>
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer font-semibold"
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
              <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                10. Business Description
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
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  3. Business Address *
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

              {/* Contact Number */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  4. Contact Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Whatsapp Number */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  5. Whatsapp Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Business Location link */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  17. Business Location link (Google Maps Embed/Direction URL)
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

            {/* Extra Numbers Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  6. Others Extra Numbers Add
                </label>
                <button
                  type="button"
                  onClick={handleAddExtraNumber}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add Phone
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {extraNumbers.map((num, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="tel"
                      placeholder={`Extra Phone #${idx + 1}`}
                      value={num}
                      onChange={(e) => handleExtraNumberChange(idx, e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExtraNumber(idx)}
                      className="h-11 w-11 shrink-0 flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
                {extraNumbers.length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 col-span-2 italic">
                    No extra contact numbers added.
                  </p>
                )}
              </div>
            </div>

            {/* Branches Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  7. Business Branch Addresses
                </label>
                <button
                  type="button"
                  onClick={handleAddBranch}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add Branch
                </button>
              </div>

              <div className="space-y-3">
                {branches.map((br, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder={`e.g. Vijay Nagar Branch - 14, Food Court Road, Indore`}
                      value={br}
                      onChange={(e) => handleBranchChange(idx, e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveBranch(idx)}
                      className="h-11 w-11 shrink-0 flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
                {branches.length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                    No business branches added.
                  </p>
                )}
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

            {/* Operating Times */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Open Time */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  8. Open Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 09:00 AM"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Close Time */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  8. Close Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10:00 PM"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Holiday time */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  9. Holiday time / Days Closed
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sunday Closed / National Holidays"
                  value={holidayTime}
                  onChange={(e) => setHolidayTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Email & Web Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              {/* Business Email */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Mail className="h-4 w-4" /> 12 (Part 2). Business Email
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
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Globe className="h-4 w-4" /> 13. Business websites
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
              <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                12 (Part 1). Business Facilities / Amenities
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

              {/* Custom facility input */}
              <div className="flex gap-2 max-w-sm pt-2">
                <input
                  type="text"
                  placeholder="Add custom facility..."
                  value={customFacility}
                  onChange={(e) => setCustomFacility(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddCustomFacility}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition cursor-pointer shrink-0"
                >
                  Add Tag
                </button>
              </div>

              {/* Extra Dynamic Facilities tags output */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {facilities
                  .filter((f) => !standardFacilities.includes(f))
                  .map((fac) => (
                    <span
                      key={fac}
                      className="inline-flex items-center gap-1 text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full font-bold border border-slate-200 dark:border-slate-700"
                    >
                      {fac}
                      <button
                        type="button"
                        onClick={() => handleFacilityToggle(fac)}
                        className="text-slate-400 hover:text-rose-500 font-normal text-xs pl-1 cursor-pointer focus:outline-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
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
              <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                15. Business Front Photo (Primary Banner URL)
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-... (Paste any image URL)"
                  value={frontPhoto}
                  onChange={(e) => setFrontPhoto(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 transition-all"
                />
              </div>
              {frontPhoto && (
                <div className="h-28 w-44 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 relative group">
                  <img
                    src={frontPhoto}
                    alt="Front Preview"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/75 text-[9px] font-black uppercase text-white px-1.5 py-0.5 rounded">
                    Banner Preview
                  </span>
                </div>
              )}
            </div>

            {/* Business interior photos */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  16. Business Interior Photos (Additional URLs)
                </label>
                <button
                  type="button"
                  onClick={handleAddInteriorPhoto}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add Photo
                </button>
              </div>

              <div className="space-y-4">
                {interiorPhotos.map((photo, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <input
                        type="url"
                        placeholder={`Interior Photo URL #${idx + 1}`}
                        value={photo}
                        onChange={(e) => handleInteriorPhotoChange(idx, e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveInteriorPhoto(idx)}
                        className="h-11 w-11 shrink-0 flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition cursor-pointer"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                    {photo && (
                      <div className="h-20 w-32 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                        <img
                          src={photo}
                          alt={`Interior Preview #${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
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
              <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                <Video className="h-4 w-4 text-rose-500" /> 14. Business Video Link (YouTube Share /
                Embed Link)
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
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  11. Business Officers / Management Team
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
              <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                18. Business Others Destination (Other Details/Features)
              </label>
              <input
                type="text"
                placeholder="e.g. Near Indiranagar Metro Station / Famous for street shopping / ISO 9001 Certified"
                value={othersDestination}
                onChange={(e) => setOthersDestination(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Custom option lines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              {/* Category option line */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  20. Business Category Option Line (Custom Tag Override)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Primary: Grocery & Daily Essentials"
                  value={categoryLine}
                  onChange={(e) => setCategoryLine(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Sub Category option line */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  19. Business Sub Category Option Line (Custom Subtag)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sub: Hypermarket / Fashion Retailer"
                  value={subCategoryLine}
                  onChange={(e) => setSubCategoryLine(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Booking Button Custom Label */}
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
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
