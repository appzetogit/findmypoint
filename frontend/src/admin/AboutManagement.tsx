import { useState, useEffect } from "react";
import { FileText, Save, Eye, CheckCircle } from "lucide-react";
import { loadAboutData, saveAboutData, AboutData } from "../data/aboutData";
import { API_BASE_URL } from "../config";

export default function AboutManagement() {
  const [aboutData, setAboutData] = useState<AboutData>({
    title: "",
    paragraph1: "",
    paragraph2: "",
    paragraph3: "",
  });

  const [isSavedAlert, setIsSavedAlert] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/about`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.about) {
          setAboutData(data.about);
        } else {
          setAboutData(loadAboutData());
        }
      })
      .catch((err) => {
        console.error("Error loading about settings:", err);
        setAboutData(loadAboutData());
      });
  }, []);

  const handleChangeField = (field: keyof AboutData, value: string) => {
    setAboutData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("fmp_admin_token");
    try {
      const res = await fetch(`${API_BASE_URL}/about/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(aboutData)
      });
      const data = await res.json();
      if (data.success && data.about) {
        setAboutData(data.about);
        saveAboutData(data.about); // Update local backup
        setIsSavedAlert(true);
        setTimeout(() => {
          setIsSavedAlert(false);
        }, 4000);
        // Dispatch events so other open pages update instantly
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("fmp_about_changed"));
      } else {
        alert("Failed to save about settings: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error saving about settings:", err);
      alert("Network error occurred while saving details.");
    }
  };

  return (
    <div className="space-y-6 w-full animate-fade-in-up">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              About FindmyPoint
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure and dynamically update the home page SEO content and welcome text
            </p>
          </div>
        </div>
      </div>

      {isSavedAlert && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl flex items-center gap-2.5 text-xs font-bold animate-fade-in text-left">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
          <span>Home page about details saved and updated successfully!</span>
        </div>
      )}

      {/* Two-Column Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left items-start">
        {/* Left Column: Form Editor */}
        <form
          onSubmit={handleSave}
          className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-5"
        >
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white pb-3.5 border-b border-slate-100 dark:border-slate-850">
            Edit Page Content
          </h2>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              SEO Heading Title
            </label>
            <input
              type="text"
              required
              value={aboutData.title}
              onChange={(e) => handleChangeField("title", e.target.value)}
              placeholder="Enter main SEO heading..."
              className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold"
            />
          </div>

          {/* Paragraph 1 */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Paragraph 1 (Welcome & Concept)
            </label>
            <textarea
              required
              rows={4}
              value={aboutData.paragraph1}
              onChange={(e) => handleChangeField("paragraph1", e.target.value)}
              placeholder="Enter first paragraph text..."
              className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-medium leading-relaxed"
            />
          </div>

          {/* Paragraph 2 */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Paragraph 2 (Service reach & category scope)
            </label>
            <textarea
              required
              rows={5}
              value={aboutData.paragraph2}
              onChange={(e) => handleChangeField("paragraph2", e.target.value)}
              placeholder="Enter second paragraph text..."
              className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-medium leading-relaxed"
            />
          </div>

          {/* Paragraph 3 */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Paragraph 3 (Features & CTA)
            </label>
            <textarea
              required
              rows={4}
              value={aboutData.paragraph3}
              onChange={(e) => handleChangeField("paragraph3", e.target.value)}
              placeholder="Enter third paragraph text..."
              className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-medium leading-relaxed"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition duration-200 cursor-pointer text-xs"
          >
            <Save className="h-4 w-4" />
            <span>Save Details & Publish Dynamic</span>
          </button>
        </form>

        {/* Right Column: Live Preview */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-450 px-1">
            <Eye className="h-4 w-4 text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-wider">
              Live Homepage Preview
            </span>
          </div>

          {/* Mock Homepage Card Container */}
          <div className="border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 bg-slate-50/50 dark:bg-slate-950/20 shadow-xs relative overflow-hidden">
            {/* Header Mock */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/40 dark:border-slate-850/50 mb-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Section Preview</span>
              <span className="text-[9px] bg-slate-200/60 dark:bg-slate-800 text-slate-650 dark:text-slate-400 px-2 py-0.5 rounded">
                Home.tsx (Bottom)
              </span>
            </div>

            {/* Simulated Live Section Content */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                {aboutData.title}
              </h3>

              <div className="space-y-3.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                <p>
                  {aboutData.paragraph1
                    ? aboutData.paragraph1.includes("FindmyPoint")
                      ? // Replace text markup dynamically if they write standard text
                        aboutData.paragraph1.split("FindmyPoint").map((chunk, i, arr) => (
                          <span key={i}>
                            {chunk}
                            {i < arr.length - 1 && (
                              <span className="font-extrabold text-slate-850 dark:text-white">
                                FindmyPoint
                              </span>
                            )}
                          </span>
                        ))
                      : aboutData.paragraph1
                    : ""}
                </p>
                <p>{aboutData.paragraph2}</p>
                <p>{aboutData.paragraph3}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
