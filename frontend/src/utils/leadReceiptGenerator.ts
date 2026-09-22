import { jsPDF } from "jspdf";

export interface LeadReceiptData {
  requestId: string;
  businessName: string;
  ownerName: string;
  category: string;
  contactNumber: string;
  whatsappNumber: string;
  email?: string;
  location: string;
  addressDetails?: string;
  locationUrl?: string;
  operatingHours?: string;
  submittedAt: string;
  employeeName?: string;
  amount: number;
  paymentId?: string;
  paymentStatus: "Paid" | "Free" | "Submitted";
}

export const generateLeadReceiptPDF = (data: LeadReceiptData) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a5", // A5 size: 148 x 210 mm
  });

  const primaryColor = "#0f172a"; // Slate 900
  const secondaryColor = "#475569"; // Slate 600
  const lightMuted = "#94a3b8"; // Slate 400
  const accentIndigo = "#4f46e5"; // Indigo 600
  const successGreen = "#059669"; // Emerald 600

  // ── Header Banner ────────────────────────────────────────────────────────
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 148, 32, "F");

  // Top Accent Bar
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 148, 2.5, "F");

  // Logo Brand Text
  doc.setTextColor(primaryColor);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.text("FINDMYPOINT", 12, 14);

  // Subtitle
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(secondaryColor);
  doc.text("Official Business Listing Application & Payment Receipt", 12, 19);

  doc.setFontSize(7);
  doc.setTextColor(lightMuted);
  doc.text("www.findmypoint.app  |  Support: findmypoint.india@gmail.com", 12, 24);

  // Status Badge (Top Right)
  const isPaid = data.amount > 0 && data.paymentStatus === "Paid";
  if (isPaid) {
    doc.setFillColor(236, 253, 245); // Emerald 50
    doc.setDrawColor(167, 243, 208); // Emerald 200
    doc.roundedRect(96, 8, 40, 14, 2, 2, "FD");
    doc.setTextColor(successGreen);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("PAID & VERIFIED", 101, 14.5);
    doc.setFontSize(7);
    doc.text(`INR ${data.amount.toFixed(2)}`, 108, 19.5);
  } else {
    doc.setFillColor(238, 242, 255); // Indigo 50
    doc.setDrawColor(199, 210, 254); // Indigo 200
    doc.roundedRect(96, 8, 40, 14, 2, 2, "FD");
    doc.setTextColor(accentIndigo);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.text("SUBMISSION CONFIRMED", 98, 14.5);
    doc.setFontSize(7);
    doc.text("FREE REGISTRATION", 103, 19.5);
  }

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(12, 32, 136, 32);

  // ── Meta Details (Reference ID & Date) ───────────────────────────────────
  let y = 38;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(12, y - 2, 124, 18, 1.5, 1.5, "F");

  // Row 1: Reference ID
  doc.setTextColor(secondaryColor);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("REFERENCE / APP ID:", 16, y + 4.5);

  doc.setTextColor(accentIndigo);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(data.requestId, 56, y + 4.5);

  // Row 2: Date & Time (Cleanly placed below Reference ID)
  doc.setTextColor(secondaryColor);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("SUBMITTED DATE & TIME:", 16, y + 12);

  doc.setTextColor(primaryColor);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.text(data.submittedAt, 56, y + 12);

  y += 24;

  // ── Section 1: Business Details ──────────────────────────────────────────
  doc.setTextColor(accentIndigo);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.text("1. BUSINESS INFORMATION", 12, y);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(12, y + 2, 136, y + 2);

  y += 8;

  const renderRow = (label: string, value: string, isValueBold = false) => {
    doc.setTextColor(secondaryColor);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.text(label, 14, y);

    doc.setTextColor(primaryColor);
    doc.setFont("Helvetica", isValueBold ? "bold" : "normal");
    doc.setFontSize(8);

    // Auto-wrap long values if needed
    const splitText = doc.splitTextToSize(value || "N/A", 75);
    doc.text(splitText, 52, y);
    y += splitText.length * 4.5 + 1.5;
  };

  renderRow("Business Name:", data.businessName, true);
  renderRow("Category:", data.category);
  if (data.operatingHours) {
    renderRow("Business Hours:", data.operatingHours);
  }
  renderRow("Location:", data.location);
  if (data.addressDetails) {
    renderRow("Street Address:", data.addressDetails);
  }

  y += 3;

  // ── Section 2: Owner & Contact Details ──────────────────────────────────
  doc.setTextColor(accentIndigo);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.text("2. APPLICANT & CONTACT DETAILS", 12, y);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(12, y + 2, 136, y + 2);

  y += 8;

  renderRow("Owner / Contact:", data.ownerName, true);
  renderRow("Phone Number:", data.contactNumber);
  renderRow("WhatsApp Number:", data.whatsappNumber);
  if (data.email) {
    renderRow("Email Address:", data.email);
  }
  if (data.employeeName) {
    renderRow("Field Representative:", data.employeeName);
  }

  y += 3;

  // ── Section 3: Payment & Transaction Information ─────────────────────────
  doc.setTextColor(accentIndigo);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.text("3. PAYMENT & TRANSACTION SUMMARY", 12, y);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(12, y + 2, 136, y + 2);

  y += 8;

  renderRow("Application Fee:", `INR ${data.amount.toFixed(2)}`, true);
  if (data.paymentId) {
    renderRow("Razorpay Payment ID:", data.paymentId, true);
  }
  renderRow("Payment Status:", isPaid ? "SUCCESSFUL / VERIFIED" : "FREE / NO CHARGE", true);

  // ── Footer Notice & Watermark ───────────────────────────────────────────
  const footerY = 188;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(12, footerY - 2, 124, 16, 1.5, 1.5, "F");

  doc.setTextColor(secondaryColor);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7);
  doc.text("IMPORTANT NOTICE & NEXT STEPS:", 16, footerY + 2);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(lightMuted);
  doc.text(
    "Your application is now under executive verification. You will receive updates via WhatsApp/SMS.",
    16,
    footerY + 6.5
  );
  doc.text(
    "For inquiries, contact Helpline: +91 8339977383 or Email: findmypoint.india@gmail.com",
    16,
    footerY + 11
  );

  // Auto-Save PDF file
  const sanitizedName = data.businessName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 15);
  const fileName = `FindMyPoint_Receipt_${sanitizedName}_${data.requestId.slice(-6)}.pdf`;
  doc.save(fileName);
};
