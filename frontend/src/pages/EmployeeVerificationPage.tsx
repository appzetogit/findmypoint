import { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Phone,
  MapPin,
  Calendar,
  Heart,
  User,
  Briefcase,
  ArrowLeft,
  CheckCircle2,
  Share2,
  Search,
  Loader2,
  Check
} from "lucide-react";
import { API_BASE_URL, BACKEND_ORIGIN } from "../config";
import logoImg from "../assets/logo.png";
import { LazyImage } from "../components/ui/LazyImage";

interface Employee {
  _id?: string;
  id?: string;
  empIdNumber: string;
  name: string;
  address: string;
  fieldLocation: string;
  bloodGroup: string;
  contactNumber: string;
  photo: string;
  designation: string;
  joinedDate: string;
  isValidWorking: boolean;
}

interface EmployeeVerificationPageProps {
  initialEmpId?: string;
  onBackToHome?: () => void;
}

export default function EmployeeVerificationPage({
  initialEmpId,
  onBackToHome,
}: EmployeeVerificationPageProps) {
  const [empIdInput, setEmpIdInput] = useState(initialEmpId || "");
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const getImageUrl = (img: string) => {
    if (!img) return "";
    if (img.startsWith("data:") || img.startsWith("http")) return img;
    return `${BACKEND_ORIGIN}${img}`;
  };

  const getInitials = (fullName: string) => {
    return (
      fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase() || "E"
    );
  };

  const fetchEmployee = async (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) return;

    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/employees/verify/${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      setSearched(true);
      if (data.success && data.employee) {
        setEmployee(data.employee);
      } else {
        setEmployee(null);
        setErrorMessage(data.message || "No employee found with this ID.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setSearched(true);
      setEmployee(null);
      setErrorMessage("Network error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialEmpId) {
      fetchEmployee(initialEmpId);
    }
  }, [initialEmpId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (empIdInput.trim()) {
      window.history.pushState(null, "", `/verify/${encodeURIComponent(empIdInput.trim())}`);
      fetchEmployee(empIdInput);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${employee?.name || "Employee"} - FindMyPoint Verified ID`,
        text: `Official Verification Profile for ${employee?.name} (${employee?.empIdNumber})`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900/50 backdrop-blur-md text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
          )}
          <a href="/" className="flex items-center gap-2">
            <img src={logoImg} alt="FindMyPoint Logo" className="h-6 w-auto object-contain" />
          </a>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/40">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
            <span>Personnel Verification</span>
          </span>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-xl w-full mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center text-center">
        {/* Quick Search ID Form if needed */}
        <div className="w-full max-w-sm mb-6 space-y-2">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-md rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <input
              type="text"
              placeholder="Enter Employee ID (e.g. FMPEMP001)..."
              value={empIdInput}
              onChange={(e) => setEmpIdInput(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm font-semibold bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400 uppercase"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-1 top-1 bottom-1 px-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Verify"}
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 flex flex-col items-center space-y-3">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
              Verifying employee credentials...
            </span>
          </div>
        )}

        {/* Not Found / Error State */}
        {!loading && searched && !employee && (
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 shadow-xl text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-200 dark:border-rose-800 flex items-center justify-center">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Record Not Found
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">
                {errorMessage || "The requested Employee ID does not exist."}
              </p>
            </div>
          </div>
        )}

        {/* EXACT ID Card Display */}
        {!loading && employee && (
          <div className="w-full max-w-[310px] sm:max-w-[330px] space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-150 dark:border-slate-800 w-full relative overflow-hidden flex flex-col select-none text-left">
              {/* Top slot hole */}
              <div className="w-16 h-3 bg-slate-200 dark:bg-slate-850 rounded-full mx-auto mt-4 mb-2 shrink-0" />

              {/* Slanted Header Design Accents */}
              <div className="relative h-24 overflow-hidden shrink-0 bg-slate-50 dark:bg-slate-950/25 border-b border-slate-100 dark:border-slate-800/30">
                {/* Blue-grey accent slant */}
                <div className="absolute top-0 right-0 w-[55%] h-32 bg-[#6b8bae]/20 dark:bg-[#6b8bae]/10 rounded-bl-[80px] z-0" />
                {/* Navy accent slant */}
                <div className="absolute top-10 right-0 w-[35%] h-24 bg-slate-900 rounded-bl-[60px] z-0 transform rotate-6 opacity-80" />

                {/* Logo block in header centered */}
                <div className="absolute top-3 inset-x-0 z-10 flex items-center justify-center">
                  <img
                    src={logoImg}
                    alt="FindMyPoint Logo"
                    className="h-4.5 w-auto object-contain"
                  />
                </div>

                {/* 9 Dots Grid Pattern */}
                <div className="absolute top-4.5 right-14 grid grid-cols-3 gap-0.5 shrink-0 opacity-25">
                  {Array.from({ length: 9 }).map((_, idx) => (
                    <div key={idx} className="h-1 w-1 bg-slate-500 rounded-full" />
                  ))}
                </div>
              </div>

              {/* Photo Section overlaying header */}
              <div className="relative flex justify-center -mt-12 z-10 shrink-0">
                {/* Vertical line and EMPLOYEE label */}
                <div className="absolute left-6 top-10 flex flex-col items-center gap-1">
                  <div className="w-[1px] h-8 bg-slate-350 dark:bg-slate-750" />
                  <span className="[writing-mode:vertical-lr] text-[7px] font-black uppercase text-slate-450 dark:text-slate-500 tracking-[0.2em] leading-none">
                    EMPLOYEE
                  </span>
                </div>

                {employee.photo ? (
                  <LazyImage
                    src={getImageUrl(employee.photo)}
                    alt={employee.name}
                    className="h-28 w-28 rounded-2xl border-4 border-white dark:border-slate-900 shadow-md overflow-hidden bg-slate-100 dark:bg-slate-800"
                    imgClassName="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-2xl border-4 border-white dark:border-slate-900 shadow-md">
                    {getInitials(employee.name)}
                  </div>
                )}
              </div>

              {/* Employee Name & Title */}
              <div className="px-6 text-center mt-3.5 shrink-0">
                <h3 className="font-serif text-[15px] font-black text-slate-900 dark:text-white tracking-wide uppercase leading-snug">
                  {employee.name}
                </h3>
                <p className="text-[8px] font-bold text-[#6b8bae] dark:text-[#8cb2d9] uppercase tracking-[0.15em] mt-0.5 leading-none">
                  {employee.designation}
                </p>
                {/* Thin separator line */}
                <div className="w-12 h-[1px] bg-slate-200 dark:bg-slate-800 mx-auto mt-2.5" />
              </div>

              {/* Details List with QR Code shifted further left */}
              <div className="px-4 py-4 flex items-center justify-center gap-3.5 flex-1">
                {/* Left Details */}
                <div className="space-y-3 shrink-0">
                  {/* ID Number */}
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-indigo-50 dark:bg-slate-950 text-indigo-650 dark:text-slate-450 flex items-center justify-center shrink-0 border border-indigo-100/50 dark:border-slate-800">
                      <User className="h-3 w-3" />
                    </div>
                    <div className="text-left leading-none min-w-0">
                      <span className="text-[7px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                        ID NUMBER
                      </span>
                      <span className="text-[11px] text-slate-800 dark:text-slate-200 font-extrabold mt-0.5 block font-mono truncate">
                        {employee.empIdNumber}
                      </span>
                    </div>
                  </div>

                  {/* Designation */}
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-indigo-50 dark:bg-slate-950 text-indigo-650 dark:text-slate-450 flex items-center justify-center shrink-0 border border-indigo-100/50 dark:border-slate-800">
                      <Briefcase className="h-3 w-3" />
                    </div>
                    <div className="text-left leading-none min-w-0">
                      <span className="text-[7px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                        DESIGNATION
                      </span>
                      <span className="text-[11px] text-slate-800 dark:text-slate-200 font-extrabold mt-0.5 block truncate">
                        {employee.designation}
                      </span>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-indigo-50 dark:bg-slate-950 text-indigo-650 dark:text-slate-450 flex items-center justify-center shrink-0 border border-indigo-100/50 dark:border-slate-800">
                      <Phone className="h-3 w-3" />
                    </div>
                    <div className="text-left leading-none min-w-0">
                      <span className="text-[7px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                        CONTACT NUMBER
                      </span>
                      <a href={`tel:${employee.contactNumber}`} className="text-[11px] text-slate-800 dark:text-slate-200 font-extrabold mt-0.5 block hover:underline truncate">
                        {employee.contactNumber}
                      </a>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-indigo-50 dark:bg-slate-950 text-indigo-650 dark:text-slate-450 flex items-center justify-center shrink-0 border border-indigo-100/50 dark:border-slate-800">
                      <MapPin className="h-3 w-3" />
                    </div>
                    <div className="text-left leading-none min-w-0">
                      <span className="text-[7px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                        FIELD LOCATION
                      </span>
                      <span className="text-[11px] text-slate-800 dark:text-slate-200 font-extrabold mt-0.5 block truncate">
                        {employee.fieldLocation || "Not Assigned"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Scannable QR Code */}
                <div className="shrink-0 flex flex-col items-center justify-center text-center">
                  <div className="h-[76px] w-[76px] sm:h-[80px] sm:w-[80px] p-1 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                        window.location.origin + "/verify/" + employee.empIdNumber
                      )}&margin=10`}
                      alt="QR Code"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="text-[6.5px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mt-1 block">
                    SCAN TO VERIFY
                  </span>
                </div>
              </div>

              {/* Issued & Validity Footer */}
              <div className="px-5 py-4 bg-slate-50 dark:bg-slate-955 border-t border-slate-150/80 dark:border-slate-800 flex items-center justify-between text-left shrink-0">
                <div>
                  <span className="text-[7.5px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block leading-none">
                    ISSUED:
                  </span>
                  <span className="text-[9.5px] font-black text-slate-700 dark:text-slate-350 uppercase mt-1 block leading-none">
                    {employee.joinedDate}
                  </span>
                </div>
                <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />
                <div>
                  <span className="text-[7.5px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block leading-none">
                    STATUS:
                  </span>
                  <span
                    className={`text-[9.5px] font-black uppercase mt-1 block leading-none ${
                      employee.isValidWorking ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {employee.isValidWorking ? "ACTIVE STAFF" : "INACTIVE"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <a
                href={`tel:${employee.contactNumber}`}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-md shadow-indigo-600/15 transition cursor-pointer"
              >
                <Phone className="h-3.5 w-3.5" />
                Call Employee
              </a>
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-3 rounded-xl text-xs transition cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
                {copied ? "Link Copied!" : "Share Profile"}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Verification Footer */}
      <footer className="py-3 text-center text-[10.5px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80 px-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
        © {new Date().getFullYear()} FindmyPoint India • Official Personnel Verification
      </footer>
    </div>
  );
}
