import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Scale,
  Save,
  Eye,
  CheckCircle,
  ShieldAlert,
  AlertTriangle,
  ScrollText,
  Plus,
  Trash2,
  Edit2,
  X,
  Shield,
} from "lucide-react";

interface PolicySection {
  id: string;
  icon: "scale" | "alert" | "file" | "shield";
  title: string;
  content: string;
}

export default function TermsConditionsManagement() {
  const [lastUpdated, setLastUpdated] = useState("July 2026");
  const [sections, setSections] = useState<PolicySection[]>([
    {
      id: "1",
      icon: "scale",
      title: "1. Usage Responsibility & Rules",
      content:
        "Users agree to submit accurate, non-fraudulent information when registering local businesses, searching categories, or creating lists. Submitting spam bookings or utilizing automated scripts to crawl data will result in profile limitations.",
    },
    {
      id: "2",
      icon: "alert",
      title: "2. Merchant Liability",
      content:
        "FindmyPoint acts as an intermediate directory search hub. Any quality issues with services rendered by local plumbing, salon, or medical clinics are directly the concern of the respective service provider.",
    },
    {
      id: "3",
      icon: "file",
      title: "3. Content Policy",
      content:
        "All submitted reviews and comments undergo standard checks. Reviews containing inappropriate content, explicit details, or promotional URLs will be flagged and deleted by admin operations.",
    },
  ]);

  const [isSavedAlert, setIsSavedAlert] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState<PolicySection | null>(null);

  // Form states for add/edit modal
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [modalIcon, setModalIcon] = useState<"scale" | "alert" | "file" | "shield">("scale");

  const handleOpenAddModal = () => {
    setEditingSection(null);
    setModalTitle("");
    setModalContent("");
    setModalIcon("scale");
    setShowModal(true);
  };

  const handleOpenEditModal = (section: PolicySection) => {
    setEditingSection(section);
    setModalTitle(section.title);
    setModalContent(section.content);
    setModalIcon(section.icon);
    setShowModal(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSection) {
      // Edit
      setSections((prev) =>
        prev.map((s) =>
          s.id === editingSection.id
            ? { ...s, title: modalTitle, content: modalContent, icon: modalIcon }
            : s,
        ),
      );
    } else {
      // Add
      const newSection: PolicySection = {
        id: Date.now().toString(),
        icon: modalIcon,
        title: modalTitle,
        content: modalContent,
      };
      setSections((prev) => [...prev, newSection]);
    }
    setShowModal(false);
  };

  const handleDeleteSection = (id: string) => {
    if (confirm("Are you sure you want to delete this section?")) {
      setSections((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 4000);
  };

  // Helper to render icons in live preview
  const getIconComponent = (icon: string) => {
    switch (icon) {
      case "scale":
        return <ScrollText className="h-3.5 w-3.5 text-indigo-500" />;
      case "alert":
        return <AlertTriangle className="h-3.5 w-3.5 text-indigo-500" />;
      case "file":
        return <ShieldAlert className="h-3.5 w-3.5 text-indigo-500" />;
      case "shield":
        return <Shield className="h-3.5 w-3.5 text-indigo-500" />;
      default:
        return <Scale className="h-3.5 w-3.5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6 w-full animate-fade-in-up text-left relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              Terms & Conditions Editor
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure terms of use, content moderation parameters, and liability rules
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Section</span>
        </button>
      </div>

      {isSavedAlert && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl flex items-center gap-2.5 text-xs font-bold animate-fade-in">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
          <span>Terms & Conditions configuration saved successfully! (Ready to integrate)</span>
        </div>
      )}

      {/* Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Form & Sections List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-850">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Manage Sections
            </h2>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Revised:
              </label>
              <input
                type="text"
                value={lastUpdated}
                onChange={(e) => setLastUpdated(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 text-xs px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 font-semibold w-24 text-center"
              />
            </div>
          </div>

          {/* Section Items Listing */}
          <div className="space-y-3.5">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850/60"
              >
                <div className="space-y-1 text-left flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-50 dark:bg-indigo-950/30 p-1.5 rounded-lg shrink-0">
                      {getIconComponent(section.icon)}
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {section.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2 pl-9">
                    {section.content}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                  <button
                    onClick={() => handleOpenEditModal(section)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg cursor-pointer"
                    title="Edit Section"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg cursor-pointer"
                    title="Delete Section"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {sections.length === 0 && (
              <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400 italic font-semibold">
                  No sections added yet. Click "+ Add Section" to add.
                </span>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveAll}
            disabled={sections.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-455 dark:disabled:text-slate-655 font-bold py-3 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition duration-200 cursor-pointer text-xs"
          >
            <Save className="h-4 w-4" />
            <span>Save Terms Configuration</span>
          </button>
        </div>

        {/* Right Column: Preview */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-450 px-1">
            <Eye className="h-4 w-4 text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-wider">
              Terms Page Live Preview
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden">
            {/* Page Header Mock */}
            <div className="border-b border-slate-100 dark:border-slate-855 pb-4 mb-5">
              <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Terms & Conditions
              </h2>
              <p className="text-[10px] text-slate-400 mt-1">Last Updated: {lastUpdated}</p>
            </div>

            {/* Read pane */}
            <div className="space-y-5 text-slate-600 dark:text-slate-400 text-xs font-semibold leading-relaxed">
              {sections.map((section, idx) => (
                <div
                  key={section.id}
                  className={`space-y-1.5 ${idx > 0 ? "pt-3 border-t border-slate-100 dark:border-slate-855" : ""}`}
                >
                  <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                    {getIconComponent(section.icon)}
                    {section.title}
                  </h4>
                  <p className="text-[11px] leading-normal">{section.content}</p>
                </div>
              ))}

              {sections.length === 0 && (
                <div className="text-center py-6 text-slate-400 italic">Preview is empty.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay rendered via Portal to Document.Body */}
      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop Blur overlay */}
            <div
              className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity duration-300"
              onClick={() => setShowModal(false)}
            />

            {/* Modal Card content */}
            <form
              onSubmit={handleSaveModal}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4 animate-scale-up text-left"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-850">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {editingSection ? "Edit Section Details" : "Create New Section"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>

              {/* Section Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Section Heading / Title
                </label>
                <input
                  type="text"
                  required
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder="e.g. 1. Terms of Service"
                  className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold"
                />
              </div>

              {/* Icon Picker */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Select Section Icon
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    {
                      value: "scale",
                      icon: <ScrollText className="h-4 w-4 text-indigo-500" />,
                      label: "Legal",
                    },
                    {
                      value: "alert",
                      icon: <AlertTriangle className="h-4 w-4 text-indigo-500" />,
                      label: "Warning",
                    },
                    {
                      value: "file",
                      icon: <ShieldAlert className="h-4 w-4 text-indigo-500" />,
                      label: "Alert",
                    },
                    {
                      value: "shield",
                      icon: <Shield className="h-4 w-4 text-indigo-500" />,
                      label: "Security",
                    },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setModalIcon(item.value as any)}
                      className={`flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl border cursor-pointer transition ${
                        modalIcon === item.value
                          ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20"
                          : "border-slate-200/60 dark:border-slate-800/60 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      {item.icon}
                      <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Content */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Section Paragraph Text
                </label>
                <textarea
                  required
                  rows={5}
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                  placeholder="Enter details and descriptions for this terms section..."
                  className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-medium leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-250 text-slate-700 font-bold py-2.5 rounded-xl transition cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition cursor-pointer text-xs"
                >
                  {editingSection ? "Save Changes" : "Create Section"}
                </button>
              </div>
            </form>
          </div>,
          document.body,
        )}
    </div>
  );
}
