import { useState, useEffect } from "react";
import {
  Compass,
  Plus,
  Trash2,
  Tag,
  Info,
  Image as ImageIcon,
  MapPin,
  Star,
  Upload,
  X,
  Pencil,
} from "lucide-react";
import { touristPlacesData, TouristPlaceDetailData } from "../data/touristPlacesData";
import { API_BASE_URL } from "../config";

interface AddTouristPlaceFormProps {
  onCancel: () => void;
}

export default function AddTouristPlaceForm({ onCancel }: AddTouristPlaceFormProps) {
  const [places, setPlaces] = useState<TouristPlaceDetailData[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlace, setEditingPlace] = useState<TouristPlaceDetailData | null>(null);
  const [reviewStats, setReviewStats] = useState<Record<string, { count: number; avgRating: number }>>({});
  const [reviewModal, setReviewModal] = useState<{ placeName: string; reviews: any[] } | null>(null);
  const [reviewModalLoading, setReviewModalLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [rating, setRating] = useState("");
  const [reviewsCount, setReviewsCount] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");

  // Quick Info Fields
  const [bestTime, setBestTime] = useState("");
  const [idealDuration, setIdealDuration] = useState("");
  const [nearestAirport, setNearestAirport] = useState("");
  const [localTransport, setLocalTransport] = useState("");

  // Images Fields
  const [coverImage, setCoverImage] = useState("");
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");
  const [image3, setImage3] = useState("");

  // FAQs
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);

  // Load places from API on mount
  const loadPlaces = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tourist-places`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const loadedPlaces: TouristPlaceDetailData[] = data.data;
        setPlaces(loadedPlaces);

        // Fetch real review stats for every place in parallel
        const statsEntries = await Promise.all(
          loadedPlaces.map(async (p) => {
            try {
              const r = await fetch(`${API_BASE_URL}/place-reviews/${encodeURIComponent(p.name)}`);
              const j = await r.json();
              if (j.success && Array.isArray(j.data) && j.data.length > 0) {
                const sum = j.data.reduce((acc: number, rev: any) => acc + (rev.rating || 0), 0);
                const avg = Math.round((sum / j.data.length) * 10) / 10;
                return [p.name, { count: j.data.length, avgRating: avg }] as const;
              }
            } catch (_) {}
            return [p.name, { count: 0, avgRating: 0 }] as const;
          })
        );
        setReviewStats(Object.fromEntries(statsEntries));
      } else {
        setPlaces([]);
      }
    } catch (e) {
      console.error("Failed to load tourist places:", e);
      setPlaces([]);
    }
  };

  useEffect(() => {
    loadPlaces();
  }, []);

  // Handle API save
  const handleSavePlace = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Destination Name is required");
      return;
    }

    const newPlace = {
      name: name.trim(),
      coverImage: coverImage.trim(),
      images: [
        coverImage.trim(),
        image1.trim(),
        image2.trim(),
        image3.trim(),
      ].filter((img) => img.length > 0),
      rating: parseFloat(rating) || 0,
      reviewsCount: parseInt(reviewsCount) || 0,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
      description: description.trim(),
      bestTime: bestTime.trim(),
      idealDuration: idealDuration.trim(),
      nearestAirport: nearestAirport.trim(),
      localTransport: localTransport.trim(),
      // Default placeholder structures
      categories: [
        { name: "Temples", icon: "🕌" },
        { name: "Hotels", icon: "🏨" },
        { name: "Food Point", icon: "🍲" },
        { name: "Spas", icon: "💆" },
        { name: "Shopping", icon: "🛍️" },
        { name: "Sightseeing", icon: "📸" }
      ],
      temples: [],
      hotels: [],
      restaurants: [],
      spas: [],
      activities: [],
      faqs: faqs.filter(f => f.question.trim() && f.answer.trim()),
    };

    const token = localStorage.getItem("fmp_admin_token");
    try {
      const url = editingPlace
        ? `${API_BASE_URL}/tourist-places/${encodeURIComponent(editingPlace.name)}`
        : `${API_BASE_URL}/tourist-places`;
      const method = editingPlace ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newPlace)
      });
      const data = await res.json();
      if (data.success) {
        alert(editingPlace ? `Tourist place updated successfully!` : `Tourist place "${name}" added successfully!`);

        // Reset form
        setName("");
        setRating("");
        setReviewsCount("");
        setTags("");
        setDescription("");
        setBestTime("");
        setIdealDuration("");
        setNearestAirport("");
        setLocalTransport("");
        setCoverImage("");
        setImage1("");
        setImage2("");
        setImage3("");
        setFaqs([]);
        setEditingPlace(null);

        setShowAddForm(false);
        loadPlaces();
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("fmp_places_changed"));
      } else {
        alert("Failed to save tourist place: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save tourist place.");
    }
  };

  // Image Upload helper (base64)
  const handleImageUpload = (file: File, setter: (val: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Edit click handler
  const handleEditClick = (place: TouristPlaceDetailData) => {
    setEditingPlace(place);
    setName(place.name);
    setRating(String(place.rating));
    setReviewsCount(String(place.reviewsCount));
    setTags(place.tags.join(", "));
    setDescription(place.description);
    setBestTime(place.bestTime || "");
    setIdealDuration(place.idealDuration || "");
    setNearestAirport(place.nearestAirport || "");
    setLocalTransport(place.localTransport || "");
    setCoverImage(place.coverImage || "");
    setImage1(place.images?.[1] || "");
    setImage2(place.images?.[2] || "");
    setImage3(place.images?.[3] || "");
    setFaqs(place.faqs && place.faqs.length > 0 ? place.faqs.map(f => ({ question: f.question, answer: f.answer })) : []);
    setShowAddForm(true);
  };

  // Delete handler
  const handleDeletePlace = async (placeNameToDelete: string) => {
    if (window.confirm(`Are you sure you want to delete "${placeNameToDelete}"?`)) {
      const token = localStorage.getItem("fmp_admin_token");
      try {
        const res = await fetch(`${API_BASE_URL}/tourist-places/${encodeURIComponent(placeNameToDelete)}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          loadPlaces();
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("fmp_places_changed"));
          alert("Destination deleted successfully.");
        } else {
          alert("Failed to delete place: " + (data.message || "Unknown error"));
        }
      } catch (e) {
        console.error(e);
        alert("Failed to delete destination.");
      }
    }
  };

  return (
    <>
    <div className="space-y-5 w-full animate-fade-in-up">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              Tourist Places
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage and register custom city tourist guide destinations
            </p>
          </div>
        </div>
        {!showAddForm && (
          <button
            onClick={() => {
              setEditingPlace(null);
              setName("");
              setRating("");
              setReviewsCount("");
              setTags("");
              setDescription("");
              setBestTime("");
              setIdealDuration("");
              setNearestAirport("");
              setLocalTransport("");
              setCoverImage("");
              setImage1("");
              setImage2("");
              setImage3("");
              setFaqs([]);
              setShowAddForm(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition duration-250 cursor-pointer self-start sm:self-auto text-xs shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Destination
          </button>
        )}
      </div>

      {showAddForm ? (
        /* Form Card */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-lg space-y-5 text-left [&_input]:py-2 [&_input]:px-3.5 [&_input]:text-xs [&_input]:rounded-lg [&_textarea]:py-2 [&_textarea]:px-3.5 [&_textarea]:text-xs [&_textarea]:rounded-lg [&_label]:text-[10px] [&_label]:font-black [&_label]:uppercase [&_label]:tracking-wider [&_label]:text-slate-450">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              {editingPlace ? (
                <>
                  <Pencil className="h-4 w-4 text-indigo-500" />
                  Edit Tourist Destination: {editingPlace.name}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 text-indigo-500" />
                  Register New Tourist Destination
                </>
              )}
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingPlace(null);
              }}
              className="text-slate-450 hover:text-slate-700 dark:hover:text-slate-250 cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <form onSubmit={handleSavePlace} className="space-y-4">
            {/* Primary Details Row */}
            <div className="space-y-1.5">
              <label className="block">Destination Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Ujjain Tourism"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 font-semibold"
              />
            </div>

            {/* Tags & Description */}
            <div className="space-y-1.5">
              <label className="block">Tags (Comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. Pilgrimage, Spiritual, Historical, Ancient City"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block">About the Destination (Description)</label>
              <textarea
                required
                rows={3}
                placeholder="Describe the destination history, major highlights and key info..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 font-semibold"
              />
            </div>

            {/* Quick Travel Info Section */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-3">
                Quick Travel Info
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="block">Best Time to Visit</label>
                  <input
                    type="text"
                    placeholder="e.g. October to March (Winter)"
                    value={bestTime}
                    onChange={(e) => setBestTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block">Ideal Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 - 3 Days"
                    value={idealDuration}
                    onChange={(e) => setIdealDuration(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block">Nearest Airport</label>
                  <input
                    type="text"
                    placeholder="e.g. Indore (IDR) Airport"
                    value={nearestAirport}
                    onChange={(e) => setNearestAirport(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block">Local Transport</label>
                  <input
                    type="text"
                    placeholder="e.g. Auto, E-Rickshaw, Cabs"
                    value={localTransport}
                    onChange={(e) => setLocalTransport(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Images Grid Section */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-3">
                Images Gallery (Uploads Only)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cover Image */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2">
                  <label className="block text-indigo-500 font-black">Main Banner Image</label>
                  {!coverImage ? (
                    <div className="relative border border-dashed border-slate-250 dark:border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center bg-white dark:bg-slate-900 cursor-pointer text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          e.target.files?.[0] && handleImageUpload(e.target.files[0], setCoverImage)
                        }
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="h-4 w-4 text-slate-400 mb-1" />
                      Click to upload banner
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="h-16 w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-850 relative group">
                        <img
                          src={coverImage}
                          alt="Cover Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-450 font-bold uppercase tracking-wider">Image Selected</span>
                        <button
                          type="button"
                          onClick={() => setCoverImage("")}
                          className="text-rose-500 hover:underline font-bold"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnail 1 */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2">
                  <label className="block font-black text-slate-500">Thumbnail Scene 1</label>
                  {!image1 ? (
                    <div className="relative border border-dashed border-slate-250 dark:border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center bg-white dark:bg-slate-900 cursor-pointer text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          e.target.files?.[0] && handleImageUpload(e.target.files[0], setImage1)
                        }
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="h-4 w-4 text-slate-400 mb-1" />
                      Click to upload image
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="h-16 w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-850 relative group">
                        <img src={image1} alt="Preview 1" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-455 font-bold uppercase tracking-wider">Image Selected</span>
                        <button
                          type="button"
                          onClick={() => setImage1("")}
                          className="text-rose-500 hover:underline font-bold"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnail 2 */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2">
                  <label className="block font-black text-slate-500">Thumbnail Scene 2</label>
                  {!image2 ? (
                    <div className="relative border border-dashed border-slate-250 dark:border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center bg-white dark:bg-slate-900 cursor-pointer text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          e.target.files?.[0] && handleImageUpload(e.target.files[0], setImage2)
                        }
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="h-4 w-4 text-slate-400 mb-1" />
                      Click to upload image
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="h-16 w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-850 relative group">
                        <img src={image2} alt="Preview 2" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-455 font-bold uppercase tracking-wider">Image Selected</span>
                        <button
                          type="button"
                          onClick={() => setImage2("")}
                          className="text-rose-500 hover:underline font-bold"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnail 3 */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2">
                  <label className="block font-black text-slate-500">Thumbnail Scene 3</label>
                  {!image3 ? (
                    <div className="relative border border-dashed border-slate-250 dark:border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center bg-white dark:bg-slate-900 cursor-pointer text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          e.target.files?.[0] && handleImageUpload(e.target.files[0], setImage3)
                        }
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="h-4 w-4 text-slate-400 mb-1" />
                      Click to upload image
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="h-16 w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-850 relative group">
                        <img src={image3} alt="Preview 3" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-455 font-bold uppercase tracking-wider">Image Selected</span>
                        <button
                          type="button"
                          onClick={() => setImage3("")}
                          className="text-rose-500 hover:underline font-bold"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FAQs Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">
                  FAQs — Frequently Asked Questions
                  <span className="ml-1.5 text-slate-400 normal-case font-semibold">(shown on destination page)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setFaqs(prev => [...prev, { question: "", answer: "" }])}
                  className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-400 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Add FAQ
                </button>
              </div>

              {faqs.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic py-2">
                  No FAQs added yet. Click "Add FAQ" to create question & answer pairs.
                </p>
              ) : (
                <div className="space-y-3">
                  {faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-wider text-indigo-500">FAQ #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => setFaqs(prev => prev.filter((_, i) => i !== idx))}
                          className="h-5 w-5 flex items-center justify-center rounded-md bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-200 transition cursor-pointer"
                          title="Remove FAQ"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Question e.g. What is the best time to visit?"
                        value={faq.question}
                        onChange={e => setFaqs(prev => prev.map((f, i) => i === idx ? { ...f, question: e.target.value } : f))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 font-semibold"
                      />
                      <textarea
                        rows={2}
                        placeholder="Answer e.g. October to March is the ideal time..."
                        value={faq.answer}
                        onChange={e => setFaqs(prev => prev.map((f, i) => i === idx ? { ...f, answer: e.target.value } : f))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 font-semibold resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingPlace(null);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850 text-xs font-bold rounded-lg transition duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition duration-200 cursor-pointer"
              >
                {editingPlace ? "Update Destination" : "Save Destination"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Listing Grid / Table (Flat, no card background) */
        <div className="space-y-4">
          <div className="text-left font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">
            Registered Tourist Destinations ({places.length})
          </div>

          {places.length === 0 ? (
            <div className="text-center py-12 px-4 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/40">
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                No registered places yet. Click "+ Add Destination" above to register one.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {places.map((item) => (
                <div
                  key={item.name}
                  className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden text-left flex flex-col justify-between hover:shadow-md transition"
                >
                  <div className="h-28 bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
                    <img
                      src={item.coverImage}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="h-6.5 w-6.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-650 border border-indigo-200 flex items-center justify-center shadow transition duration-200 cursor-pointer"
                        title="Edit Destination"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePlace(item.name)}
                        className="h-6.5 w-6.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center shadow transition duration-200 cursor-pointer"
                        title="Delete Destination"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-indigo-650 text-[9px] font-black text-white uppercase tracking-wider select-none bg-indigo-600">
                      Active
                    </span>
                  </div>
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-slate-450 line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 border-t border-slate-100 dark:border-slate-850 pt-2 mt-2">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-450">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {reviewStats[item.name]?.count > 0
                          ? reviewStats[item.name].avgRating
                          : <span className="text-slate-350">No rating</span>}
                      </span>
                      <button
                        onClick={async () => {
                          setReviewModalLoading(true);
                          setReviewModal({ placeName: item.name, reviews: [] });
                          try {
                            const r = await fetch(`${API_BASE_URL}/place-reviews/${encodeURIComponent(item.name)}`);
                            const j = await r.json();
                            setReviewModal({ placeName: item.name, reviews: j.success ? j.data : [] });
                          } catch (_) {
                            setReviewModal({ placeName: item.name, reviews: [] });
                          } finally {
                            setReviewModalLoading(false);
                          }
                        }}
                        className="text-slate-400 hover:text-indigo-600 transition cursor-pointer underline underline-offset-2"
                      >
                        ({reviewStats[item.name]?.count ?? 0} review{(reviewStats[item.name]?.count ?? 0) !== 1 ? 's' : ''})
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>

    {/* Reviews Modal */}
    {reviewModal && (
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
        onClick={(e) => { if (e.target === e.currentTarget) setReviewModal(null); }}
      >
        <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Reviews</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">{reviewModal.placeName}</p>
            </div>
            <button
              onClick={() => setReviewModal(null)}
              className="h-7 w-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="h-3.5 w-3.5 text-slate-500" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
            {reviewModalLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-7 w-7 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : reviewModal.reviews.length === 0 ? (
              <div className="text-center py-12">
                <Star className="h-8 w-8 mx-auto text-slate-200 dark:text-slate-700 mb-2" />
                <p className="text-xs font-semibold text-slate-400">No reviews yet for this destination.</p>
              </div>
            ) : (
              reviewModal.reviews.map((rev: any, i: number) => (
                <div
                  key={i}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black text-white bg-gradient-to-tr ${rev.userColor} shrink-0`}
                      >
                        {rev.userInitial}
                      </div>
                      <div>
                        <span className="text-[12px] font-bold text-slate-900 dark:text-white block">{rev.userName}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star
                          key={si}
                          className={`h-3 w-3 ${si < rev.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200 dark:text-slate-700'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    "{rev.reviewText}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
