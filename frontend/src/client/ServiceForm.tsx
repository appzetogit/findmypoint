import React, { useState, useEffect, useRef } from "react";
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

// ─── Field Factory ─────────────────────────────────────────────────────────────

function f(type: FieldType, label: string, placeholder: string, required = true, options: string[] = []): FormField {
  return { id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, type, label, placeholder, required, options };
}

// ─── Comprehensive Template Map ────────────────────────────────────────────────
// Keys: exact subcategory names from subcategoriesData (CategoryDetail.tsx)
// Fallback: parent category name patterns

const SUBCATEGORY_TEMPLATES: Record<string, FormField[]> = {

  // ═══ SPA POINT ══════════════════════════════════════════════════════════════
  "Ayurvedic Spa": [
    f("text",   "Full Name",             "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Treatment Required",    "", true, ["Abhyanga Massage", "Shirodhara", "Panchakarma", "Herbal Steam Bath", "Nasya", "Other"]),
    f("date",   "Appointment Date",      ""),
    f("time",   "Preferred Time",        ""),
    f("number", "Session Duration (min)","e.g. 60", false),
    f("textarea","Health Conditions / Notes","Any existing health concerns or preferences...", false),
  ],
  "Massage Center": [
    f("text",   "Client Name",           "Your full name"),
    f("phone",  "Phone Number",          "Mobile number"),
    f("select", "Massage Type",          "", true, ["Swedish Massage", "Deep Tissue", "Sports Massage", "Hot Stone", "Couple Massage", "Full Body"]),
    f("date",   "Appointment Date",      ""),
    f("time",   "Preferred Time Slot",   ""),
    f("select", "Session Duration",      "", true, ["30 min", "60 min", "90 min", "120 min"]),
    f("select", "Therapist Preference",  "", false, ["Male", "Female", "No Preference"]),
  ],
  "Beauty Spa": [
    f("text",   "Client Name",           "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Service Required",      "", true, ["Facial", "Body Wrap", "Scrub", "Waxing", "Manicure", "Pedicure", "Full Package"]),
    f("date",   "Appointment Date",      ""),
    f("time",   "Preferred Time",        ""),
    f("textarea","Special Requests",     "Skin type, allergies, preferences...", false),
  ],
  "Thai Massage": [
    f("text",   "Client Name",           "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Service Type",          "", true, ["Traditional Thai", "Thai Foot Massage", "Thai Herbal Compress", "Oil + Thai Combo"]),
    f("date",   "Appointment Date",      ""),
    f("time",   "Preferred Time",        ""),
    f("select", "Session Duration",      "", true, ["60 min", "90 min", "120 min"]),
  ],
  "Luxury Spa": [
    f("text",   "Guest Name",            "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email Address",         "your@email.com"),
    f("select", "Package",               "", true, ["Signature Ritual", "Couples Retreat", "Royal Detox", "Anti-Aging Facial", "Custom Package"]),
    f("date",   "Appointment Date",      ""),
    f("time",   "Preferred Time",        ""),
    f("number", "Number of Guests",      "1", false),
    f("textarea","Special Preferences",  "Aromatherapy preference, allergies, occasion...", false),
  ],
  "Unisex Salon": [
    f("text",   "Client Name",           "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Service Required",      "", true, ["Haircut", "Hair Colour", "Smoothening", "Keratin", "Facial", "Waxing", "Manicure", "Pedicure", "Bridal Makeup"]),
    f("date",   "Appointment Date",      ""),
    f("time",   "Preferred Time",        ""),
    f("textarea","Additional Notes",     "Hair type, skin type, specific preferences...", false),
  ],
  "Beauty Parlours": [
    f("text",   "Client Name",           "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Service Type",          "", true, ["Facial", "Bleach", "Threading", "Waxing", "Makeup", "Hair Spa", "Mehendi"]),
    f("date",   "Appointment Date",      ""),
    f("time",   "Preferred Time",        ""),
  ],
  "Spa & Massages": [
    f("text",   "Client Name",           "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Service",               "", true, ["Body Massage", "Head Massage", "Foot Massage", "Spa Package", "Steam Bath"]),
    f("date",   "Appointment Date",      ""),
    f("time",   "Preferred Time",        ""),
    f("select", "Duration",              "", true, ["30 min", "60 min", "90 min"]),
  ],
  "Salons": [
    f("text",   "Client Name",           "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Service Required",      "", true, ["Haircut", "Shave", "Colour", "Facial", "Beard Trim", "Hair Spa"]),
    f("date",   "Appointment Date",      ""),
    f("time",   "Preferred Time",        ""),
  ],

  // ═══ TOUR POINT ═════════════════════════════════════════════════════════════
  "India": [
    f("text",   "Lead Traveller Name",   "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email Address",         "your@email.com"),
    f("select", "Destination",           "", true, ["Goa", "Kerala", "Rajasthan", "Himachal Pradesh", "Uttarakhand", "Tamil Nadu", "Andaman", "Kashmir", "Other"]),
    f("date",   "Departure Date",        ""),
    f("date",   "Return Date",           ""),
    f("number", "Number of Travellers",  "e.g. 2"),
    f("select", "Package Type",          "", true, ["Budget", "Standard", "Premium", "Luxury"]),
    f("select", "Hotel Preference",      "", false, ["Budget Hotel", "3-Star", "4-Star", "5-Star", "Homestay"]),
    f("textarea","Special Requirements", "Dietary needs, accessibility, occasions...", false),
  ],
  "Dubai": [
    f("text",   "Lead Traveller Name",   "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email Address",         "your@email.com"),
    f("date",   "Departure Date",        ""),
    f("date",   "Return Date",           ""),
    f("number", "Number of Travellers",  "e.g. 2"),
    f("select", "Package Type",          "", true, ["Budget", "Standard", "Premium", "Luxury"]),
    f("checkbox","Visa Assistance Required","I need visa processing assistance", false),
    f("textarea","Special Requests",     "Activities, dietary, accommodation preferences...", false),
  ],
  "Maldives": [
    f("text",   "Lead Traveller Name",   "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email",                 "your@email.com"),
    f("date",   "Departure Date",        ""),
    f("number", "Duration (nights)",     "e.g. 5"),
    f("number", "Number of Travellers",  "e.g. 2"),
    f("select", "Resort Type",           "", true, ["Overwater Villa", "Beach Villa", "Budget Resort", "Premium Resort"]),
    f("checkbox","Honeymoon Package",    "This is a honeymoon trip", false),
    f("textarea","Special Requests",     "Activities, dietary, special celebrations...", false),
  ],

  // ═══ JOB POINT ══════════════════════════════════════════════════════════════
  "Accounting": [
    f("text",   "Applicant Name",        "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email Address",         "your@email.com"),
    f("select", "Experience Level",      "", true, ["Fresher", "1-2 Years", "3-5 Years", "5-10 Years", "10+ Years"]),
    f("select", "Qualification",         "", true, ["B.Com", "M.Com", "CA", "CPA", "MBA Finance", "Other"]),
    f("text",   "Resume / LinkedIn Link","Paste your Drive/LinkedIn link"),
    f("textarea","Skills & Summary",     "Tally, GST, Excel, audit experience...", false),
  ],
  "IT": [
    f("text",   "Applicant Name",        "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email Address",         "your@email.com"),
    f("select", "Role Applied For",      "", true, ["Frontend Developer", "Backend Developer", "Full Stack", "Data Analyst", "DevOps", "QA Engineer", "Other"]),
    f("select", "Experience Level",      "", true, ["Fresher", "1-2 Years", "3-5 Years", "5+ Years"]),
    f("text",   "Tech Stack / Skills",   "React, Node.js, Python, etc."),
    f("text",   "GitHub / Portfolio",    "Paste your link here"),
    f("textarea","Brief About You",      "Short bio or cover note...", false),
  ],
  "Marketing": [
    f("text",   "Applicant Name",        "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email Address",         "your@email.com"),
    f("select", "Role",                  "", true, ["Digital Marketing", "Sales Executive", "Brand Manager", "SEO Specialist", "Content Writer", "Social Media Manager"]),
    f("select", "Experience",            "", true, ["Fresher", "1-2 Years", "3-5 Years", "5+ Years"]),
    f("text",   "Resume / Portfolio Link","Paste your link here"),
  ],
  "Health Care": [
    f("text",   "Applicant Name",        "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email Address",         "your@email.com"),
    f("select", "Role Applied For",      "", true, ["Doctor", "Nurse", "Pharmacist", "Lab Technician", "Radiologist", "Admin Staff"]),
    f("select", "Qualification",         "", true, ["MBBS", "BDS", "B.Pharm", "GNM", "B.Sc Nursing", "Other"]),
    f("select", "Experience",            "", true, ["Fresher", "1-3 Years", "3-5 Years", "5+ Years"]),
    f("text",   "Resume Link",           "Paste your Drive/LinkedIn link"),
  ],
  "Government": [
    f("text",   "Applicant Name",        "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email Address",         "your@email.com"),
    f("select", "Exam / Post",           "", true, ["SSC", "UPSC", "State PSC", "Railway", "Banking", "Defence", "Police", "Teacher"]),
    f("select", "Qualification",         "", true, ["10th", "12th", "Graduation", "Post Graduation"]),
    f("textarea","Brief Note",           "Additional details or preparation status...", false),
  ],
  "Security": [
    f("text",   "Applicant Name",        "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Role",                  "", true, ["Security Guard", "Supervisor", "CCTV Operator", "Armed Security"]),
    f("select", "Experience",            "", true, ["Fresher", "1-2 Years", "3-5 Years", "5+ Years"]),
    f("checkbox","Ex-Serviceman",        "I am an ex-army/police/paramilitary person", false),
    f("text",   "Location Preference",   "Preferred work city/area"),
  ],
  "Teacher": [
    f("text",   "Applicant Name",        "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email Address",         "your@email.com"),
    f("select", "Subject Expertise",     "", true, ["Maths", "Science", "English", "Hindi", "Social Studies", "Computers", "Commerce", "Arts", "Other"]),
    f("select", "Level Taught",          "", true, ["Primary (1-5)", "Middle (6-8)", "High School (9-10)", "Senior Secondary (11-12)", "College Level"]),
    f("select", "Experience",            "", true, ["Fresher", "1-2 Years", "3-5 Years", "5+ Years"]),
    f("text",   "Qualification",         "B.Ed, M.Ed, B.Sc, etc."),
  ],
  "Delivery": [
    f("text",   "Applicant Name",        "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Vehicle Type",          "", true, ["Bicycle", "Two-Wheeler", "Three-Wheeler", "Four-Wheeler"]),
    f("checkbox","Own Vehicle",          "I have my own vehicle", false),
    f("select", "Availability",          "", true, ["Full Time", "Part Time", "Weekends Only"]),
    f("text",   "Area Preference",       "Preferred delivery zone or city"),
  ],

  // ═══ SERVICE POINT ══════════════════════════════════════════════════════════
  "AC Repair": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Service Address",       "Full address for service visit"),
    f("select", "AC Brand",              "", true, ["Voltas", "Daikin", "LG", "Samsung", "Carrier", "Hitachi", "Blue Star", "Other"]),
    f("select", "AC Type",               "", true, ["Split AC", "Window AC", "Cassette AC", "Tower AC"]),
    f("select", "Problem",               "", true, ["Not Cooling", "Water Leakage", "Gas Refill", "No Power", "Noise", "Annual Servicing"]),
    f("date",   "Preferred Visit Date",  ""),
    f("time",   "Preferred Time Slot",   ""),
  ],
  "AC Service": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Service Address",       "Full address for service visit"),
    f("select", "Service Type",          "", true, ["Regular Servicing", "Deep Cleaning", "Gas Top Up", "Full Maintenance"]),
    f("number", "Number of AC Units",    "How many units to service?"),
    f("date",   "Preferred Date",        ""),
    f("time",   "Preferred Time",        ""),
  ],
  "Plumber Repair": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Service Address",       "Full address"),
    f("select", "Problem Type",          "", true, ["Pipe Leakage", "Tap Repair", "Flush Tank", "Geyser Issue", "Drainage Block", "New Installation"]),
    f("date",   "Preferred Date",        ""),
    f("time",   "Preferred Time",        ""),
    f("textarea","Additional Details",   "Describe the issue briefly...", false),
  ],
  "Carpenter": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Service Address",       "Full address"),
    f("select", "Work Type",             "", true, ["Furniture Repair", "New Furniture", "Door/Window Fix", "Modular Kitchen", "Wardrobe", "Other"]),
    f("date",   "Preferred Date",        ""),
    f("textarea","Work Description",     "Describe the carpentry work needed...", false),
  ],
  "Electricians": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Service Address",       "Full address"),
    f("select", "Problem Type",          "", true, ["Wiring Issue", "Fan/Light Fix", "Switchboard", "MCB/Fuse", "Short Circuit", "New Installation"]),
    f("date",   "Preferred Date",        ""),
    f("time",   "Preferred Time",        ""),
    f("textarea","Details",              "Describe the electrical issue...", false),
  ],
  "Mobile & Computer Repair": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Device Type",           "", true, ["Smartphone", "Tablet", "Laptop", "Desktop", "Printer", "Other"]),
    f("text",   "Device Brand & Model",  "e.g. Samsung Galaxy S21"),
    f("select", "Issue",                 "", true, ["Screen Broken", "Battery", "Charging Port", "Water Damage", "Software Issue", "Camera", "Other"]),
    f("textarea","Problem Description",  "Describe the issue in detail...", false),
  ],
  "Home interior & Decoration": [
    f("text",   "Client Name",           "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email Address",         "your@email.com", false),
    f("select", "Interior Type",         "", true, ["Full Home Interior", "Living Room", "Bedroom", "Kitchen", "Office Interior", "Commercial Space"]),
    f("number", "Carpet Area (sq ft)",   "Approximate area in sq ft"),
    f("select", "Budget Range",          "", true, ["Under ₹1L", "₹1L-₹3L", "₹3L-₹5L", "₹5L-₹10L", "Above ₹10L"]),
    f("date",   "Expected Start Date",   "", false),
    f("textarea","Design Preferences",   "Style, colours, specific requirements...", false),
  ],
  "Cook": [
    f("text",   "Client Name",           "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Service Address",       "Full home address"),
    f("select", "Cook Required For",     "", true, ["Daily Meals", "Party / Event", "Tiffin Service", "Weekly Basis"]),
    f("select", "Cuisine Type",          "", true, ["North Indian", "South Indian", "Chinese", "Continental", "Jain", "All Types"]),
    f("number", "Number of People",      "How many members?"),
    f("date",   "Start Date",            ""),
    f("textarea","Dietary Requirements", "Veg/Non-veg, allergies, special diet...", false),
  ],
  "Driver": [
    f("text",   "Client Name",           "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Pickup Location",       "Full pickup address"),
    f("select", "Service Type",          "", true, ["Daily Driver", "Outstation Trip", "Airport Drop/Pickup", "One-Time Hire"]),
    f("date",   "Start Date",            ""),
    f("select", "Vehicle Type",          "", true, ["Hatchback", "Sedan", "SUV", "Luxury Car", "Any"]),
    f("textarea","Additional Notes",     "Trip details, timing preferences...", false),
  ],
  "Builder": [
    f("text",   "Client Name",           "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email Address",         "your@email.com", false),
    f("select", "Construction Type",     "", true, ["New Home Construction", "Commercial Building", "Renovation", "Extension / Addition", "Plot Development"]),
    f("number", "Plot Area (sq ft)",     "Approximate plot size"),
    f("select", "Budget Range",          "", true, ["Under ₹10L", "₹10L-₹25L", "₹25L-₹50L", "₹50L-₹1Cr", "Above ₹1Cr"]),
    f("text",   "Plot Location",         "City/area of construction"),
    f("textarea","Project Details",      "Floors, rooms, specific requirements...", false),
  ],
  "Washing Machine Repair": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Service Address",       "Full address"),
    f("select", "Machine Type",          "", true, ["Front Load", "Top Load", "Semi-Automatic"]),
    f("text",   "Brand",                 "e.g. LG, Samsung, Whirlpool"),
    f("select", "Problem",               "", true, ["Not Starting", "Not Spinning", "Water Leakage", "Noise", "Door Lock Issue", "Other"]),
    f("date",   "Preferred Visit Date",  ""),
  ],
  "Refrigerator Repair": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Service Address",       "Full address"),
    f("text",   "Brand",                 "e.g. Whirlpool, LG, Samsung"),
    f("select", "Problem",               "", true, ["Not Cooling", "Ice Maker Issue", "Water Leakage", "Noise", "Door Seal", "Other"]),
    f("date",   "Preferred Visit Date",  ""),
  ],
  "TV Repair": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Service Address",       "Full address"),
    f("select", "TV Type",               "", true, ["LED", "OLED", "LCD", "Smart TV", "CRT"]),
    f("text",   "Brand & Model",         "e.g. Sony Bravia 43 inch"),
    f("select", "Problem",               "", true, ["No Display", "No Sound", "Flickering", "No Power", "HDMI Issue", "Remote Issue"]),
    f("date",   "Preferred Date",        ""),
  ],
  "Dry Cleaners": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Pickup Address",        "Full address for pickup"),
    f("select", "Items Type",            "", true, ["Suits", "Sarees", "Blankets", "Curtains", "Leather Jackets", "Bridal Wear", "Mixed Items"]),
    f("number", "Approximate Pieces",    "Number of garments"),
    f("select", "Service Type",          "", true, ["Regular Dry Clean", "Express (Same Day)", "Stain Removal", "Ironing Only"]),
    f("date",   "Pickup Date",           ""),
  ],
  "House Cleaner": [
    f("text",   "Client Name",           "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Service Address",       "Full home address"),
    f("select", "Cleaning Type",         "", true, ["Regular Cleaning", "Deep Cleaning", "Move-in/Move-out", "Post-Construction", "Office Cleaning"]),
    f("number", "Home Size (sq ft)",     "Approximate area"),
    f("date",   "Preferred Date",        ""),
    f("time",   "Preferred Time",        ""),
    f("textarea","Special Instructions", "Areas to focus, materials to avoid...", false),
  ],
  "Car Service": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Car Brand & Model",     "e.g. Maruti Swift VXI"),
    f("text",   "Registration Number",   "Car registration plate"),
    f("select", "Service Type",          "", true, ["General Servicing", "Oil Change", "Wheel Alignment", "Brake Service", "Full Inspection", "Denting & Painting"]),
    f("date",   "Preferred Date",        ""),
    f("time",   "Preferred Time",        ""),
    f("checkbox","Pickup & Drop Required","I need pickup and drop facility", false),
  ],
  "Bike Service": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Bike Brand & Model",    "e.g. Honda Activa 6G"),
    f("text",   "Registration Number",   "Bike plate number"),
    f("select", "Service Type",          "", true, ["General Service", "Oil Change", "Chain Lubrication", "Brake Adjustment", "Full Checkup"]),
    f("date",   "Preferred Date",        ""),
    f("time",   "Preferred Time",        ""),
  ],
  "CCTV Repair & Installation": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Installation Address",  "Full address"),
    f("select", "Service Type",          "", true, ["New Installation", "Repair", "Camera Replacement", "DVR/NVR Setup", "Maintenance"]),
    f("number", "Number of Cameras",     "How many cameras?"),
    f("select", "Camera Type",           "", false, ["Dome Camera", "Bullet Camera", "PTZ Camera", "IP Camera", "Any"]),
    f("date",   "Preferred Date",        ""),
    f("textarea","Additional Details",   "Location type (home/shop/office), any preferences...", false),
  ],

  // ═══ EDUCATION POINT ════════════════════════════════════════════════════════
  "Coaching Center": [
    f("text",   "Student Name",          "Full name"),
    f("phone",  "Parent Contact",        "Mobile number"),
    f("select", "Class / Grade",         "", true, ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11 PCM", "Class 11 PCB", "Class 12", "Graduation"]),
    f("select", "Subjects Required",     "", true, ["Maths", "Science", "English", "All Subjects", "Physics", "Chemistry", "Biology"]),
    f("select", "Batch Preference",      "", false, ["Morning", "Afternoon", "Evening", "Weekend"]),
    f("date",   "Admission Date",        "", false),
    f("textarea","Special Requirements", "Learning goals, weak subjects, exam targets...", false),
  ],
  "School": [
    f("text",   "Student Name",          "Full name of student"),
    f("text",   "Parent/Guardian Name",  "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email Address",         "your@email.com", false),
    f("select", "Admission For Class",   "", true, ["Nursery", "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6-10", "Class 11-12"]),
    f("select", "Stream (if 11-12)",     "", false, ["Science PCM", "Science PCB", "Commerce", "Arts", "N/A"]),
    f("date",   "Date of Birth",         ""),
    f("textarea","Additional Notes",     "Previous school, transfer certificate status...", false),
  ],
  "College": [
    f("text",   "Applicant Name",        "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email Address",         "your@email.com"),
    f("select", "Program Applied",       "", true, ["B.A.", "B.Sc.", "B.Com", "BBA", "B.Tech", "M.A.", "M.Sc.", "M.Com", "MBA", "Other"]),
    f("select", "Stream / Specialization","", true, ["Arts", "Science", "Commerce", "Engineering", "Management", "Other"]),
    f("number", "12th Percentage",       "e.g. 85"),
    f("textarea","Why This College",     "Statement of purpose or additional notes...", false),
  ],
  "Computer Center": [
    f("text",   "Student Name",          "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Course Interested In",  "", true, ["MS Office", "Tally", "DTP", "Web Design", "Programming", "Graphic Design", "Video Editing", "Data Entry", "Other"]),
    f("select", "Duration Preference",   "", true, ["1 Month", "3 Months", "6 Months", "1 Year"]),
    f("select", "Batch Preference",      "", false, ["Morning", "Evening", "Weekend"]),
  ],

  // ═══ HEALTH CARE POINT ══════════════════════════════════════════════════════
  "Clinic": [
    f("text",   "Patient Name",          "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Consultation Type",     "", true, ["General Checkup", "Follow-up Visit", "Vaccination", "Child Health", "Women's Health", "Other"]),
    f("date",   "Preferred Appointment Date", ""),
    f("time",   "Preferred Time",        ""),
    f("textarea","Symptoms / Concern",   "Briefly describe your symptoms...", false),
  ],
  "Doctors": [
    f("text",   "Patient Name",          "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Consultation Type",     "", true, ["First Visit", "Follow-up", "Emergency", "Report Discussion"]),
    f("date",   "Appointment Date",      ""),
    f("time",   "Preferred Time",        ""),
    f("textarea","Symptoms / Chief Complaint","Describe your symptoms briefly...", false),
  ],
  "Hospital": [
    f("text",   "Patient Name",          "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Service Required",      "", true, ["OPD Appointment", "Emergency", "IPD Admission", "Surgery Enquiry", "Diagnostic / Scan", "Second Opinion"]),
    f("select", "Department",            "", true, ["General Medicine", "Cardiology", "Orthopaedics", "Gynaecology", "Paediatrics", "ENT", "Dermatology", "Neurology", "Other"]),
    f("date",   "Preferred Date",        ""),
    f("textarea","Medical Details",      "Brief history, symptoms, reports available...", false),
  ],
  "Medicine Store": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("textarea","Medicine Names",       "List of medicines or prescription details..."),
    f("checkbox","Upload Prescription",  "I have a valid prescription", false),
    f("select", "Delivery Required",     "", true, ["Home Delivery", "Store Pickup"]),
    f("text",   "Delivery Address",      "Full address", false),
  ],
  "Pathology": [
    f("text",   "Patient Name",          "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Tests Required",        "", true, ["CBC (Blood Count)", "Blood Sugar", "Thyroid (T3/T4/TSH)", "Lipid Profile", "Liver Function", "Kidney Function", "Urine Test", "COVID RT-PCR", "Other"]),
    f("date",   "Preferred Date",        ""),
    f("time",   "Preferred Time",        ""),
    f("select", "Home Collection",       "", true, ["Yes - Home Collection", "No - Visit Lab"]),
    f("text",   "Address (if home)",     "Full address for sample collection", false),
  ],
  "Animal Care": [
    f("text",   "Pet Owner Name",        "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Pet Name",              "Name of your pet"),
    f("select", "Animal Type",           "", true, ["Dog", "Cat", "Bird", "Rabbit", "Fish", "Other"]),
    f("select", "Service Required",      "", true, ["Vaccination", "Grooming", "General Checkup", "Emergency", "Deworming", "Surgery"]),
    f("date",   "Appointment Date",      ""),
    f("textarea","Health Concern",       "Describe symptoms or requirements...", false),
  ],

  // ═══ DOCTOR POINT ═══════════════════════════════════════════════════════════
  "Cardiologist": [
    f("text",   "Patient Name",          "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("number", "Patient Age",           "Age in years"),
    f("select", "Consultation",          "", true, ["First Visit", "Follow-up", "ECG Review", "Report Discussion"]),
    f("date",   "Appointment Date",      ""),
    f("time",   "Preferred Time",        ""),
    f("textarea","Symptoms / Reports",   "Chest pain, BP readings, previous reports...", false),
  ],
  "Dentist": [
    f("text",   "Patient Name",          "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Treatment Required",    "", true, ["Checkup & Cleaning", "Tooth Extraction", "Root Canal", "Braces / Aligners", "Whitening", "Filling", "Crown / Cap", "Implant"]),
    f("date",   "Appointment Date",      ""),
    f("time",   "Preferred Time",        ""),
    f("textarea","Dental Concern",       "Describe pain, swelling or cosmetic concern...", false),
  ],
  "Dermatologist": [
    f("text",   "Patient Name",          "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Concern",               "", true, ["Acne / Pimples", "Pigmentation", "Hair Loss", "Skin Allergy", "Eczema / Psoriasis", "Anti-aging", "Laser Treatment", "Other"]),
    f("date",   "Appointment Date",      ""),
    f("time",   "Preferred Time",        ""),
    f("textarea","Brief Description",    "Duration, current medications, specific areas...", false),
  ],
  "Gynecologist": [
    f("text",   "Patient Name",          "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Consultation Type",     "", true, ["Routine Checkup", "Pregnancy Related", "Period Issues", "Family Planning", "PCOD / PCOS", "Other"]),
    f("date",   "Appointment Date",      ""),
    f("time",   "Preferred Time",        ""),
    f("textarea","Brief Medical Note",   "Current concern or medical history...", false),
  ],
  "Pediatrician": [
    f("text",   "Child's Name",          "Full name of child"),
    f("text",   "Parent / Guardian Name","Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("number", "Child's Age",           "Age in years or months"),
    f("select", "Visit Reason",          "", true, ["Routine Checkup", "Vaccination", "Fever / Cold", "Growth Assessment", "Emergency", "Other"]),
    f("date",   "Appointment Date",      ""),
    f("time",   "Preferred Time",        ""),
  ],
  "General Physician": [
    f("text",   "Patient Name",          "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Visit Type",            "", true, ["General Checkup", "Fever / Cold", "Follow-up", "Certificate Required", "Other"]),
    f("date",   "Appointment Date",      ""),
    f("time",   "Preferred Time",        ""),
    f("textarea","Symptoms",             "Describe your symptoms...", false),
  ],
  "Orthopedic": [
    f("text",   "Patient Name",          "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Issue",                 "", true, ["Joint Pain", "Back Pain", "Fracture", "Sports Injury", "Spine Issue", "Post-Surgery Follow-up", "Other"]),
    f("select", "Body Part Affected",    "", true, ["Knee", "Hip", "Shoulder", "Spine", "Ankle", "Wrist", "Other"]),
    f("date",   "Appointment Date",      ""),
    f("time",   "Preferred Time",        ""),
    f("textarea","Medical History",      "Previous surgeries, X-ray/MRI reports...", false),
  ],

  // ═══ HOTEL POINT ════════════════════════════════════════════════════════════
  "5 Star Hotels": [
    f("text",   "Guest Name",            "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email Address",         "your@email.com"),
    f("date",   "Check-in Date",         ""),
    f("date",   "Check-out Date",        ""),
    f("number", "Number of Guests",      "Total guests"),
    f("select", "Room Type",             "", true, ["Deluxe Room", "Suite", "Presidential Suite", "Sea View Room", "Connecting Rooms"]),
    f("select", "Meal Plan",             "", false, ["Room Only", "Breakfast Included", "Half Board", "Full Board", "All Inclusive"]),
    f("textarea","Special Requests",     "Anniversary, honeymoon, dietary needs, accessibility...", false),
  ],
  "Budget Hotels": [
    f("text",   "Guest Name",            "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("date",   "Check-in Date",         ""),
    f("date",   "Check-out Date",        ""),
    f("number", "Number of Guests",      "Total guests"),
    f("select", "Room Type",             "", true, ["Single Room", "Double Room", "Triple Room", "Dormitory"]),
    f("textarea","Any Requirements",     "Early check-in, late checkout, etc.", false),
  ],
  "Resorts": [
    f("text",   "Guest Name",            "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email Address",         "your@email.com", false),
    f("date",   "Check-in Date",         ""),
    f("date",   "Check-out Date",        ""),
    f("number", "Number of Adults",      ""),
    f("number", "Number of Children",    "", false),
    f("select", "Cottage / Villa Type",  "", true, ["Standard Cottage", "Deluxe Villa", "Pool Villa", "Treehouse", "Luxury Suite"]),
    f("select", "Activities",            "", false, ["Trekking", "Waterpark", "Bonfire", "Kayaking", "All Activities"]),
    f("textarea","Occasion / Notes",     "Honeymoon, birthday, family trip details...", false),
  ],
  "Banquet Halls": [
    f("text",   "Contact Person Name",   "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email Address",         "your@email.com", false),
    f("select", "Event Type",            "", true, ["Wedding", "Reception", "Birthday Party", "Corporate Event", "Engagement", "Anniversary", "Seminar"]),
    f("date",   "Event Date",            ""),
    f("number", "Expected Guests",       "Approximate guest count"),
    f("select", "Catering Required",     "", true, ["Yes - Full Catering", "Yes - Partial", "No - Self Catering"]),
    f("select", "Time Duration",         "", true, ["Half Day (4 hrs)", "Full Day (8 hrs)", "Evening (5 hrs)", "Custom"]),
    f("textarea","Special Requirements", "Decoration, DJ, stage setup, menu preferences...", false),
  ],
  "Guest House": [
    f("text",   "Guest Name",            "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("date",   "Check-in Date",         ""),
    f("date",   "Check-out Date",        ""),
    f("number", "Number of Guests",      ""),
    f("select", "Room Type",             "", true, ["Single", "Double", "Triple", "Dormitory"]),
    f("textarea","Requirements",         "Any special needs or notes...", false),
  ],

  // ═══ FOOD POINT ═════════════════════════════════════════════════════════════
  "Restaurants": [
    f("text",   "Guest Name",            "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("date",   "Reservation Date",      ""),
    f("time",   "Preferred Time",        ""),
    f("number", "Number of Guests",      "Party size"),
    f("select", "Seating Preference",    "", false, ["Indoor", "Outdoor", "Private Cabin", "Bar Area"]),
    f("textarea","Special Requests",     "Anniversary, dietary restrictions, occasion...", false),
  ],
  "Cafes": [
    f("text",   "Name",                  "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Order Type",            "", true, ["Dine-in Reservation", "Takeaway Pre-order", "Home Delivery"]),
    f("date",   "Date",                  ""),
    f("time",   "Preferred Time",        ""),
    f("textarea","Order / Requirements", "Pre-order items, dietary preferences...", false),
  ],
  "Caterers": [
    f("text",   "Client Name",           "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email Address",         "your@email.com", false),
    f("select", "Event Type",            "", true, ["Wedding", "Birthday Party", "Corporate Lunch", "Engagement", "Social Gathering", "Other"]),
    f("date",   "Event Date",            ""),
    f("text",   "Event Venue / Address", "Location where food is needed"),
    f("number", "Expected Guests",       "Approximate count"),
    f("select", "Menu Type",             "", true, ["Veg Only", "Non-Veg", "Both Veg & Non-Veg", "Jain", "Saatvik"]),
    f("select", "Meal Type",             "", true, ["Breakfast", "Lunch", "Dinner", "All Day", "Snacks"]),
    f("textarea","Menu Preferences",     "Specific dishes, budget per plate, themes...", false),
  ],
  "Bakeries": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Order Type",            "", true, ["Custom Cake", "Ready Items", "Bulk Order", "Wedding Cake", "Birthday Cake"]),
    f("date",   "Required By Date",      ""),
    f("textarea","Order Details",        "Flavour, design, weight, message on cake...", false),
    f("select", "Delivery Required",     "", true, ["Home Delivery", "Store Pickup"]),
    f("text",   "Delivery Address",      "Full address", false),
  ],
  "Fast Food": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Order Type",            "", true, ["Home Delivery", "Takeaway", "Dine-in"]),
    f("textarea","Items Required",       "List the items you want to order..."),
    f("text",   "Delivery Address",      "Full address (if delivery)", false),
  ],
  "Cloud Kitchens": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Delivery Address",      "Full delivery address"),
    f("select", "Meal Type",             "", true, ["Breakfast", "Lunch", "Dinner", "Snacks"]),
    f("textarea","Order Details",        "Items, quantity, special instructions..."),
    f("time",   "Preferred Delivery Time",""),
  ],
  "Sweet Shops": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("textarea","Items Required",       "List of sweets & quantities..."),
    f("select", "Order Purpose",         "", false, ["Festival Gift", "Bulk Order", "Wedding", "Regular Purchase"]),
    f("select", "Packaging",             "", false, ["Standard Box", "Gift Wrapped", "Premium Box"]),
    f("date",   "Required By",           "", false),
    f("select", "Delivery",              "", true, ["Home Delivery", "Store Pickup"]),
  ],

  // ═══ COURIER POINT ══════════════════════════════════════════════════════════
  "Domestic Courier": [
    f("text",   "Sender Name",           "Your full name"),
    f("phone",  "Sender Contact",        "Mobile number"),
    f("text",   "Pickup Address",        "Full pickup address with pincode"),
    f("text",   "Delivery Address",      "Full delivery address with pincode"),
    f("text",   "Recipient Name",        "Receiver full name"),
    f("phone",  "Recipient Contact",     "Receiver mobile number"),
    f("select", "Package Type",          "", true, ["Document", "Small Parcel (Under 1 kg)", "Medium Parcel (1-5 kg)", "Large Parcel (5-20 kg)", "Fragile Item"]),
    f("number", "Approximate Weight (kg)","e.g. 2"),
    f("select", "Delivery Speed",        "", true, ["Standard (3-5 days)", "Express (1-2 days)", "Same Day", "Next Day"]),
    f("textarea","Special Instructions", "Fragile, handle with care, open delivery...", false),
  ],
  "International Courier": [
    f("text",   "Sender Name",           "Your full name"),
    f("phone",  "Sender Contact",        "Mobile number"),
    f("email",  "Email Address",         "your@email.com"),
    f("text",   "Pickup Address",        "Full address with pincode"),
    f("text",   "Destination Country",   "Country of delivery"),
    f("text",   "Delivery Address",      "Full international address"),
    f("text",   "Recipient Name",        "Receiver full name"),
    f("select", "Shipment Type",         "", true, ["Documents", "Commercial Goods", "Personal Items", "Electronics", "Gifts"]),
    f("number", "Weight (kg)",           "Approximate weight"),
    f("checkbox","Customs Declaration Required","Items need customs declaration", false),
    f("textarea","Additional Details",   "Contents, value, special handling...", false),
  ],
  "Cargo Services": [
    f("text",   "Company / Client Name", "Business or full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email",                 "your@email.com", false),
    f("text",   "Pickup Location",       "Full address with pincode"),
    f("text",   "Destination",           "Delivery city/address"),
    f("number", "Total Weight (kg)",     "Approximate total weight"),
    f("select", "Cargo Type",            "", true, ["Industrial Goods", "FMCG", "Electronics", "Machinery", "Raw Materials", "Perishables"]),
    f("select", "Transport Mode",        "", true, ["Road", "Rail", "Air", "Sea"]),
    f("textarea","Special Requirements", "Temperature control, hazmat, documentation...", false),
  ],
  "Express Delivery": [
    f("text",   "Sender Name",           "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Pickup Address",        "Full address with pincode"),
    f("text",   "Delivery Address",      "Full delivery address"),
    f("text",   "Recipient Name",        "Receiver's full name"),
    f("phone",  "Recipient Number",      "Receiver mobile"),
    f("select", "Package Size",          "", true, ["Envelope", "Small Box", "Medium Box", "Large Box"]),
    f("select", "Delivery Time",         "", true, ["2 Hours", "4 Hours", "Same Day", "Next Morning"]),
  ],
  "Local Parcel Service": [
    f("text",   "Sender Name",           "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Pickup Address",        "Full local pickup address"),
    f("text",   "Delivery Address",      "Full local delivery address"),
    f("text",   "Recipient Name",        "Receiver name"),
    f("phone",  "Recipient Number",      "Receiver mobile"),
    f("select", "Parcel Type",           "", true, ["Documents", "Food", "Clothes", "Electronics", "Other"]),
    f("select", "Time Preference",       "", true, ["ASAP", "Within 2 Hours", "Today", "Scheduled"]),
  ],

  // ═══ CAR RENTAL POINT ═══════════════════════════════════════════════════════
  "Self-Drive Cars": [
    f("text",   "Renter Name",           "Full name as per driving licence"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email Address",         "your@email.com"),
    f("date",   "Pickup Date",           ""),
    f("time",   "Pickup Time",           ""),
    f("date",   "Return Date",           ""),
    f("text",   "Pickup Location",       "City / address"),
    f("select", "Car Type Preferred",    "", true, ["Hatchback", "Sedan", "SUV", "MUV", "Luxury"]),
    f("checkbox","Valid DL Available",   "I have a valid driving licence", true),
    f("textarea","Additional Notes",     "Any specific model, outstation needs...", false),
  ],
  "Chauffeur-Driven Cars": [
    f("text",   "Client Name",           "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("date",   "Start Date",            ""),
    f("time",   "Pickup Time",           ""),
    f("text",   "Pickup Location",       "Full address"),
    f("text",   "Destination",           "Drop address or city"),
    f("select", "Trip Type",             "", true, ["One Way", "Round Trip", "Daily Hire", "Outstation"]),
    f("select", "Vehicle Type",          "", true, ["Sedan", "SUV", "Tempo Traveller", "Luxury Car"]),
    f("textarea","Itinerary / Notes",    "Stops, trip details, timing preferences...", false),
  ],
  "Airport Cab Service": [
    f("text",   "Passenger Name",        "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Trip Type",             "", true, ["Airport Pickup", "Airport Drop"]),
    f("text",   "Airport Name",          "e.g. Devi Ahilya Bai Holkar Airport"),
    f("date",   "Travel Date",           ""),
    f("time",   "Flight / Arrival Time", ""),
    f("text",   "Pickup / Drop Address", "Full home or hotel address"),
    f("select", "Vehicle Type",          "", true, ["Hatchback", "Sedan", "SUV", "Tempo Traveller"]),
    f("number", "Number of Passengers",  ""),
    f("textarea","Flight Details",       "Flight number, terminal, luggage...", false),
  ],
  "Wedding Car Rental": [
    f("text",   "Client Name",           "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("date",   "Wedding Date",          ""),
    f("text",   "Venue Address",         "Wedding / reception venue address"),
    f("select", "Car Type",              "", true, ["Vintage Car", "Luxury Sedan", "SUV", "White Limousine", "Decorated Car"]),
    f("number", "Number of Cars",        "How many cars required?"),
    f("textarea","Special Decoration",   "Floral, theme, colour preferences...", false),
  ],

  // ═══ GARMENTS POINT ═════════════════════════════════════════════════════════
  "Men's Wear": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Item Type",             "", true, ["Shirt", "Trousers", "Suit", "Ethnic (Kurta/Sherwani)", "Jeans", "T-Shirt", "Blazer"]),
    f("select", "Occasion",              "", false, ["Casual", "Formal", "Wedding", "Party", "Festival"]),
    f("text",   "Size / Measurements",   "Size or chest/waist measurements"),
    f("select", "Delivery / Pickup",     "", true, ["Home Delivery", "Store Visit"]),
  ],
  "Women's Wear": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Item Type",             "", true, ["Saree", "Salwar Kameez", "Kurti", "Lehenga", "Western Dress", "Top & Jeans", "Co-ord Set"]),
    f("select", "Occasion",              "", false, ["Casual", "Formal", "Wedding", "Party", "Festival"]),
    f("text",   "Size / Measurements",   "Standard size or chest/waist/hip measurements"),
    f("select", "Delivery / Pickup",     "", true, ["Home Delivery", "Store Visit"]),
  ],
  "Bridal Wear": [
    f("text",   "Bride / Client Name",   "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("date",   "Wedding Date",          ""),
    f("select", "Outfit Required",       "", true, ["Bridal Lehenga", "Saree", "Sharara", "Anarkali", "Custom Design"]),
    f("select", "Budget Range",          "", false, ["Under ₹10,000", "₹10,000-₹25,000", "₹25,000-₹50,000", "₹50,000-₹1L", "Above ₹1L"]),
    f("text",   "Measurements",          "Bust / Waist / Hip / Height"),
    f("textarea","Design Preferences",   "Colour, embroidery, fabric, inspiration pics...", false),
  ],
  "Kids Wear": [
    f("text",   "Parent Name",           "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Gender",                "", true, ["Boy", "Girl", "Both"]),
    f("select", "Age Group",             "", true, ["0-1 Year", "1-3 Years", "3-6 Years", "6-10 Years", "10-14 Years"]),
    f("select", "Occasion",              "", false, ["School Wear", "Casual", "Party", "Festival", "Sports"]),
    f("text",   "Size / Measurements",   "Height or standard size"),
  ],
  "Boutique": [
    f("text",   "Client Name",           "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Service Type",          "", true, ["Custom Stitching", "Blouse Stitching", "Alteration", "Ready-to-Wear Purchase"]),
    f("text",   "Outfit Description",    "e.g. heavy embroidered lehenga blouse"),
    f("text",   "Measurements",          "Bust / Waist / Hip / Height"),
    f("date",   "Required By Date",      ""),
    f("textarea","Design Details",       "Colour, fabric, neckline, sleeves, reference pics...", false),
  ],

  // ═══ ASTROLOGER POINT ═══════════════════════════════════════════════════════
  "Vedic Astrologer": [
    f("text",   "Client Name",           "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Date of Birth",         "DD/MM/YYYY"),
    f("text",   "Time of Birth",         "e.g. 10:30 AM (if known)"),
    f("text",   "Place of Birth",        "City and State"),
    f("select", "Consultation Type",     "", true, ["Kundli Reading", "Marriage Compatibility", "Career & Finance", "Health", "Vastu + Kundli", "Annual Predictions"]),
    f("select", "Mode",                  "", true, ["In-Person", "Phone Call", "Video Call", "Written Report"]),
    f("textarea","Your Questions",       "Specific questions or areas of concern...", false),
  ],
  "Palm Reader": [
    f("text",   "Client Name",           "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Session Type",          "", true, ["In-Person", "Photo Reading (WhatsApp)"]),
    f("date",   "Appointment Date",      "", false),
    f("textarea","Areas of Interest",    "Career, love, health, wealth, family...", false),
  ],
  "Numerologist": [
    f("text",   "Client Name",           "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Date of Birth",         "DD/MM/YYYY"),
    f("text",   "Full Name at Birth",    "As per birth certificate"),
    f("select", "Service",               "", true, ["Personal Numerology", "Business Name Analysis", "Lucky Number", "Name Correction", "Annual Forecast"]),
    f("textarea","Your Questions",       "Specific queries or concerns...", false),
  ],
  "Tarot Card Reader": [
    f("text",   "Client Name",           "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Session Type",          "", true, ["In-Person", "Online (Video)", "Recorded Reading"]),
    f("select", "Reading Type",          "", true, ["General Life Reading", "Love & Relationships", "Career & Finance", "Yes/No Reading", "Annual Forecast"]),
    f("date",   "Appointment Date",      "", false),
    f("textarea","Your Questions",       "Specific questions for the reading...", false),
  ],
  "Vastu Consultant": [
    f("text",   "Client Name",           "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email Address",         "your@email.com", false),
    f("select", "Property Type",         "", true, ["Home / Flat", "Office", "Factory / Warehouse", "Shop", "Plot / Under Construction"]),
    f("select", "Service",               "", true, ["Full Vastu Inspection", "Floor Plan Analysis", "Report Only", "Online Consultation"]),
    f("text",   "Property Address",      "Full address of property"),
    f("textarea","Issues Faced",         "Problems like health, finance, relationship since moving...", false),
  ],

  // ═══ PRODUCT POINT ══════════════════════════════════════════════════════════
  "Electronics": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Product Category",      "", true, ["Washing Machine", "Refrigerator", "AC", "Microwave", "TV", "Water Purifier", "Geyser", "Mixer/Grinder"]),
    f("text",   "Brand Preference",      "e.g. LG, Samsung, Whirlpool", false),
    f("select", "Budget Range",          "", false, ["Under ₹5,000", "₹5,000-₹15,000", "₹15,000-₹30,000", "₹30,000-₹50,000", "Above ₹50,000"]),
    f("select", "Delivery Required",     "", true, ["Home Delivery", "Store Pickup"]),
    f("textarea","Specifications",       "Size, colour, specific features needed...", false),
  ],
  "Mobile Phones": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Brand Preference",      "", false, ["Samsung", "Apple", "OnePlus", "Xiaomi / Redmi", "Realme", "Oppo", "Vivo", "Any"]),
    f("select", "Budget Range",          "", true, ["Under ₹10,000", "₹10,000-₹20,000", "₹20,000-₹40,000", "₹40,000-₹70,000", "Above ₹70,000"]),
    f("select", "Key Features Needed",   "", false, ["Good Camera", "Long Battery", "High Performance", "5G", "Slim Design"]),
    f("select", "Purchase Mode",         "", true, ["Store Visit", "Home Delivery"]),
  ],
  "Furniture": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Delivery Address",      "Full address"),
    f("select", "Furniture Type",        "", true, ["Sofa", "Bed", "Wardrobe", "Dining Table", "Office Chair", "Study Table", "Bookshelf", "Full Room Set"]),
    f("select", "Material Preference",   "", false, ["Solid Wood", "Engineered Wood", "Metal", "Fabric", "Leather", "Any"]),
    f("select", "Budget Range",          "", false, ["Under ₹10,000", "₹10,000-₹30,000", "₹30,000-₹60,000", "Above ₹60,000"]),
    f("textarea","Design Preferences",   "Colour, dimensions, custom requirements...", false),
  ],
};

