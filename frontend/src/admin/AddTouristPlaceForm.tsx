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
} from "lucide-react";
import { touristPlacesData, TouristPlaceDetailData } from "../data/touristPlacesData";

interface AddTouristPlaceFormProps {
  onCancel: () => void;
}

export default function AddTouristPlaceForm({ onCancel }: AddTouristPlaceFormProps) {
  const [customPlaces, setCustomPlaces] = useState<TouristPlaceDetailData[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [rating, setRating] = useState("4.8");
  const [reviewsCount, setReviewsCount] = useState("1200");
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

  // Load custom places from localStorage on mount
  const loadCustomPlaces = () => {
    try {
      const saved = localStorage.getItem("fmp_custom_tourist_places");
      if (saved) {
        setCustomPlaces(JSON.parse(saved));
      } else {
        setCustomPlaces([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCustomPlaces();
  }, []);

  // Handle local storage save
  const handleSavePlace = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Destination Name is required");
      return;
    }

    const newPlace: TouristPlaceDetailData = {
      name: name.trim(),
      coverImage:
        coverImage.trim() ||
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
      images: [
        coverImage.trim() ||
          "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
        image1.trim() ||
          "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=800&q=80",
        image2.trim() ||
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        image3.trim() ||
          "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80",
      ],
      rating: parseFloat(rating) || 4.8,
      reviewsCount: parseInt(reviewsCount) || 120,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
      description: description.trim(),
      bestTime: bestTime.trim() || "October to March",
      idealDuration: idealDuration.trim() || "2 - 3 Days",
      nearestAirport: nearestAirport.trim() || "Local Airport",
      localTransport: localTransport.trim() || "Cabs, Auto Rickshaws",
      // Default placeholder structures
      categories: [
        { name: "Temples", icon: "🕌" },
        { name: "Hotels", icon: "🏨" },
        { name: "Food Point", icon: "🍲" },
      ],
      temples: [],
      hotels: [],
      restaurants: [],
      spas: [],
      activities: [],
      faqs: [],
    };

    try {
      const updated = [...customPlaces, newPlace];
      localStorage.setItem("fmp_custom_tourist_places", JSON.stringify(updated));
      alert(`Tourist place "${name}" added successfully!`);

      // Reset form
      setName("");
      setRating("4.8");
      setReviewsCount("1200");
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

      setShowAddForm(false);
      loadCustomPlaces();
      window.dispatchEvent(new Event("storage"));
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

  // Delete handler
  const handleDeletePlace = (placeNameToDelete: string) => {
    if (window.confirm(`Are you sure you want to delete "${placeNameToDelete}"?`)) {
      try {
        const updated = customPlaces.filter((p) => p.name !== placeNameToDelete);
        localStorage.setItem("fmp_custom_tourist_places", JSON.stringify(updated));
        loadCustomPlaces();
        window.dispatchEvent(new Event("storage"));
        alert("Destination deleted successfully.");
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
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
            onClick={() => setShowAddForm(true)}
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
              <Plus className="h-4 w-4 text-indigo-500" />
              Register New Tourist Destination
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-slate-450 hover:text-slate-700 dark:hover:text-slate-250 cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <form onSubmit={handleSavePlace} className="space-y-4">
            {/* Primary Details Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="space-y-1.5">
                <label className="block">Rating (1.0 - 5.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  required
                  placeholder="e.g. 4.9"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block">Reviews Count</label>
                <input
                  type="number"
                  placeholder="e.g. 1845"
                  value={reviewsCount}
                  onChange={(e) => setReviewsCount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 font-semibold"
                />
              </div>
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
                Images Gallery (Upload / URL)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cover Image */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2">
                  <label className="block text-indigo-500 font-black">Main Banner Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste cover image URL..."
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 font-semibold"
                    />
                    <div className="relative border border-dashed border-slate-250 dark:border-slate-800 rounded-lg px-3 py-1 flex items-center justify-center bg-white dark:bg-slate-900 cursor-pointer text-[10px] font-bold">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          e.target.files?.[0] && handleImageUpload(e.target.files[0], setCoverImage)
                        }
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="h-3 w-3 mr-1" /> File
                    </div>
                  </div>
                  {coverImage && (
                    <div className="h-14 w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-850">
                      <img
                        src={coverImage}
                        alt="Cover Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Thumbnail 1 */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2">
                  <label className="block font-black text-slate-500">Thumbnail Scene 1</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste image URL..."
                      value={image1}
                      onChange={(e) => setImage1(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 font-semibold"
                    />
                    <div className="relative border border-dashed border-slate-250 dark:border-slate-800 rounded-lg px-3 py-1 flex items-center justify-center bg-white dark:bg-slate-900 cursor-pointer text-[10px] font-bold">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          e.target.files?.[0] && handleImageUpload(e.target.files[0], setImage1)
                        }
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="h-3 w-3 mr-1" /> File
                    </div>
                  </div>
                  {image1 && (
                    <div className="h-14 w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-850">
                      <img src={image1} alt="Preview 1" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Thumbnail 2 */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2">
                  <label className="block font-black text-slate-500">Thumbnail Scene 2</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste image URL..."
                      value={image2}
                      onChange={(e) => setImage2(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 font-semibold"
                    />
                    <div className="relative border border-dashed border-slate-250 dark:border-slate-800 rounded-lg px-3 py-1 flex items-center justify-center bg-white dark:bg-slate-900 cursor-pointer text-[10px] font-bold">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          e.target.files?.[0] && handleImageUpload(e.target.files[0], setImage2)
                        }
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="h-3 w-3 mr-1" /> File
                    </div>
                  </div>
                  {image2 && (
                    <div className="h-14 w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-850">
                      <img src={image2} alt="Preview 2" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Thumbnail 3 */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2">
                  <label className="block font-black text-slate-500">Thumbnail Scene 3</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste image URL..."
                      value={image3}
                      onChange={(e) => setImage3(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 font-semibold"
                    />
                    <div className="relative border border-dashed border-slate-250 dark:border-slate-800 rounded-lg px-3 py-1 flex items-center justify-center bg-white dark:bg-slate-900 cursor-pointer text-[10px] font-bold">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          e.target.files?.[0] && handleImageUpload(e.target.files[0], setImage3)
                        }
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="h-3 w-3 mr-1" /> File
                    </div>
                  </div>
                  {image3 && (
                    <div className="h-14 w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-850">
                      <img src={image3} alt="Preview 3" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850 text-xs font-bold rounded-lg transition duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition duration-200 cursor-pointer"
              >
                Save Destination
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Listing Grid / Table (Flat, no card background) */
        <div className="space-y-4">
          <div className="text-left font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">
            Static Preloaded Destinations ({Object.keys(touristPlacesData).length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(touristPlacesData).map(([key, item]) => (
              <div
                key={key}
                className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden text-left flex flex-col justify-between hover:shadow-md transition"
              >
                <div className="h-28 bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
                  <img
                    src={item.coverImage}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-indigo-600 text-[9px] font-black text-white uppercase tracking-wider select-none">
                    Static
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
                      <Star className="h-3.5 w-3.5 fill-current" /> {item.rating}
                    </span>
                    <span className="text-slate-400">({item.reviewsCount} reviews)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-left font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
            Admin Custom Registered Destinations ({customPlaces.length})
          </div>

          {customPlaces.length === 0 ? (
            <div className="text-center py-12 px-4 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/40">
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                No custom registered places yet. Click "+ Add Destination" above to register one.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {customPlaces.map((item) => (
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
                    <button
                      onClick={() => handleDeletePlace(item.name)}
                      className="absolute top-2.5 right-2.5 h-6.5 w-6.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center shadow transition duration-200 cursor-pointer"
                      title="Delete Destination"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-amber-500 text-[9px] font-black text-white uppercase tracking-wider select-none">
                      Custom
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
                        <Star className="h-3.5 w-3.5 fill-current" /> {item.rating}
                      </span>
                      <span className="text-slate-400">({item.reviewsCount} reviews)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
