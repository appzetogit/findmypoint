import { useState, useEffect } from "react";
import { Search, Eye, Trash2, Calendar, Clock, MapPin, Phone, Mail, User, ShieldCheck, Image as ImageIcon, X } from "lucide-react";

interface BusinessRequest {
  id: string;
  businessName: string;
  category: string;
  ownerName: string;
  contactNumber: string;
  whatsappNumber: string;
  email: string;
  addressDetails: string;
  photos: string[]; // 4 base64 images
  openTime: string;
  closeTime: string;
  isTimeMandatory: boolean;
  country: string;
  state: string;
  district: string;
  area: string;
  town: string;
  city: string;
  pinCode: string;
  employeeName: string;
  submittedAt: string;
}

export default function BusinessRequests() {
  const [requests, setRequests] = useState<BusinessRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingRequest, setViewingRequest] = useState<BusinessRequest | null>(null);
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);

  const [listingFee, setListingFee] = useState("500");
  const [feeInput, setFeeInput] = useState("500");

  useEffect(() => {
    const savedFee = localStorage.getItem("fmp_listing_request_fee:v1");
    if (savedFee) {
      setListingFee(savedFee);
      setFeeInput(savedFee);
    }
  }, []);

  const handleUpdateFee = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("fmp_listing_request_fee:v1", feeInput);
    setListingFee(feeInput);
    alert("Listing fee updated successfully to ₹" + feeInput);
  };

  // Load submissions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("fmp_business_requests:v1");
    if (saved) {
      try {
        setRequests(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveRequests = (updated: BusinessRequest[]) => {
    setRequests(updated);
    localStorage.setItem("fmp_business_requests:v1", JSON.stringify(updated));
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this business request?")) {
      const updated = requests.filter((r) => r.id !== id);
      saveRequests(updated);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const term = searchTerm.toLowerCase();
    return (
      req.businessName.toLowerCase().includes(term) ||
      req.ownerName.toLowerCase().includes(term) ||
      req.category.toLowerCase().includes(term) ||
      req.employeeName.toLowerCase().includes(term) ||
      req.city.toLowerCase().includes(term)
    );
  });

  return (
    <>
      <div className="space-y-6 w-full animate-fade-in-up text-left">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              Business Requests
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Review and manage field work listing requests submitted by employees
            </p>
          </div>
        </div>

        {/* Small compact Listing Fee Control in top-right corner */}
        <div className="bg-slate-50 dark:bg-slate-955/20 border border-slate-100 dark:border-slate-850/60 rounded-xl p-3 flex items-center gap-3 shrink-0 shadow-sm self-start md:self-auto">
          <div className="text-left">
            <span className="text-[9px] font-black uppercase text-slate-450 dark:text-slate-500 block leading-none">
              Listing Fee (INR)
            </span>
            <span className="text-[10px] font-extrabold text-indigo-650 dark:text-indigo-400 block mt-1 leading-none">
              Current: ₹{listingFee}
            </span>
          </div>
          <form onSubmit={handleUpdateFee} className="flex items-center gap-1.5">
            <input
              type="number"
              required
              min="0"
              placeholder="500"
              value={feeInput}
              onChange={(e) => setFeeInput(e.target.value)}
              className="w-16 bg-white dark:bg-slate-950 text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 font-bold focus:border-indigo-500 transition-all text-center"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition cursor-pointer shrink-0"
            >
              Set
            </button>
          </form>
        </div>
      </div>

      {/* Action panel (Search & Count) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4.5 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, owner, employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-955 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-450 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-455 font-bold">
          Total Requests: <span className="text-indigo-650 dark:text-indigo-400 font-extrabold">{filteredRequests.length}</span>
        </div>
      </div>

      {/* Main Datatable Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-955/20 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                <th className="py-4 px-6">Business Details</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Owner Info</th>
                <th className="py-4 px-6">Submitted By</th>
                <th className="py-4 px-6">Submitted At</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/5 transition">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      {req.photos && req.photos[0] ? (
                        <img
                          src={req.photos[0]}
                          alt={req.businessName}
                          className="h-10 w-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-slate-950 text-indigo-500 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-800">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{req.businessName}</h4>
                        <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">{req.city}, {req.state}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-slate-700 dark:text-slate-350">
                    {req.category}
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-800 dark:text-slate-205">{req.ownerName}</span>
                      <span className="text-[10px] text-slate-455 dark:text-slate-500 block">{req.contactNumber}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-slate-700 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 text-[10px] font-black rounded-lg border border-indigo-100/50 dark:border-indigo-950/20">
                      {req.employeeName}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-505 dark:text-slate-400 font-mono">
                    {req.submittedAt}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewingRequest(req)}
                        className="h-8 w-8 flex items-center justify-center rounded-xl bg-indigo-50/50 hover:bg-indigo-150/40 dark:bg-indigo-955/20 dark:hover:bg-indigo-955/40 text-indigo-650 dark:text-indigo-400 transition cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-xl bg-rose-50/50 hover:bg-rose-150/40 dark:bg-rose-955/20 dark:hover:bg-rose-955/40 text-rose-650 dark:text-rose-400 transition cursor-pointer"
                        title="Delete Request"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500 italic">
                    No business listing requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Details Dialog Modal */}
      {viewingRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800/80 max-w-2xl w-full relative overflow-hidden flex flex-col max-h-[90vh] animate-zoom-in">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                    {viewingRequest.businessName}
                  </h3>
                  <span className="text-[10px] text-indigo-650 dark:text-indigo-400 font-bold uppercase tracking-wider">
                    {viewingRequest.category} Listing Request
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingRequest(null)}
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-955 hover:bg-rose-50 dark:hover:bg-rose-955/20 text-slate-450 hover:text-rose-600 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable details container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              
              {/* Business Photos Grid (Exactly 4 photos) */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  Uploaded Business Photos (4 clicks)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {viewingRequest.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden cursor-zoom-in"
                      onClick={() => setZoomPhoto(photo)}
                    >
                      {photo ? (
                        <img
                          src={photo}
                          alt={`Business ${index + 1}`}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                        Click to Zoom
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Owner and Contact details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-955/40 border border-slate-100 dark:border-slate-850/60 rounded-2xl p-4 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    Contact & Owner Details
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-850/50">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Owner Name:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{viewingRequest.ownerName}</span>
                    </div>
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-850/50">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Contact Number:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{viewingRequest.contactNumber}</span>
                    </div>
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-850/50">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">WhatsApp Number:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{viewingRequest.whatsappNumber}</span>
                    </div>
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-850/50">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Email:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{viewingRequest.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-bold">Amount Paid:</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                        ₹{(viewingRequest as any).amountPaid || "0"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-955/40 border border-slate-100 dark:border-slate-850/60 rounded-2xl p-4 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    Operational Hours & Assignment
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-850/50">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Hours Status:</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${viewingRequest.isTimeMandatory ? "bg-rose-50 dark:bg-rose-955/20 text-rose-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                        {viewingRequest.isTimeMandatory ? "Time Mandatory" : "Time Not Mandatory"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-850/50">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Open Time:</span>
                      <span className="font-bold text-slate-850 dark:text-slate-200">{viewingRequest.openTime || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-850/50">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Close Time:</span>
                      <span className="font-bold text-slate-850 dark:text-slate-200">{viewingRequest.closeTime || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Collected By:</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-100/50">
                        {viewingRequest.employeeName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Geographic Address details */}
              <div className="bg-slate-50 dark:bg-slate-955/40 border border-slate-100 dark:border-slate-850/60 rounded-2xl p-4 space-y-3.5">
                <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  Location & Address Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="leading-none border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-855/50 pb-2 sm:pb-0 pr-2">
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Country</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-250 mt-1 block">{viewingRequest.country}</span>
                  </div>
                  <div className="leading-none border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-855/50 pb-2 sm:pb-0 pr-2 pl-1">
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">State</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-250 mt-1 block">{viewingRequest.state}</span>
                  </div>
                  <div className="leading-none border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-855/50 pb-2 sm:pb-0 pr-2 pl-1">
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">District</span>
                    <span className="font-extrabold text-slate-805 dark:text-slate-250 mt-1 block">{viewingRequest.district}</span>
                  </div>
                  <div className="leading-none pl-1">
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">PIN Code</span>
                    <span className="font-mono font-extrabold text-slate-800 dark:text-slate-250 mt-1 block">{viewingRequest.pinCode}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs pt-3 border-t border-slate-100/60 dark:border-slate-850/40">
                  <div className="leading-none">
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Area</span>
                    <span className="font-bold text-slate-850 dark:text-slate-255 mt-1 block">{viewingRequest.area}</span>
                  </div>
                  <div className="leading-none">
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Town</span>
                    <span className="font-bold text-slate-850 dark:text-slate-255 mt-1 block">{viewingRequest.town}</span>
                  </div>
                  <div className="leading-none">
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">City</span>
                    <span className="font-bold text-slate-850 dark:text-slate-255 mt-1 block">{viewingRequest.city}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-150/50 dark:border-slate-850/40 text-xs">
                  <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Specific Address Details</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-350 mt-1 block leading-relaxed">{viewingRequest.addressDetails}</span>
                </div>
              </div>

            </div>

            {/* Footer close */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 flex justify-end shrink-0">
              <button
                onClick={() => setViewingRequest(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Zoom Modal */}
      {zoomPhoto && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-955/90 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-3xl w-full max-h-[85vh] flex flex-col items-center">
            <button
              onClick={() => setZoomPhoto(null)}
              className="absolute -top-10 right-0 text-white hover:text-rose-500 text-sm font-bold flex items-center gap-1 cursor-pointer"
            >
              <X className="h-5 w-5" />
              Close
            </button>
            <img
              src={zoomPhoto}
              alt="Zoomed Business Photo"
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </>
  );
}