// ─── Parent Category Fallbacks ────────────────────────────────────────────────

const CATEGORY_FALLBACKS: Record<string, FormField[]> = {
  "Food Point": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Order Type",            "", true, ["Dine-in", "Takeaway", "Home Delivery"]),
    f("date",   "Preferred Date",        ""),
    f("time",   "Preferred Time",        ""),
    f("textarea","Order / Requirements", "Describe your order or requirements..."),
  ],
  "Spa Point": [
    f("text",   "Client Name",           "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Service Required",      "", true, ["Massage", "Facial", "Spa Package", "Salon Service"]),
    f("date",   "Appointment Date",      ""),
    f("time",   "Preferred Time",        ""),
  ],
  "Tour Point": [
    f("text",   "Lead Traveller Name",   "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email",                 "your@email.com"),
    f("text",   "Destination",           "Where do you want to go?"),
    f("date",   "Travel Date",           ""),
    f("number", "Number of Travellers",  ""),
    f("select", "Package Type",          "", true, ["Budget", "Standard", "Premium"]),
  ],
  "Job Point": [
    f("text",   "Applicant Name",        "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("email",  "Email Address",         "your@email.com"),
    f("select", "Role Applied For",      "", true, ["Full Time", "Part Time", "Internship", "Freelance"]),
    f("select", "Experience",            "", true, ["Fresher", "1-3 Years", "3-5 Years", "5+ Years"]),
    f("text",   "Resume / Portfolio",    "Paste your link here"),
  ],
  "Service Point": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Service Address",       "Full address for service visit"),
    f("select", "Service Type",          "", true, ["Repair", "Installation", "Maintenance", "General Service"]),
    f("date",   "Preferred Date",        ""),
    f("time",   "Preferred Time",        ""),
    f("textarea","Problem Description",  "Describe the issue...", false),
  ],
  "Education Point": [
    f("text",   "Student Name",          "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Service Required",      "", true, ["Admission Enquiry", "Counselling", "Fee Enquiry", "Course Info"]),
    f("textarea","Questions / Interests","What would you like to know?", false),
  ],
  "Health Care Point": [
    f("text",   "Patient Name",          "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Service Required",      "", true, ["Appointment", "Test Booking", "Medicine Enquiry", "Emergency"]),
    f("date",   "Preferred Date",        ""),
    f("textarea","Symptoms / Notes",     "Brief description...", false),
  ],
  "Hotel Point": [
    f("text",   "Guest Name",            "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("date",   "Check-in Date",         ""),
    f("date",   "Check-out Date",        ""),
    f("number", "Number of Guests",      ""),
    f("select", "Room Type",             "", true, ["Single", "Double", "Suite"]),
    f("textarea","Special Requests",     "Dietary, accessibility, occasion...", false),
  ],
  "Doctor Point": [
    f("text",   "Patient Name",          "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Consultation Type",     "", true, ["First Visit", "Follow-up", "Emergency"]),
    f("date",   "Appointment Date",      ""),
    f("time",   "Preferred Time",        ""),
    f("textarea","Symptoms",             "Describe your symptoms briefly...", false),
  ],
  "Garments Point": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Category",              "", true, ["Men's Wear", "Women's Wear", "Kids Wear", "Ethnic Wear", "Bridal"]),
    f("text",   "Size / Measurements",   "Standard size or measurements"),
    f("select", "Purchase Mode",         "", true, ["Home Delivery", "Store Visit"]),
  ],
  "Astrologer Point": [
    f("text",   "Client Name",           "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("text",   "Date of Birth",         "DD/MM/YYYY"),
    f("select", "Consultation",          "", true, ["In-Person", "Phone", "Video Call"]),
    f("textarea","Your Questions",       "Specific areas or concerns...", false),
  ],
  "Product Point": [
    f("text",   "Customer Name",         "Your full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("select", "Product Type",          "", true, ["Electronics", "Furniture", "Clothing", "Mobile", "Grocery", "Other"]),
    f("textarea","Product Requirements", "Describe what you're looking for...", false),
    f("select", "Purchase Mode",         "", true, ["Home Delivery", "Store Visit"]),
  ],
  "Courier Point": [
    f("text",   "Sender Name",           "Your full name"),
    f("phone",  "Sender Contact",        "Mobile number"),
    f("text",   "Pickup Address",        "Full pickup address"),
    f("text",   "Delivery Address",      "Full delivery address"),
    f("select", "Package Type",          "", true, ["Document", "Small Parcel", "Large Parcel", "Fragile"]),
    f("select", "Delivery Speed",        "", true, ["Standard", "Express", "Same Day"]),
  ],
  "Car Rental Point": [
    f("text",   "Client Name",           "Full name"),
    f("phone",  "Contact Number",        "Mobile number"),
    f("date",   "Start Date",            ""),
    f("time",   "Pickup Time",           ""),
    f("text",   "Pickup Location",       "Full address"),
    f("select", "Trip Type",             "", true, ["Local", "Outstation", "Airport", "Daily Hire"]),
    f("select", "Vehicle Type",          "", true, ["Hatchback", "Sedan", "SUV", "Tempo Traveller", "Luxury"]),
  ],
};

// ─── Template Resolver ─────────────────────────────────────────────────────────

function getTemplateFields(category: string): FormField[] {
  // 1. Exact subcategory match (strip "Category > Subcategory" format)
  const subcat = category.includes(">") ? category.split(">")[1].trim() : category.trim();
  if (SUBCATEGORY_TEMPLATES[subcat]) {
    return SUBCATEGORY_TEMPLATES[subcat].map((f) => ({ ...f, id: `${f.type}-${Date.now()}-${Math.random().toString(36).slice(2,6)}` }));
  }

  // 2. Parent category fallback
  const parentCat = category.includes(">") ? category.split(">")[0].trim() : category.trim();
  if (CATEGORY_FALLBACKS[parentCat]) {
    return CATEGORY_FALLBACKS[parentCat].map((f) => ({ ...f, id: `${f.type}-${Date.now()}-${Math.random().toString(36).slice(2,6)}` }));
  }

  // 3. Universal default
  return [
    f("text",   "Full Name",              "Enter your full name"),
    f("phone",  "Phone Number",           "Enter mobile number"),
    f("email",  "Email Address",          "your@email.com", false),
    f("date",   "Preferred Date",         ""),
    f("textarea","Message / Requirements","Describe what you need..."),
  ];
}

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
  clientListings: BusinessListingData[];
}

