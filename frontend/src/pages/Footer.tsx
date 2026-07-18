import { useState, useEffect } from "react";
import logoImg from "@/assets/logo.png";
import { loadFooterData, FooterData } from "../data/footerData";
import { API_BASE_URL } from "../config";
import { Briefcase, Phone, MapPin, Calendar, Heart, ShieldCheck, X, Search, CheckCircle2, User, Image as ImageIcon } from "lucide-react";
import { useCategories } from "../context/CategoryContext";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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

export default function Footer() {
  const [footerData, setFooterData] = useState<FooterData>(loadFooterData);

  const loadFooter = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/footer`);
      const data = await res.json();
      if (data.success && data.footer) {
        setFooterData(data.footer);
      } else {
        setFooterData(loadFooterData());
      }
    } catch (err) {
      console.error("Failed to load footer from backend:", err);
      setFooterData(loadFooterData());
    }
  };

  const [showIdInput, setShowIdInput] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [searchError, setSearchError] = useState("");
  const [foundEmployee, setFoundEmployee] = useState<Employee | null>(null);

  const GEOGRAPHY_DATA: Record<string, Record<string, string[]>> = {
    India: {
      "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain"],
      Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Anand"],
      Maharashtra: ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
      Delhi: ["New Delhi", "North Delhi", "South Delhi", "West Delhi"]
    },
    Canada: {
      Ontario: ["Toronto", "Ottawa", "Mississauga", "Hamilton"],
      Quebec: ["Montreal", "Quebec City", "Laval", "Gatineau"],
      "British Columbia": ["Vancouver", "Victoria", "Burnaby", "Richmond"]
    },
    Australia: {
      "New South Wales": ["Sydney", "Newcastle", "Wollongong"],
      Victoria: ["Melbourne", "Geelong", "Ballarat"],
      Queensland: ["Brisbane", "Gold Coast", "Sunshine Coast"]
    },
    USA: {
      California: ["Los Angeles", "San Diego", "San Jose", "San Francisco"],
      Texas: ["Houston", "San Antonio", "Dallas", "Austin"],
      "New York": ["New York City", "Buffalo", "Rochester", "Yonkers"]
    }
  };

  const CALLING_CODES = ["+91", "+1", "+44", "+61", "+65", "+971"];
  const BUSINESS_CATEGORIES = [
    "Restaurant",
    "Hotel",
    "Hospital",
    "Shopping Mall",
    "Automobile",
    "Education",
    "Real Estate",
    "Finance",
    "Saloon & Spa",
    "Gym & Fitness",
    "Other"
  ];

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  // Form Fields
  const { categories } = useCategories();
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("Restaurant");

  useEffect(() => {
    if (categories && categories.length > 0) {
      setCategory(categories[0].label);
    }
  }, [categories]);
  const [ownerName, setOwnerName] = useState("");
  const [contactCode, setContactCode] = useState("+91");
  const [contactNo, setContactNo] = useState("");
  const [whatsappCode, setWhatsappCode] = useState("+91");
  const [whatsappNo, setWhatsappNo] = useState("");
  const [email, setEmail] = useState("");
  const [addressDetails, setAddressDetails] = useState("");
  const [photos, setPhotos] = useState<string[]>(["", "", "", ""]);
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [openHour, setOpenHour] = useState("09");
  const [openMinute, setOpenMinute] = useState("00");
  const [openPeriod, setOpenPeriod] = useState("AM");
  const [closeHour, setCloseHour] = useState("09");
  const [closeMinute, setCloseMinute] = useState("00");
  const [closePeriod, setClosePeriod] = useState("PM");
  const [isTimeMandatory, setIsTimeMandatory] = useState(true);

  useEffect(() => {
    if (isTimeMandatory) {
      setOpenTime(`${openHour}:${openMinute} ${openPeriod}`);
      setCloseTime(`${closeHour}:${closeMinute} ${closePeriod}`);
    } else {
      setOpenTime("");
      setCloseTime("");
    }
  }, [openHour, openMinute, openPeriod, closeHour, closeMinute, closePeriod, isTimeMandatory]);

  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const [town, setTown] = useState("");
  const [city, setCity] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [employeeName, setEmployeeName] = useState("None");

  // Payment states
  const [isPaymentStep, setIsPaymentStep] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [listingRequestFee, setListingRequestFee] = useState("500");
  const [currentRequestId, setCurrentRequestId] = useState("");
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  // Load employees from database for dropdown selection
  useEffect(() => {
    if (showLeadForm) {
      loadRazorpayScript();
      fetch(`${API_BASE_URL}/employees/public`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.employees) {
            const mapped = data.employees.map((emp: any) => ({
              ...emp,
              id: emp._id
            }));
            setEmployees(mapped);
          }
        })
        .catch((err) => {
          console.error("Failed to load employees for selection:", err);
        });

      fetch(`${API_BASE_URL}/business-requests/fee`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.amount !== undefined) {
            setListingRequestFee(data.amount.toString());
          }
        })
        .catch((err) => {
          console.error("Failed to load listing fee from backend:", err);
          const savedFee = localStorage.getItem("fmp_listing_request_fee:v1");
          if (savedFee) {
            setListingRequestFee(savedFee);
          }
        });

      const states = Object.keys(GEOGRAPHY_DATA["India"] || {});
      setState(states[0] || "");
      const districts = GEOGRAPHY_DATA["India"]?.[states[0] || ""] || [];
      setDistrict(districts[0] || "");
    }
  }, [showLeadForm]);

  // Adjust State and District when Country changes
  useEffect(() => {
    const states = Object.keys(GEOGRAPHY_DATA[country] || {});
    setState(states[0] || "");
    const districts = GEOGRAPHY_DATA[country]?.[states[0] || ""] || [];
    setDistrict(districts[0] || "");
  }, [country]);

  // Adjust District when State changes
  useEffect(() => {
    if (state) {
      const districts = GEOGRAPHY_DATA[country]?.[state] || [];
      setDistrict(districts[0] || "");
    } else {
      setDistrict("");
    }
  }, [state]);

  const handlePhotoUpload = (index: number, file: File | null) => {
    if (!file) {
      const newPhotos = [...photos];
      newPhotos[index] = "";
      setPhotos(newPhotos);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhotos = [...photos];
      newPhotos[index] = reader.result as string;
      setPhotos(newPhotos);
    };
    reader.readAsDataURL(file);
  };

  const triggerRazorpayCheckout = (requestId: string, order: any) => {
    if (!order) return;
    setIsProcessingPayment(true);
    const userToken = localStorage.getItem("fmp_user_token");

    const options = {
      key: "rzp_test_S3IcSS1NbymL6D", // Matching env Key ID
      amount: order.amount, // in paise
      currency: order.currency,
      name: "FindmyPoint",
      description: `Listing fee for ${businessName}`,
      order_id: order.id,
      handler: async (response: any) => {
        try {
          const resSubmit = await fetch(`${API_BASE_URL}/business-requests/verify-payment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${userToken}`
            },
            body: JSON.stringify({
              requestId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            })
          });

          const submitData = await resSubmit.json();
          if (submitData.success) {
            alert(`Payment of ₹${listingRequestFee} verified successfully! Business request submitted.`);
            setIsPaymentStep(false);
            setShowLeadForm(false);

            // Reset form states
            setBusinessName("");
            setCategory("Restaurant");
            setOwnerName("");
            setContactNo("");
            setWhatsappNo("");
            setEmail("");
            setAddressDetails("");
            setPhotos(["", "", "", ""]);
            setOpenHour("09");
            setOpenMinute("00");
            setOpenPeriod("AM");
            setCloseHour("09");
            setCloseMinute("00");
            setClosePeriod("PM");
            setIsTimeMandatory(true);
            setCountry("India");
            setArea("");
            setTown("");
            setCity("");
            setPinCode("");
            setEmployeeName("None");
            setCurrentRequestId("");
            setCurrentOrder(null);
          } else {
            alert(submitData.message || "Payment verification failed.");
          }
        } catch (verifyErr) {
          console.error("Verification error:", verifyErr);
          alert("Payment signature verification failed.");
        } finally {
          setIsProcessingPayment(false);
        }
      },
      prefill: {
        name: ownerName,
        email: email,
        contact: contactNo
      },
      theme: {
        color: "#4f46e5"
      },
      modal: {
        ondismiss: () => {
          setIsProcessingPayment(false);
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const handleLeadFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (photos.some((p) => !p)) {
      alert("Please upload exactly 4 business photos.");
      return;
    }
    setIsSubmittingForm(true);

    try {
      const userToken = localStorage.getItem("fmp_user_token");
      const requestData = {
        businessName,
        category,
        ownerName,
        contactNumber: `${contactCode} ${contactNo}`,
        whatsappNumber: `${whatsappCode} ${whatsappNo}`,
        email,
        addressDetails,
        photos,
        openTime: openTime || "",
        closeTime: closeTime || "",
        isTimeMandatory,
        country,
        state,
        district,
        area,
        town,
        city,
        pinCode,
        employeeName
      };

      const res = await fetch(`${API_BASE_URL}/business-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await res.json();
      if (data.success) {
        setCurrentRequestId(data.request._id);
        setCurrentOrder(data.order);
        setIsPaymentStep(true);
        setIsSubmittingForm(false);
        
        // Auto trigger popup
        triggerRazorpayCheckout(data.request._id, data.order);
      } else {
        alert(data.message || "Failed to submit request.");
        setIsSubmittingForm(false);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Network error submitting business request.");
      setIsSubmittingForm(false);
    }
  };

  const handleFinalPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerRazorpayCheckout(currentRequestId, currentOrder);
  };

  const handleSearchEmployee = async () => {
    const id = searchId.trim();
    if (!id) {
      setSearchError("Please enter an ID");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/employees/verify/${encodeURIComponent(id)}`);
      const data = await res.json();
      if (data.success && data.employee) {
        setFoundEmployee({
          ...data.employee,
          id: data.employee._id
        });
        setShowIdInput(false);
        setSearchId("");
        setSearchError("");
      } else {
        setSearchError(`Employee not found with ID: ${id}`);
      }
    } catch (err) {
      console.error("Error searching employee:", err);
      setSearchError("Network error checking employee ID.");
    }
  };

  useEffect(() => {
    loadFooter();

    const handleSync = () => {
      loadFooter();
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("fmp_footer_changed", handleSync);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("fmp_footer_changed", handleSync);
    };
  }, []);

  return (
    <footer className="mt-24 border-t border-border hidden sm:block">
      <div className="mx-auto max-w-7xl px-6 py-16 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-1 sm:col-span-2">
            <a href="/" className="flex items-center">
              <img
                src={logoImg}
                alt="FindMyPoint Logo"
                className="h-8 w-auto object-contain"
                style={{ mixBlendMode: "multiply" }}
              />
            </a>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">{footerData.tagline}</p>

            {/* Dynamic Social Links */}
            <div className="mt-6 flex gap-2.5">
              {[
                {
                  id: "facebook",
                  color: "bg-[#1877f2] text-white hover:scale-110",
                  svg: (
                    <svg
                      className="h-4 w-4 fill-white"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
                    </svg>
                  ),
                },
                {
                  id: "youtube",
                  color: "bg-[#ff0000] text-white hover:scale-110",
                  svg: (
                    <svg
                      className="h-4.5 w-4.5 fill-white"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.513 3.545 12 3.545 12 3.545s-7.513 0-9.388.51C1.238 4.397.518 5.12.51 6.163.008 8.054.008 12 .008 12s0 3.945.502 5.837c.078 1.043.798 1.766 1.702 1.97 1.875.502 9.388.502 9.388.502s7.513 0 9.388-.502a2.997 2.997 0 0 0 2.11-2.108c.502-1.892.502-5.837.502-5.837s0-3.946-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  ),
                },
                {
                  id: "instagram",
                  color:
                    "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white hover:scale-110",
                  svg: (
                    <svg
                      className="h-4 w-4 stroke-white fill-none stroke-[2.2]"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  ),
                },
                {
                  id: "linkedin",
                  color: "bg-[#0a66c2] text-white hover:scale-110",
                  svg: (
                    <svg
                      className="h-4.5 w-4.5 fill-white"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  ),
                },
                {
                  id: "x",
                  color: "bg-[#000000] text-white hover:scale-110",
                  svg: (
                    <svg
                      className="h-3.5 w-3.5 fill-white"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ),
                },
              ].map((item) => {
                const socialConfig = footerData.socials.find((s) => s.id === item.id);
                if (!socialConfig || !socialConfig.show) return null;
                return (
                  <a
                    key={item.id}
                    href={socialConfig.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-300 shadow-sm ${item.color}`}
                  >
                    {item.svg}
                  </a>
                );
              })}
            </div>

            {/* App Download Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {/* Google Play Button */}
              <a
                href={footerData.playstoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-xl bg-[#111111] hover:bg-black text-white px-3 py-1.5 transition-all duration-300 shadow-sm border border-white/10 cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M1.9 22.1l13.56-10.1L1.9 1.9c-.06.22-.09.46-.09.7v18.8c0 .24.03.48.09.7"
                    fill="#3bccff"
                  />
                  <path
                    d="M16.14 11.3l-3.26-3.26L2.3 1.22c.3-.18.66-.22 1.02-.02l12.82 7.32"
                    fill="#00e676"
                  />
                  <path
                    d="M21.97 12.74a1.66 1.66 0 0 0-.03-1.48l-3.37-1.92-3.15 3.16 3.15 3.16 3.37-1.92"
                    fill="#ffe000"
                  />
                  <path
                    d="M16.14 12.7l-3.26 3.26L2.3 22.78c.3.18.66.22 1.02.02l12.82-7.32"
                    fill="#ff3a44"
                  />
                </svg>
                <div className="flex flex-col text-left">
                  <span className="text-[8px] font-semibold text-white/70 uppercase tracking-widest leading-none">
                    GET IT ON
                  </span>
                  <span className="text-[11px] font-bold leading-tight mt-0.5">Google Play</span>
                </div>
              </a>

              {/* App Store Button */}
              <a
                href={footerData.appstoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-xl bg-[#111111] hover:bg-black text-white px-3 py-1.5 transition-all duration-300 shadow-sm border border-white/10 cursor-pointer"
              >
                <svg
                  className="h-4.5 w-4.5 fill-white"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.502 12.06 1.002 1.45 2.19 3.078 3.76 3.02 1.514-.06 2.09-.98 3.916-.98 1.81 0 2.333.98 3.917.948 1.606-.027 2.648-1.48 3.627-2.9 1.13-1.656 1.597-3.26 1.623-3.342-.03-.015-3.107-1.192-3.137-4.747-.025-2.978 2.443-4.41 2.56-4.484-1.393-2.04-3.548-2.27-4.316-2.32-2-.162-3.9 1.231-4.918 1.231zm2.33-4.57c.896-1.082 1.5-2.585 1.332-4.086-1.286.05-2.85.856-3.774 1.938-.796.918-1.492 2.455-1.304 3.925 1.438.113 2.875-.722 3.746-1.777z" />
                </svg>
                <div className="flex flex-col text-left">
                  <span className="text-[8px] font-semibold text-white/70 leading-none">
                    Download on the
                  </span>
                  <span className="text-[11px] font-bold leading-tight mt-0.5">App Store</span>
                </div>
              </a>
            </div>
          </div>

          {/* Static link segments remain unchanged */}
          {[
            ["Company", ["About", "Search Employee"]],
            ["Business", ["Advertise", "Lead Generator"]],
            ["Support", ["Help Centre", "Privacy Policy", "Terms & Conditions"]],
          ].map(([h, items]) => (
            <div key={h as string}>
              <h5 className="text-sm font-semibold">{h as string}</h5>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {(items as string[]).map((i) => (
                  <li key={i}>
                    {i === "Lead Generator" ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const userToken = localStorage.getItem("fmp_user_token");
                          if (!userToken) {
                            window.dispatchEvent(new CustomEvent("fmp-open-signin"));
                            return;
                          }
                          setShowLeadForm(true);
                        }}
                        className="transition hover:text-foreground text-left cursor-pointer bg-transparent border-none p-0 text-sm text-muted-foreground font-normal"
                      >
                        {i}
                      </button>
                    ) : i === "Search Employee" ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setShowIdInput(true);
                        }}
                        className="transition hover:text-foreground text-left cursor-pointer bg-transparent border-none p-0 text-sm text-muted-foreground font-normal"
                      >
                        {i}
                      </button>
                    ) : i === "Advertise" ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          window.dispatchEvent(new CustomEvent("fmp-open-advertise"));
                        }}
                        className="transition hover:text-foreground text-left cursor-pointer bg-transparent border-none p-0 text-sm text-muted-foreground font-normal"
                      >
                        {i}
                      </button>
                    ) : i === "Privacy Policy" || i === "Terms & Conditions" ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          window.dispatchEvent(
                            new CustomEvent("fmp-open-page", { detail: "Policy" }),
                          );
                        }}
                        className="transition hover:text-foreground text-left cursor-pointer bg-transparent border-none p-0 text-sm text-muted-foreground font-normal"
                      >
                        {i}
                      </button>
                    ) : i === "Help Centre" ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          window.dispatchEvent(
                            new CustomEvent("fmp-open-page", { detail: "Help" }),
                          );
                        }}
                        className="transition hover:text-foreground text-left cursor-pointer bg-transparent border-none p-0 text-sm text-muted-foreground font-normal"
                      >
                        {i}
                      </button>
                    ) : (
                      <a href="#" className="transition hover:text-foreground">
                        {i}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Dynamic Copyright block */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>{footerData.copyright}</p>
        </div>
      </div>
      {/* Search Employee ID Modal */}
      {showIdInput && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800/80 max-w-sm w-full p-6 space-y-5 relative overflow-hidden animate-zoom-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
                Verify Employee
              </span>
              <button
                onClick={() => {
                  setShowIdInput(false);
                  setSearchError("");
                }}
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-955 hover:bg-rose-50 dark:hover:bg-rose-955/20 text-slate-450 hover:text-rose-600 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-center sm:text-left">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Enter Employee ID
              </h3>
              <p className="text-[11px] text-slate-450 dark:text-slate-400 font-semibold leading-relaxed">
                Scan or type the unique employee ID number to view the digital ID Card
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="e.g. FMPEMP001"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-955 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono font-bold tracking-wide uppercase"
              />
              {searchError && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold text-center">
                  {searchError}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowIdInput(false);
                  setSearchError("");
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSearchEmployee}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee ID Card Viewer Modal */}
      {foundEmployee && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-150 dark:border-slate-800/80 max-w-[300px] w-full relative overflow-hidden flex flex-col items-stretch animate-zoom-in">
            {/* Top Lanyard Handle Cutout */}
            <div className="w-16 h-3 bg-slate-200 dark:bg-slate-850 rounded-full mx-auto mt-4 mb-2 shrink-0" />

            {/* Close Button positioned absolutely on the top right */}
            <button
              onClick={() => setFoundEmployee(null)}
              className="absolute top-3.5 right-3.5 h-7 w-7 z-20 flex items-center justify-center rounded-lg bg-white/70 hover:bg-rose-50 dark:bg-slate-800/50 dark:hover:bg-rose-950/20 text-slate-500 hover:text-rose-600 transition cursor-pointer shadow-sm border border-slate-200/40"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Slanted Header Design Accents */}
            <div className="relative h-24 overflow-hidden shrink-0 bg-slate-50 dark:bg-slate-950/25 border-b border-slate-100 dark:border-slate-800/30">
              {/* Blue-grey accent slant */}
              <div className="absolute top-0 right-0 w-[55%] h-32 bg-[#6b8bae]/20 dark:bg-[#6b8bae]/10 rounded-bl-[80px] z-0" />
              {/* Navy accent slant */}
              <div className="absolute top-10 right-0 w-[35%] h-24 bg-slate-900 rounded-bl-[60px] z-0 transform rotate-6 opacity-80" />

              {/* Logo block in header */}
              <div className="absolute top-3 left-5 z-10 flex items-center">
                <img src={logoImg} alt="FindMyPoint Logo" className="h-4.5 w-auto object-contain" />
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

              {foundEmployee.photo ? (
                <img
                  src={foundEmployee.photo}
                  alt={foundEmployee.name}
                  className="h-28 w-28 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-md"
                />
              ) : (
                <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-2xl border-4 border-white dark:border-slate-900 shadow-md">
                  {foundEmployee.name.split(" ").map(p => p[0]).join("").substring(0, 2).toUpperCase() || "E"}
                </div>
              )}
            </div>

            {/* Employee Name & Title */}
            <div className="px-6 text-center mt-3.5 shrink-0">
              <h3 className="text-[15px] font-black text-slate-900 dark:text-white tracking-wide uppercase leading-snug">
                {foundEmployee.name}
              </h3>
              <p className="text-[8px] font-bold text-[#6b8bae] dark:text-[#8cb2d9] uppercase tracking-[0.15em] mt-0.5 leading-none">
                {foundEmployee.designation}
              </p>
              {/* Thin separator line */}
              <div className="w-12 h-[1px] bg-slate-200 dark:bg-slate-800 mx-auto mt-2.5" />
            </div>

            {/* Details List */}
            <div className="px-6 py-4.5 space-y-3.5 flex-1">

              {/* ID Number */}
              <div className="flex items-center gap-3">
                <div className="h-6.5 w-6.5 rounded-full bg-indigo-50 dark:bg-slate-950 text-indigo-650 dark:text-slate-450 flex items-center justify-center shrink-0 border border-indigo-100/50 dark:border-slate-800">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div className="text-left leading-none">
                  <span className="text-[7.5px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">ID Number</span>
                  <span className="text-[11.5px] text-slate-800 dark:text-slate-200 font-extrabold mt-0.5 block font-mono">{foundEmployee.empIdNumber}</span>
                </div>
              </div>

              {/* Designation */}
              <div className="flex items-center gap-3">
                <div className="h-6.5 w-6.5 rounded-full bg-indigo-50 dark:bg-slate-950 text-indigo-650 dark:text-slate-450 flex items-center justify-center shrink-0 border border-indigo-100/50 dark:border-slate-800">
                  <Briefcase className="h-3.5 w-3.5" />
                </div>
                <div className="text-left leading-none">
                  <span className="text-[7.5px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Designation</span>
                  <span className="text-[11.5px] text-slate-800 dark:text-slate-200 font-extrabold mt-0.5 block">{foundEmployee.designation}</span>
                </div>
              </div>

              {/* Contact */}
              <div className="flex items-center gap-3">
                <div className="h-6.5 w-6.5 rounded-full bg-indigo-50 dark:bg-slate-950 text-indigo-650 dark:text-slate-450 flex items-center justify-center shrink-0 border border-indigo-100/50 dark:border-slate-800">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <div className="text-left leading-none">
                  <span className="text-[7.5px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Contact Number</span>
                  <span className="text-[11.5px] text-slate-800 dark:text-slate-200 font-extrabold mt-0.5 block">{foundEmployee.contactNumber}</span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3">
                <div className="h-6.5 w-6.5 rounded-full bg-indigo-50 dark:bg-slate-950 text-indigo-650 dark:text-slate-450 flex items-center justify-center shrink-0 border border-indigo-100/50 dark:border-slate-800">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div className="text-left leading-none">
                  <span className="text-[7.5px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Field Location</span>
                  <span className="text-[11.5px] text-slate-800 dark:text-slate-200 font-extrabold mt-0.5 block">{foundEmployee.fieldLocation || "Not Assigned"}</span>
                </div>
              </div>

            </div>

            {/* Issued & Validity Footer */}
            <div className="px-5 py-4 bg-slate-50 dark:bg-slate-955 border-t border-slate-150/80 dark:border-slate-800 flex items-center justify-between text-left shrink-0">
              <div>
                <span className="text-[7.5px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block leading-none">ISSUED:</span>
                <span className="text-[9.5px] font-black text-slate-700 dark:text-slate-350 uppercase mt-1 block leading-none">{foundEmployee.joinedDate}</span>
              </div>
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />
              <div>
                <span className="text-[7.5px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block leading-none">STATUS:</span>
                <span className={`text-[9.5px] font-black uppercase mt-1 block leading-none ${foundEmployee.isValidWorking ? "text-emerald-600" : "text-rose-600"}`}>
                  {foundEmployee.isValidWorking ? "ACTIVE STAFF" : "INACTIVE"}
                </span>
              </div>
            </div>

          </div>
        </div>
      )}
      {/* Field Work Listing Form Modal */}
      {showLeadForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800/80 max-w-2xl w-full relative overflow-hidden flex flex-col max-h-[90vh] animate-zoom-in">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                    Field Work Listing Form
                  </h3>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                    Submit new business listing requests
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowLeadForm(false)}
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-955 hover:bg-rose-50 dark:hover:bg-rose-955/20 text-slate-450 hover:text-rose-600 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form Fields Container */}
            {!isPaymentStep ? (
              <form onSubmit={handleLeadFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">

                {/* Part 1: Core Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Business Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vishal Mega Mart"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-955 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                    />
                  </div>

                  {/* Category of Business */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                      Category of Business *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-955 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                    >
                      {categories.length > 0 ? (
                        categories.map((cat) => (
                          <option key={cat._id} value={cat.label}>
                            {cat.label}
                          </option>
                        ))
                      ) : (
                        BUSINESS_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Owner Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-955 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                    />
                  </div>

                  {/* E-mail */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. owner@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-955 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                      Contact Number *
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={contactCode}
                        onChange={(e) => setContactCode(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-955 text-xs px-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                      >
                        {CALLING_CODES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        required
                        placeholder="9876543210"
                        value={contactNo}
                        onChange={(e) => setContactNo(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-slate-955 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  {/* WhatsApp Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                      WhatsApp Number *
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={whatsappCode}
                        onChange={(e) => setWhatsappCode(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-955 text-xs px-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                      >
                        {CALLING_CODES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        required
                        placeholder="Same as contact or WhatsApp no"
                        value={whatsappNo}
                        onChange={(e) => setWhatsappNo(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-slate-955 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                      />
                    </div>
                  </div>

                </div>

                {/* Part 2: Address Geography */}
                <div className="bg-slate-50/50 dark:bg-slate-955/20 border border-slate-100 dark:border-slate-850/60 rounded-2xl p-4.5 space-y-4">
                  <span className="text-[11px] font-bold text-indigo-650 dark:text-indigo-400 tracking-wider block">
                    Location & Address Details
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Country Selection */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                        Country *
                      </label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                      >
                        {Object.keys(GEOGRAPHY_DATA).map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* State Selection */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                        State *
                      </label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                      >
                        {Object.keys(GEOGRAPHY_DATA[country] || {}).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* District Selection */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                        District *
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                      >
                        {(GEOGRAPHY_DATA[country]?.[state] || []).map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Area */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                        Area *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Saket"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full bg-white dark:bg-slate-955 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                      />
                    </div>

                    {/* Town */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                        Town *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Anand town"
                        value={town}
                        onChange={(e) => setTown(e.target.value)}
                        className="w-full bg-white dark:bg-slate-955 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                      />
                    </div>

                    {/* Pin number */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                        Pin Code *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 452001"
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        className="w-full bg-white dark:bg-slate-955 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono font-semibold"
                      />
                    </div>
                  </div>

                  {/* Specific Location Address Details */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                      Specific Location Address Details *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Enter precise street address, landmarks, etc."
                      value={addressDetails}
                      onChange={(e) => setAddressDetails(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold resize-none"
                    />
                  </div>
                </div>

                {/* Part 3: Hours (With mandatory/not mandatory toggle) */}
                <div className="bg-slate-50/50 dark:bg-slate-955/20 border border-slate-100 dark:border-slate-850/60 rounded-2xl p-4.5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-650 dark:text-indigo-400 tracking-wider">
                      Business Hours (Open & Close Time)
                    </span>

                    {/* Mandatory Toggle Switch */}
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wide">
                        {isTimeMandatory ? "Mandatory" : "Not Mandatory"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsTimeMandatory(!isTimeMandatory)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${isTimeMandatory ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-800"
                          }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-205 ease-in-out ${isTimeMandatory ? "translate-x-4" : "translate-x-0"
                            }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Open Time */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                        Open Time {isTimeMandatory ? "*" : ""}
                      </label>
                      <div className="flex gap-1.5 items-center">
                        {/* Hour */}
                        <select
                          disabled={!isTimeMandatory}
                          value={openHour}
                          onChange={(e) => setOpenHour(e.target.value)}
                          className="flex-1 bg-white dark:bg-slate-955 text-xs px-2.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 transition-all font-semibold disabled:opacity-50"
                        >
                          {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0")).map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <span className="text-slate-400 font-bold">:</span>
                        {/* Minute */}
                        <select
                          disabled={!isTimeMandatory}
                          value={openMinute}
                          onChange={(e) => setOpenMinute(e.target.value)}
                          className="flex-1 bg-white dark:bg-slate-955 text-xs px-2.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 transition-all font-semibold disabled:opacity-50"
                        >
                          {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0")).map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        {/* AM/PM */}
                        <select
                          disabled={!isTimeMandatory}
                          value={openPeriod}
                          onChange={(e) => setOpenPeriod(e.target.value)}
                          className="bg-white dark:bg-slate-955 text-xs px-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 transition-all font-semibold disabled:opacity-50"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>

                    {/* Close Time */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                        Close Time {isTimeMandatory ? "*" : ""}
                      </label>
                      <div className="flex gap-1.5 items-center">
                        {/* Hour */}
                        <select
                          disabled={!isTimeMandatory}
                          value={closeHour}
                          onChange={(e) => setCloseHour(e.target.value)}
                          className="flex-1 bg-white dark:bg-slate-955 text-xs px-2.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 transition-all font-semibold disabled:opacity-50"
                        >
                          {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0")).map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <span className="text-slate-400 font-bold">:</span>
                        {/* Minute */}
                        <select
                          disabled={!isTimeMandatory}
                          value={closeMinute}
                          onChange={(e) => setCloseMinute(e.target.value)}
                          className="flex-1 bg-white dark:bg-slate-955 text-xs px-2.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 transition-all font-semibold disabled:opacity-50"
                        >
                          {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0")).map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        {/* AM/PM */}
                        <select
                          disabled={!isTimeMandatory}
                          value={closePeriod}
                          onChange={(e) => setClosePeriod(e.target.value)}
                          className="bg-white dark:bg-slate-955 text-xs px-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 transition-all font-semibold disabled:opacity-50"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Part 4: Upload exactly 4 photos */}
                <div className="bg-slate-50/50 dark:bg-slate-955/20 border border-slate-100 dark:border-slate-850/60 rounded-2xl p-4.5 space-y-4">
                  <span className="text-[11px] font-bold text-indigo-650 dark:text-indigo-400 tracking-wider block">
                    Business Photos (Upload exactly 4 clicks) *
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl bg-white dark:bg-slate-950 border border-dashed border-slate-250 dark:border-slate-800 hover:border-indigo-500 transition-all flex flex-col items-center justify-center overflow-hidden"
                      >
                        {photos[idx] ? (
                          <>
                            <img
                              src={photos[idx]}
                              alt={`Upload ${idx + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handlePhotoUpload(idx, null)}
                              className="absolute top-1 right-1 h-5 w-5 bg-rose-500/80 hover:bg-rose-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center p-2 cursor-pointer">
                            <ImageIcon className="h-5 w-5 text-slate-400" />
                            <span className="text-[9px] text-slate-400 font-bold mt-1">Photo {idx + 1}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePhotoUpload(idx, e.target.files?.[0] || null)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Part 5: Employee Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    Submitted By (Employee) *
                  </label>
                  <select
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-955 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                  >
                    <option value="None">None</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name} ({emp.empIdNumber})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Footer Form Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowLeadForm(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingForm}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-650/60 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/10 disabled:cursor-not-allowed"
                  >
                    {isSubmittingForm ? (
                      <>
                        <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>

              </form>
            ) : (
              <form onSubmit={handleFinalPaymentSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar text-center">
                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-955/20 border border-slate-100 dark:border-slate-850/60 rounded-2xl p-5 text-center space-y-2">
                    <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
                      Secure Listing Payment
                    </span>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white">
                      ₹{listingRequestFee}
                    </h4>
                    <p className="text-[11px] text-slate-450 dark:text-slate-400 font-semibold leading-relaxed">
                      Pay the listing request fee to submit the business request for admin review.
                    </p>
                  </div>

                  <div className="bg-slate-50/50 dark:bg-slate-955/20 border border-slate-100 dark:border-slate-850/60 rounded-2xl p-4.5 space-y-3.5 text-left text-xs font-semibold">
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider block">
                      Request Summary
                    </span>
                    <div className="space-y-2 text-slate-700 dark:text-slate-350">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">Business Name</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">{businessName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">Owner Name</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">{ownerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">Category</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">{category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">Location</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">{district}, {state}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Form Actions */}
                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80 shrink-0">
                    <button
                      type="button"
                      disabled={isProcessingPayment}
                      onClick={() => setIsPaymentStep(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Back to Edit
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessingPayment}
                      className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-700 disabled:bg-indigo-650/60 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/10 disabled:cursor-not-allowed animate-pulse"
                    >
                      {isProcessingPayment ? (
                        <>
                          <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Pay with Razorpay
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
