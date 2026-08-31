import { useState } from "react";
import { X, Download, Copy, Check, User, Briefcase, Phone, MapPin } from "lucide-react";
import logoImg from "../assets/logo.png";
import { BACKEND_ORIGIN } from "../config";
import { LazyImage } from "./ui/LazyImage";

interface Employee {
  id: string;
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

interface EmployeeIdCardModalProps {
  employee: Employee;
  onClose: () => void;
}

export default function EmployeeIdCardModal({ employee, onClose }: EmployeeIdCardModalProps) {
  const [copied, setCopied] = useState(false);

  const verifyUrl = `${window.location.origin}/verify/${encodeURIComponent(employee.empIdNumber)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(verifyUrl)}&margin=10`;

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQr = async () => {
    try {
      const res = await fetch(qrCodeUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `QR_${employee.empIdNumber}_${employee.name.replace(/\s+/g, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download QR code image:", err);
      window.open(qrCodeUrl, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in text-left overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 max-w-2xl w-full my-auto overflow-hidden flex flex-col max-h-[95vh] animate-zoom-in">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-950/30">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Employee Digital ID Card & QR Code
            </h3>
            <p className="text-[10.5px] text-slate-400 font-medium">
              Auto-generated QR verification for {employee.empIdNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto no-scrollbar grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* LEFT: Live Printable ID Card */}
          <div className="md:col-span-7 flex justify-center">
            <div
              className="bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-150 dark:border-slate-800 max-w-[310px] sm:max-w-[330px] w-full relative overflow-hidden flex flex-col select-none"
            >
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
                      <span className="text-[11px] text-slate-800 dark:text-slate-200 font-extrabold mt-0.5 block truncate">
                        {employee.contactNumber}
                      </span>
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
                    <img src={qrCodeUrl} alt="QR Code" className="h-full w-full object-contain" />
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
          </div>

          {/* RIGHT: QR Code Details & Actions */}
          <div className="md:col-span-5 space-y-4 text-left">
            <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center flex items-center justify-center">
              <div className="h-32 w-32 mx-auto bg-white p-2 rounded-2xl border border-slate-200 shadow-md flex items-center justify-center">
                <img src={qrCodeUrl} alt="QR Code Large" className="h-full w-full object-contain" />
              </div>
            </div>

            {/* Actions List */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleDownloadQr}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-indigo-600/15 transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Download QR Code Image
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Link Copied to Clipboard!" : "Copy Verification URL"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
