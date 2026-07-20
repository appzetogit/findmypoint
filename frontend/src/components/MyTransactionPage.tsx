import { useState, useEffect } from "react";
import { Check, X, Download } from "lucide-react";
import { jsPDF } from "jspdf";

export default function MyTransactionPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      const token = localStorage.getItem("fmp_user_token") || "";
      const headers: HeadersInit = {
        "Content-Type": "application/json"
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      try {
        const res = await fetch("http://localhost:5000/api/transactions", { headers });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const mapped = data.data.map((txn: any) => ({
            id: txn.bookingId || txn.id,
            transactionId: txn.id,
            category: "Secure Booking",
            business: txn.businessName || "FindmyPoint Listing",
            details: txn.details || txn.description || "Service Booking Payment",
            amount: txn.amount,
            date: txn.timestamp ? txn.timestamp.split(",")[0] : "",
            status: txn.status === "Completed" ? "Success" : txn.status,
            paymentMode: txn.paymentMethod || "UPI Gateway"
          }));
          setBookings(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch transactions from server:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  }, []);

  const handleDownloadInvoice = (receipt: any) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a5"
    });

    const primaryColor = "#0f172a"; 
    const secondaryColor = "#64748b"; 
    const lightBg = "#f8fafc"; 

    doc.setTextColor(primaryColor);
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("FINDMYPOINT", 15, 18);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(secondaryColor);
    doc.text("Secure Payment Receipt & Invoice", 15, 22);
    
    doc.setFillColor(240, 253, 250); 
    doc.roundedRect(95, 12, 40, 8, 1.5, 1.5, "F");
    doc.setTextColor(5, 150, 105); 
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.text("PAID RECEIPT", 103, 17.2);
    
    doc.setDrawColor(226, 232, 240); 
    doc.setLineWidth(0.3);
    doc.line(15, 27, 135, 27);
    
    let y = 37;
    const addRow = (label: string, value: string, fontStyle: "bold" | "normal" = "normal") => {
      doc.setTextColor(secondaryColor);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.text(label, 15, y);
      
      doc.setTextColor(primaryColor);
      doc.setFont("Helvetica", fontStyle);
      doc.setFontSize(8);
      doc.text(value, 48, y);
      y += 8;
    };
    
    if (receipt.transactionId) {
      addRow("Transaction ID:", receipt.transactionId, "bold");
    }
    addRow("Order ID:", receipt.id, "bold");
    addRow("Merchant:", receipt.business);
    addRow("Service/Details:", receipt.details);
    addRow("Date:", receipt.date);
    addRow("Payment Mode:", receipt.paymentMode);
    addRow("Status:", "Success (Paid)", "bold");
    
    y += 2;
    doc.setFillColor(248, 250, 252); 
    doc.setDrawColor(241, 245, 249); 
    doc.roundedRect(15, y, 120, 14, 2, 2, "FD");
    
    doc.setTextColor(primaryColor);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Total Paid:", 22, y + 8.5);
    
    doc.setTextColor(5, 150, 105); 
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Rs. ${receipt.amount}.00`, 98, y + 9);
    
    y += 24;
    doc.setTextColor(secondaryColor);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Thank you for using FindmyPoint!", 15, y);
    doc.text("This is an electronically generated document. No signature required.", 15, y + 3.5);
    
    doc.save(`FMP_Receipt_${receipt.id}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg font-black text-foreground">Transaction Logs</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Verification details of secure checkout payments and bookings.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs font-semibold text-muted-foreground animate-pulse">
          Fetching transaction logs...
        </div>
      ) : bookings.length === 0 ? (
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
                {bookings.map((book) => (
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
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Payment Verified
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">FindmyPoint Secure Receipt</p>
            </div>

            {/* Invoice Meta */}
            <div className="space-y-3 text-xs border-b border-slate-100 pb-4 mb-4">
              {selectedReceipt.transactionId && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedReceipt.transactionId}</span>
                </div>
              )}
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
              onClick={() => handleDownloadInvoice(selectedReceipt)}
              className="w-full bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-black py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
            >
              <Download className="h-4 w-4" /> Download Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
