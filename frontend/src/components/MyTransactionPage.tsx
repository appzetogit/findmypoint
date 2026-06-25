import { useState, useEffect } from "react";
import { Check, X, FileText } from "lucide-react";

export default function MyTransactionPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  useEffect(() => {
    try {
      const savedBookings = localStorage.getItem("fmp_bookings");
      if (savedBookings) {
        setBookings(JSON.parse(savedBookings));
      } else {
        const defaultBookings = [
          {
            id: "FMP-8921",
            category: "Food Point",
            business: "Shree shyam restaurant",
            details: "Table Booking for 4 Guests",
            amount: 250,
            date: "2026-06-24",
            status: "Success",
            paymentMode: "UPI (sharma@okaxis)"
          },
          {
            id: "FMP-7652",
            category: "Service Point",
            business: "Apex AC Repair Hub",
            details: "AC General Servicing Service",
            amount: 850,
            date: "2026-06-20",
            status: "Success",
            paymentMode: "Card (xxxx-xxxx-xxxx-4321)"
          },
          {
            id: "FMP-6541",
            category: "Health Care Point",
            business: "Dr. Batra Dental Clinic",
            details: "Morning Slot Consultation (10:30 AM)",
            amount: 300,
            date: "2026-06-15",
            status: "Success",
            paymentMode: "Net Banking (SBI)"
          }
        ];
        localStorage.setItem("fmp_bookings", JSON.stringify(defaultBookings));
        setBookings(defaultBookings);
      }
    } catch (e) {
      console.error("Failed to load transactions", e);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg font-black text-foreground">Transaction Logs</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Verification details of secure checkout payments and bookings.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-10 text-center text-xs font-bold text-slate-400 bg-secondary/5">
          No transactions or checkout records discovered yet.
        </div>
      ) : (
        <div className="border border-border rounded-2xl overflow-hidden shadow-sm bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-secondary/15 border-b border-border text-muted-foreground font-black uppercase text-[9px] tracking-wider text-left">
                  <th className="p-4">Receipt ID</th>
                  <th className="p-4">Listing / Category</th>
                  <th className="p-4">Booking Details</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Paid</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.map(book => (
                  <tr key={book.id} className="hover:bg-secondary/5 transition text-left">
                    <td className="p-4 font-bold text-primary">{book.id}</td>
                    <td className="p-4">
                      <span className="font-black text-foreground block">{book.business}</span>
                      <span className="text-[10px] text-muted-foreground">{book.category}</span>
                    </td>
                    <td className="p-4 font-medium text-slate-600">{book.details}</td>
                    <td className="p-4 text-slate-500 font-bold">{book.date}</td>
                    <td className="p-4 font-black text-emerald-600">₹{book.amount}.00</td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1.5 justify-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-[9px] uppercase">
                          {book.status}
                        </span>
                        <button
                          onClick={() => setSelectedReceipt(book)}
                          className="text-[10px] text-primary hover:underline font-bold cursor-pointer"
                        >
                          View Receipt
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt View Pop-up Overlay */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 text-left animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden flex flex-col p-5 font-sans relative animate-scale-in">
            
            {/* Close button */}
            <button 
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Receipt Banner */}
            <div className="text-center pb-4 mb-4 border-b border-dashed border-slate-200">
              <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check className="h-6 w-6 stroke-[3]" />
              </div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Payment Verified</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">FindmyPoint Secure Receipt</p>
            </div>

            {/* Invoice Meta */}
            <div className="space-y-3 text-xs border-b border-slate-100 pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Merchant:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.business}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Description:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.details}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Mode:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.paymentMode}</span>
              </div>
            </div>

            {/* Amount */}
            <div className="flex justify-between items-center text-sm font-black text-slate-800 mb-4 bg-slate-50 border border-slate-100 p-3 rounded-xl">
              <span>Total Amount:</span>
              <span className="text-emerald-600 text-base">₹{selectedReceipt.amount}.00</span>
            </div>

            <button
              onClick={() => {
                window.print();
              }}
              className="w-full bg-slate-900 hover:bg-black text-white text-xs font-black py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FileText className="h-4 w-4" /> Print Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