export default function ServiceForm({ clientListings }: ServiceFormProps) {
  const [selectedBizId, setSelectedBizId] = useState<string>(
    clientListings.length > 0 ? clientListings[0].id : ""
  );
  const [fields, setFields]             = useState<FormField[]>([]);
  const [bookNowEnabled, setBookNowEnabled] = useState(true);
  const [formTitle, setFormTitle]       = useState("Book Our Services");
  const [formDescription, setFormDescription] = useState("Fill in the details below to book or enquire.");
  const [savedMsg, setSavedMsg]         = useState("");
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [previewMode, setPreviewMode]   = useState(false);

  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  const selectedBiz = clientListings.find((b) => b.id === selectedBizId);

  // Sync selectedBizId when clientListings load
  useEffect(() => {
    if (clientListings.length > 0 && (!selectedBizId || !clientListings.some(b => b.id === selectedBizId))) {
      setSelectedBizId(clientListings[0].id);
    }
  }, [clientListings, selectedBizId]);

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
          // Fallback to templates
          if (selectedBiz) {
            setFields(getTemplateFields(selectedBiz.category || ""));
            setBookNowEnabled(true);
            setFormTitle("Book Our Services");
            setFormDescription("Fill in the details below to book or enquire.");
          }
        }
      } catch (err) {
        if (selectedBiz) {
          setFields(getTemplateFields(selectedBiz.category || ""));
          setBookNowEnabled(true);
          setFormTitle("Book Our Services");
          setFormDescription("Fill in the details below to book or enquire.");
        }
      }
    };

    loadConfig();
  }, [selectedBizId, selectedBiz]);

  const handleSave = async () => {
    if (!selectedBizId) return;
    const token = localStorage.getItem("fmp_business_token") || localStorage.getItem("fmp_admin_token") || "";

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

  if (clientListings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400 space-y-3">
        <Building className="h-12 w-12 text-slate-400" />
        <p className="text-sm font-semibold">No businesses found linked to your account.</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Service Form Builder</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Design a custom booking form. Drag fields to reorder.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Book Now Toggle Removed */}
          <button onClick={() => setPreviewMode(!previewMode)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${previewMode ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800"}`}>
            {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{previewMode ? "Exit Preview" : "Preview Form"}</span>
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-[0.98] transition cursor-pointer">
            <Save className="h-4 w-4" /><span>Save Form</span>
          </button>
        </div>
      </div>

      {savedMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl text-xs font-bold text-center">{savedMsg}</div>
      )}

      {clientListings.length > 1 && (
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">Configuring For:</label>
          <select value={selectedBizId} onChange={(e) => setSelectedBizId(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 cursor-pointer">
            {clientListings.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
          </select>
        </div>
      )}

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
                <p className="text-sm font-semibold">Click a field type on the left to add it,</p>
                <p className="text-xs mt-1">or use the Smart Template for a quick start.</p>
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
