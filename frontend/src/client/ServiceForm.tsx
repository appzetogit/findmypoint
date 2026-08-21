import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Type, Hash, Mail, Phone, Calendar, Clock, List, AlignLeft, ToggleLeft,
  GripVertical, Trash2, Save, ChevronDown, ChevronUp, Eye, EyeOff,
  Plus, CheckSquare, Building, ToggleRight, AlertCircle
} from "lucide-react";
import { BusinessListingData } from "../data/businessesData";

// ─── Types ───────────────────────────────────────────────────────────────────

type FieldType =
  | "text" | "email" | "phone" | "number"
  | "date" | "time" | "select" | "textarea" | "checkbox";

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
  optionsInput?: string;
  checkboxMode?: "single" | "multiple";
  selectMode?: "single" | "multiple";
}

interface ServiceFormConfig {
  businessId: string;
  fields: FormField[];
  bookNowEnabled: boolean;
  formTitle: string;
  formDescription: string;
  savedAt: string;
}

// ─── Field Palette ────────────────────────────────────────────────────────────

const FIELD_PALETTE: { type: FieldType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: "text",     label: "Short Text",  icon: <Type className="h-4 w-4" />,        color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/40" },
  { type: "textarea", label: "Long Text",   icon: <AlignLeft className="h-4 w-4" />,   color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-900/40" },
  { type: "number",   label: "Number",      icon: <Hash className="h-4 w-4" />,        color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/40" },
  { type: "email",    label: "Email",       icon: <Mail className="h-4 w-4" />,        color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/40" },
  { type: "phone",    label: "Phone",       icon: <Phone className="h-4 w-4" />,       color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900/40" },
  { type: "date",     label: "Date Picker", icon: <Calendar className="h-4 w-4" />,   color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40" },
  { type: "time",     label: "Time Picker", icon: <Clock className="h-4 w-4" />,      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40" },
  { type: "select",   label: "Dropdown",    icon: <List className="h-4 w-4" />,       color: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-900/40" },
  { type: "checkbox", label: "Checkbox",    icon: <CheckSquare className="h-4 w-4" />,color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40" },
];

// ─── Option Tag Editor ────────────────────────────────────────────────────────

function OptionTagEditor({ label, options, onChange }: { label: string; options: string[]; onChange: (opts: string[]) => void }) {
  const [inputVal, setInputVal] = React.useState("");

  const addOption = () => {
    const trimmed = inputVal.trim();
    if (!trimmed || options.includes(trimmed)) return;
    onChange([...options, trimmed]);
    setInputVal("");
  };

  const removeOption = (opt: string) => {
    onChange(options.filter((o) => o !== opt));
  };

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</label>

      {/* Existing Tags */}
      {options.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {options.map((opt) => (
            <span key={opt} className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50 text-[11px] font-bold px-2.5 py-1 rounded-lg">
              {opt}
              <button
                type="button"
                onClick={() => removeOption(opt)}
                className="text-indigo-400 hover:text-rose-500 transition cursor-pointer leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add Input + Button */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOption(); } }}
          placeholder="Type option then click +"
          className="flex-1 bg-white dark:bg-slate-900 text-xs px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 font-semibold"
        />
        <button
          type="button"
          onClick={addOption}
          className="h-9 w-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center text-lg font-bold cursor-pointer transition shrink-0"
          title="Add option"
        >
          +
        </button>
      </div>
    </div>
  );
}

// ─── Multi-Select Dropdown Component ──────────────────────────────────────────

function MultiSelectDropdown({ placeholder, options }: { placeholder: string; options: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (opt: string) => {
    setSelected((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-50 dark:bg-slate-950 text-xs px-4 py-3 outline-none flex items-center justify-between text-slate-700 dark:text-slate-350 cursor-pointer transition-all ${
          isOpen
            ? "rounded-t-xl border-t border-x border-b-0 border-slate-200 dark:border-slate-800"
            : "rounded-xl border border-slate-200 dark:border-slate-800"
        }`}
      >
        <span className="truncate">
          {selected.length === 0
            ? placeholder || "Select options..."
            : selected.join(", ")}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 bg-slate-50 dark:bg-slate-950 border-x border-b border-slate-200 dark:border-slate-800 rounded-b-xl shadow-lg max-h-60 overflow-y-auto p-2 space-y-1">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-900/50 cursor-pointer transition text-xs text-slate-700 dark:text-slate-300"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggleOption(opt)}
                className="accent-indigo-600 h-4 w-4"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────


interface ServiceFormProps {
  clientListings?: BusinessListingData[];
  business?: BusinessListingData;
  onClose?: () => void;
  readOnly?: boolean;
}

export default function ServiceForm({ clientListings = [], business, onClose, readOnly = false }: ServiceFormProps) {
  const listings = useMemo(() => {
    if (business) return [business];
    return clientListings;
  }, [business, clientListings]);

  const [selectedBizId, setSelectedBizId] = useState<string>(
    business ? business.id : (listings.length > 0 ? listings[0].id : "")
  );
  const [fields, setFields]             = useState<FormField[]>([]);
  const [bookNowEnabled, setBookNowEnabled] = useState(true);
  const [formTitle, setFormTitle]       = useState("Book Our Services");
  const [formDescription, setFormDescription] = useState("Fill in the details below to book or enquire.");
  const [savedMsg, setSavedMsg]         = useState("");
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [previewMode, setPreviewMode]   = useState(true);

  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  const selectedBiz = listings.find((b) => b.id === selectedBizId);

  // Sync selectedBizId when listings load
  useEffect(() => {
    if (business) {
      setSelectedBizId(business.id);
    } else if (listings.length > 0 && (!selectedBizId || !listings.some(b => b.id === selectedBizId))) {
      setSelectedBizId(listings[0].id);
    }
  }, [business, listings, selectedBizId]);

  // Load configuration from backend API
  useEffect(() => {
    if (!selectedBizId) return;

    const loadConfig = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/service-forms/${selectedBizId}`);
        const data = await res.json();
        if (data.success && data.data) {
          const config = data.data;
          setFields(config.fields || []);
          setBookNowEnabled(config.bookNowEnabled ?? true);
          setFormTitle(config.formTitle || "Book Our Services");
          setFormDescription(config.formDescription || "Fill in the details below to book or enquire.");
        } else {
          setFields([]);
          setBookNowEnabled(true);
          setFormTitle("Book Our Services");
          setFormDescription("Fill in the details below to book or enquire.");
        }
      } catch (err) {
        setFields([]);
        setBookNowEnabled(true);
        setFormTitle("Book Our Services");
        setFormDescription("Fill in the details below to book or enquire.");
      }
    };

    loadConfig();
  }, [selectedBizId, selectedBiz]);

  const handleSave = async () => {
    if (!selectedBizId) return;
    const token = localStorage.getItem("fmp_admin_token") || localStorage.getItem("fmp_business_token") || "";

    try {
      const res = await fetch(`http://localhost:5000/api/service-forms/${selectedBizId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          fields,
          bookNowEnabled,
          formTitle,
          formDescription
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save configuration.");
      }

      setSavedMsg("Form configuration saved successfully!");
      setTimeout(() => setSavedMsg(""), 3000);
    } catch (err: any) {
      setSavedMsg(err.message || "Error saving configuration.");
      setTimeout(() => setSavedMsg(""), 3000);
    }
  };

  const addField = (type: FieldType) => {
    const palette = FIELD_PALETTE.find((p) => p.type === type);
    const newField: FormField = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      type, label: palette?.label || type,
      placeholder: `Enter ${(palette?.label || type).toLowerCase()}...`,
      required: false,
      options: type === "select" ? ["Option 1", "Option 2"] : [],
      selectMode: type === "select" ? "single" : undefined,
      checkboxMode: type === "checkbox" ? "single" : undefined,
    };
    setFields((prev) => [...prev, newField]);
    setExpandedId(newField.id);
  };

  const deleteField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const updateField = (id: string, patch: Partial<FormField>) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const handleDragStart = (index: number) => { dragIndex.current = index; };
  const handleDragOver  = (e: React.DragEvent, index: number) => { e.preventDefault(); dragOverIndex.current = index; };
  const handleDrop      = () => {
    if (dragIndex.current === null || dragOverIndex.current === null) return;
    const reordered = [...fields];
    const [moved] = reordered.splice(dragIndex.current, 1);
    reordered.splice(dragOverIndex.current, 0, moved);
    setFields(reordered);
    dragIndex.current = null;
    dragOverIndex.current = null;
  };

  const paletteColor = (type: FieldType) => FIELD_PALETTE.find((p) => p.type === type)?.color || "";
  const paletteIcon  = (type: FieldType) => FIELD_PALETTE.find((p) => p.type === type)?.icon || <Type className="h-4 w-4" />;

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400 space-y-3">
        <Building className="h-12 w-12 text-slate-400" />
        <p className="text-sm font-semibold">No businesses found.</p>
      </div>
    );
  }

  if (selectedBiz?.isBookingDisabled) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
        <AlertCircle className="h-12 w-12 text-slate-400 mb-3 opacity-40" />
        <p className="text-sm font-semibold">Service Form configuration has been disabled for this business.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up text-left max-w-6xl mx-auto">
      {!readOnly && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Service Form Builder</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Design a custom booking form. Drag fields to reorder.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setPreviewMode(!previewMode)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${previewMode ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800"}`}>
              {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{previewMode ? "Exit Preview" : "Preview Form"}</span>
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-[0.98] transition cursor-pointer">
              <Save className="h-4 w-4" /><span>Save Form</span>
            </button>
          </div>
        </div>
      )}

      {savedMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl text-xs font-bold text-center">{savedMsg}</div>
      )}

      {!readOnly && !business && listings.length > 1 && (
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">Configuring For:</label>
          <select value={selectedBizId} onChange={(e) => setSelectedBizId(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 cursor-pointer">
            {listings.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
          </select>
        </div>
      )}

      {!readOnly && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Form Title</label>
              <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 font-semibold" placeholder="Book Our Services" />
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Form Subtitle / Description</label>
              <input type="text" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 font-semibold" placeholder="Fill in the details below..." />
            </div>
          </div>
        </div>
      )}

      {previewMode ? (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            {selectedBiz && (
              <div className="flex items-center gap-3 mb-4">
                <img src={selectedBiz.images?.[0] || ""} alt={selectedBiz.name} className="h-10 w-10 rounded-xl object-cover bg-slate-100" />
                <div>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide">{selectedBiz.category}</p>
                  <p className="text-xs font-black text-slate-800 dark:text-white">{selectedBiz.name}</p>
                </div>
              </div>
            )}
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{formTitle}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formDescription}</p>
          </div>
          {fields.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">No fields added yet. Exit preview and add fields.</p>
          ) : (
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea rows={3} placeholder={field.placeholder} className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none resize-none" />
                  ) : field.type === "select" ? (
                    (field.selectMode === "multiple" && field.options.length > 0) ? (
                      <MultiSelectDropdown
                        placeholder={field.placeholder || "Select options..."}
                        options={field.options}
                      />
                    ) : (
                      <select className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none">
                        <option value="">Select...</option>
                        {field.options.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    )
                  ) : field.type === "checkbox" ? (
                    field.checkboxMode === "multiple" && field.options.length > 0 ? (
                      <div className="space-y-2">
                        {field.options.map((opt) => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="accent-indigo-600 h-4 w-4" />
                            <span className="text-xs text-slate-700 dark:text-slate-300">{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="accent-indigo-600 h-4 w-4" />
                        <span className="text-xs text-slate-700 dark:text-slate-300">{field.placeholder || field.label}</span>
                      </label>
                    )
                  ) : (
                    <input type={field.type === "phone" ? "tel" : field.type} placeholder={field.placeholder} className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">Field Types</p>
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 space-y-2 shadow-sm">
              {FIELD_PALETTE.map((item) => (
                <button key={item.type} onClick={() => addField(item.type)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs font-bold transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${item.color}`}>
                  {item.icon}<span>{item.label}</span><Plus className="h-3.5 w-3.5 ml-auto opacity-60" />
                </button>
              ))}
            </div>

          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">Form Canvas — drag fields to reorder</p>
            {fields.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center text-slate-400 dark:text-slate-600">
                <AlignLeft className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-semibold">Click a field type on the left to add fields</p>
                <p className="text-xs mt-1">to build your custom booking form.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => {
                  const isExpanded = expandedId === field.id;
                  return (
                    <div key={field.id} draggable onDragStart={() => handleDragStart(index)} onDragOver={(e) => handleDragOver(e, index)} onDrop={handleDrop} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm overflow-hidden transition-all">
                      <div className="flex items-center gap-3 px-4 py-3">
                        <GripVertical className="h-4 w-4 text-slate-400 cursor-grab shrink-0" />
                        <span className={`flex items-center justify-center h-7 w-7 rounded-lg border text-[11px] shrink-0 ${paletteColor(field.type)}`}>{paletteIcon(field.type)}</span>
                        <div className="flex-1 min-w-0">
                          <input type="text" value={field.label} onChange={(e) => updateField(field.id, { label: e.target.value })} className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-white outline-none border-b border-transparent focus:border-indigo-400 transition pb-0.5" />
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">{field.type} field{field.required ? " • Required" : " • Optional"}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => setExpandedId(isExpanded ? null : field.id)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition cursor-pointer">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                          <button onClick={() => deleteField(field.id)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 transition cursor-pointer">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="border-t border-slate-100 dark:border-slate-850 px-4 pt-3 pb-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/30">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Placeholder Text</label>
                              <input type="text" value={field.placeholder} onChange={(e) => updateField(field.id, { placeholder: e.target.value })} className="w-full bg-white dark:bg-slate-900 text-xs px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 font-semibold" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Required?</label>
                              <button type="button" onClick={() => updateField(field.id, { required: !field.required })} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-bold w-full cursor-pointer transition ${field.required ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"}`}>
                                {field.required ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                {field.required ? "Required" : "Optional"}
                              </button>
                            </div>
                          </div>
                          {field.type === "select" && (
                            <div className="space-y-3">
                              {/* Single / Multiple Toggle */}
                              <div className="space-y-1.5">
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Selection Mode</label>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => updateField(field.id, { selectMode: "single" })}
                                    className={`flex-1 py-2 rounded-lg border text-xs font-bold cursor-pointer transition ${
                                      (!field.selectMode || field.selectMode === "single")
                                        ? "bg-indigo-600 text-white border-indigo-600"
                                        : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
                                    }`}
                                  >
                                    ◉ Single Select
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateField(field.id, { selectMode: "multiple" })}
                                    className={`flex-1 py-2 rounded-lg border text-xs font-bold cursor-pointer transition ${
                                      field.selectMode === "multiple"
                                        ? "bg-indigo-600 text-white border-indigo-600"
                                        : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
                                    }`}
                                  >
                                    ◎ Multi Select
                                  </button>
                                </div>
                              </div>
                              <OptionTagEditor
                                label="Dropdown Options"
                                options={field.options}
                                onChange={(opts) => updateField(field.id, { options: opts, optionsInput: opts.join(", ") })}
                              />
                            </div>
                          )}
                          {field.type === "checkbox" && (
                            <div className="space-y-3">
                              {/* Single / Multiple Toggle */}
                              <div className="space-y-1.5">
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Checkbox Mode</label>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => updateField(field.id, { checkboxMode: "single" })}
                                    className={`flex-1 py-2 rounded-lg border text-xs font-bold cursor-pointer transition ${
                                      (!field.checkboxMode || field.checkboxMode === "single")
                                        ? "bg-indigo-600 text-white border-indigo-600"
                                        : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
                                    }`}
                                  >
                                    ☐ Single
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateField(field.id, { checkboxMode: "multiple" })}
                                    className={`flex-1 py-2 rounded-lg border text-xs font-bold cursor-pointer transition ${
                                      field.checkboxMode === "multiple"
                                        ? "bg-indigo-600 text-white border-indigo-600"
                                        : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
                                    }`}
                                  >
                                    ☑ Multiple
                                  </button>
                                </div>
                              </div>

                              {/* Single mode — plain label input */}
                              {(!field.checkboxMode || field.checkboxMode === "single") && (
                                <div className="space-y-1.5">
                                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Checkbox Label</label>
                                  <input
                                    type="text"
                                    value={field.placeholder}
                                    onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                    placeholder="I agree to the terms and conditions"
                                    className="w-full bg-white dark:bg-slate-900 text-xs px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 font-semibold"
                                  />
                                </div>
                              )}

                              {/* Multiple mode — chip tag adder */}
                              {field.checkboxMode === "multiple" && (
                                <OptionTagEditor
                                  label="Checkbox Options (each becomes a checkbox)"
                                  options={field.options}
                                  onChange={(opts) => updateField(field.id, { options: opts, placeholder: opts[0] || "" })}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {fields.length > 0 && (
              <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md active:scale-[0.99] transition duration-200 cursor-pointer text-sm mt-2">
                <Save className="h-4.5 w-4.5" />Save Form Configuration
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
