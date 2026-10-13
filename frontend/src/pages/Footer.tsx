import { useState, useEffect, useRef } from "react";
import logoImg from "@/assets/logo.png";
import { loadFooterData, FooterData } from "../data/footerData";
import { API_BASE_URL, RAZORPAY_KEY_ID } from "../config";
import {
  Briefcase,
  Phone,
  MapPin,
  Calendar,
  Heart,
  ShieldCheck,
  X,
  Search,
  CheckCircle2,
  User,
  Image as ImageIcon,
  Download,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Camera,
  UploadCloud,
  SwitchCamera,
  RotateCcw,
  CameraOff,
  AlertCircle,
  ExternalLink,
  Navigation,
  Clock,
  CreditCard,
} from "lucide-react";
import { useCategories } from "../context/CategoryContext";
import { LazyImage } from "../components/ui/LazyImage";
import statesAndDistricts from "../data/states-and-districts.json";
import { compressImageFile } from "../utils/imageCompressor";
import CelebrationConfetti from "../components/CelebrationConfetti";
import { generateLeadReceiptPDF, LeadReceiptData } from "../utils/leadReceiptGenerator";

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
  const [locationUrl, setLocationUrl] = useState("");
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [photos, setPhotos] = useState<string[]>(["", "", "", "", "", ""]);

  // Camera & Photo Source modal states
  const [activePhotoSlot, setActivePhotoSlot] = useState<number | null>(null);
  const [showPhotoSourceModal, setShowPhotoSourceModal] = useState(false);
  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<"user" | "environment">("environment");
  const [capturedPhotoTemp, setCapturedPhotoTemp] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraStarting, setIsCameraStarting] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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

  // OTP states for Lead Generator
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpMessage, setOtpMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // OTP Countdown timer
  useEffect(() => {
    let interval: any = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleSendOtp = async () => {
    const cleanPhone = contactNo.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      alert("Please enter a valid 10-digit contact number first.");
      return;
    }
    setIsSendingOtp(true);
    setOtpMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone })
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setOtpTimer(60);
        setOtpMessage({ type: "success", text: data.message || "OTP sent successfully!" });
      } else {
        setOtpMessage({ type: "error", text: data.message || "Failed to send OTP." });
        alert(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      setOtpMessage({ type: "error", text: "Network error sending OTP." });
      alert("Network error sending OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanPhone = contactNo.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      alert("Please enter a valid 10-digit contact number.");
      return;
    }
    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      alert("Please enter the complete 6-digit OTP.");
      return;
    }
    setIsVerifyingOtp(true);
    setOtpMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, otp: cleanOtp })
      });
      const data = await res.json();
      if (data.success) {
        if (data.token) {
          localStorage.setItem("fmp_user_token", data.token);
        }
        setIsOtpVerified(true);
        setOtpMessage({ type: "success", text: "Mobile number verified successfully!" });
      } else {
        setOtpMessage({ type: "error", text: data.message || "Invalid OTP code." });
        alert(data.message || "Invalid OTP code.");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setOtpMessage({ type: "error", text: "Network error verifying OTP." });
      alert("Network error verifying OTP.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Payment & Success states
  const [isPaymentStep, setIsPaymentStep] = useState(false);
  const [isSuccessStep, setIsSuccessStep] = useState(false);
  const [successData, setSuccessData] = useState<LeadReceiptData | null>(null);
  const [isCopiedRef, setIsCopiedRef] = useState(false);
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

      const states = statesAndDistricts.states || [];
      if (states.length > 0) {
        setState(states[0].state || "");
        const districts = states[0].districts || [];
        setDistrict(districts[0] || "");
      }
    }
  }, [showLeadForm]);

  // Adjust District when State changes
  useEffect(() => {
    if (state) {
      const found = (statesAndDistricts.states || []).find((s: any) => s.state === state);
      const districts = found?.districts || [];
      setDistrict(districts[0] || "");
    } else {
      setDistrict("");
    }
  }, [state]);

  const handlePhotoUpload = async (index: number, file: File | null) => {
    if (!file) {
      const newPhotos = [...photos];
      newPhotos[index] = "";
      setPhotos(newPhotos);
      return;
    }
    try {
      // Compress camera image to high-quality lightweight JPEG (~100KB-150KB)
      const compressedDataUrl = await compressImageFile(file);
      const newPhotos = [...photos];
      newPhotos[index] = compressedDataUrl;
      setPhotos(newPhotos);
    } catch (err) {
      console.warn("Client-side compression fallback to FileReader:", err);
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhotos = [...photos];
        newPhotos[index] = reader.result as string;
        setPhotos(newPhotos);
      };
      reader.readAsDataURL(file);
    }
  };

  // Start live webcam for desktop or live viewfinder
  const startWebcam = async (facing: "user" | "environment" = cameraFacingMode) => {
    setIsCameraStarting(true);
    setCameraError(null);
    setCapturedPhotoTemp(null);

    // Stop existing stream if running
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Webcam access is not supported by your browser. Please upload from gallery or device.");
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setWebcamStream(stream);
      setShowWebcamModal(true);
      setShowPhotoSourceModal(false);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((playErr) => console.warn("Video play error:", playErr));
        }
      }, 100);
    } catch (err: any) {
      console.warn("Live webcam stream failed, trying fallback:", err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setWebcamStream(fallbackStream);
        setShowWebcamModal(true);
        setShowPhotoSourceModal(false);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            videoRef.current.play().catch((playErr) => console.warn("Fallback video play error:", playErr));
          }
        }, 100);
      } catch (fallbackErr: any) {
        setCameraError(fallbackErr.message || "Unable to access camera. Please allow camera permissions or upload from files.");
        setShowWebcamModal(true);
        setShowPhotoSourceModal(false);
      }
    } finally {
      setIsCameraStarting(false);
    }
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach((t) => t.stop());
      setWebcamStream(null);
    }
    setShowWebcamModal(false);
    setCapturedPhotoTemp(null);
    setCameraError(null);
  };

  const toggleCameraFacingMode = () => {
    const nextFacing = cameraFacingMode === "environment" ? "user" : "environment";
    setCameraFacingMode(nextFacing);
    startWebcam(nextFacing);
  };

  const captureWebcamSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (cameraFacingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedPhotoTemp(dataUrl);
  };

  const confirmCapturedWebcamPhoto = async () => {
    if (!capturedPhotoTemp || activePhotoSlot === null) return;
    try {
      const res = await fetch(capturedPhotoTemp);
      const blob = await res.blob();
      const file = new File([blob], `photo_${activePhotoSlot + 1}.jpg`, { type: "image/jpeg" });
      await handlePhotoUpload(activePhotoSlot, file);
    } catch (err) {
      console.warn("Direct capture set fallback:", err);
      const newPhotos = [...photos];
      newPhotos[activePhotoSlot] = capturedPhotoTemp;
      setPhotos(newPhotos);
    } finally {
      stopWebcam();
      setActivePhotoSlot(null);
    }
  };

  // Trigger Native Camera on mobile or Live Viewfinder on desktop
  const handleTriggerCamera = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile && nativeCameraInputRef.current) {
      setShowPhotoSourceModal(false);
      nativeCameraInputRef.current.click();
    } else {
      startWebcam(cameraFacingMode);
    }
  };

  const handleTriggerGallery = () => {
    setShowPhotoSourceModal(false);
    galleryInputRef.current?.click();
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && activePhotoSlot !== null) {
      handlePhotoUpload(activePhotoSlot, file);
    }
    e.target.value = "";
    setActivePhotoSlot(null);
  };

  const handleNativeCameraFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && activePhotoSlot !== null) {
      handlePhotoUpload(activePhotoSlot, file);
    }
    e.target.value = "";
    setActivePhotoSlot(null);
  };

  // Clean up webcam tracks on unmount
  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [webcamStream]);

  // Support direct link / hash open (#lead-generator or ?open=lead-generator)
  useEffect(() => {
    const handleUrlOpen = () => {
      const isHash = window.location.hash === "#lead-generator";
      const params = new URLSearchParams(window.location.search);
      const isParam = params.get("open") === "lead-generator" || params.get("lead") === "true";
      if (isHash || isParam) {
        setShowLeadForm(true);
      }
    };
    handleUrlOpen();
    window.addEventListener("hashchange", handleUrlOpen);
    const handleCustomOpen = () => setShowLeadForm(true);
    window.addEventListener("fmp-open-lead-generator", handleCustomOpen);

    return () => {
      window.removeEventListener("hashchange", handleUrlOpen);
      window.removeEventListener("fmp-open-lead-generator", handleCustomOpen);
    };
  }, []);

  // Fetch Live Google Maps Location URL via GPS
  const handleFetchCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsFetchingLocation(true);
    setLocationStatus(null);

    const geoOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy || 0);
        const mapUrl = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
        setLocationUrl(mapUrl);
        setIsFetchingLocation(false);
        setLocationStatus({
          type: "success",
          text: `Live GPS captured successfully (Accuracy: ~${accuracy}m)`
        });
      },
      (error) => {
        console.warn("High accuracy geolocation failed, trying standard accuracy:", error.message);
        navigator.geolocation.getCurrentPosition(
          (fallbackPos) => {
            const lat = fallbackPos.coords.latitude;
            const lng = fallbackPos.coords.longitude;
            const mapUrl = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
            setLocationUrl(mapUrl);
            setIsFetchingLocation(false);
            setLocationStatus({
              type: "success",
              text: "Live location captured successfully!"
            });
          },
          (fallbackErr) => {
            console.error("Geolocation failed:", fallbackErr);
            setIsFetchingLocation(false);
            let errMsg = "Unable to fetch location. Please allow browser location access or paste Google Maps URL manually.";
            if (fallbackErr.code === 1) {
              errMsg = "Location permission denied. Please enable location access in browser settings.";
            } else if (fallbackErr.code === 2) {
              errMsg = "GPS position unavailable. Please ensure device location is enabled.";
            } else if (fallbackErr.code === 3) {
              errMsg = "Location request timed out. Please try again.";
            }
            setLocationStatus({ type: "error", text: errMsg });
            alert(errMsg);
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      },
      geoOptions
    );
  };

  const showPendingSuccess = (reqId?: string, feeAmt?: number) => {
    const formattedDate = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const locationStr = [area, town, district, state, pinCode ? `PIN: ${pinCode}` : ""].filter(Boolean).join(", ");
    const hoursStr = isTimeMandatory ? `${openTime} - ${closeTime}` : "Regular Working Hours";

    setSuccessData({
      requestId: reqId || currentRequestId || "REQ-" + Date.now().toString().slice(-6),
      businessName,
      ownerName,
      category,
      contactNumber: `${contactCode} ${contactNo}`,
      whatsappNumber: `${whatsappCode} ${whatsappNo}`,
      email: email || undefined,
      location: locationStr,
      addressDetails: addressDetails || undefined,
      locationUrl: locationUrl || undefined,
      operatingHours: hoursStr,
      submittedAt: formattedDate,
      employeeName: employeeName !== "None" ? employeeName : undefined,
      amount: feeAmt !== undefined ? feeAmt : (parseFloat(listingRequestFee) || 0),
      paymentStatus: "Pending",
    });

    const finalReqId = reqId || currentRequestId;
    if (finalReqId) {
      fetch(`${API_BASE_URL}/business-requests/${finalReqId}/notify-pending`, {
        method: "POST"
      }).catch(err => console.warn("Pending notification trigger error:", err));
    }

    setIsPaymentStep(false);
    setIsSubmittingForm(false);
    setIsSuccessStep(true);
  };

  const triggerRazorpayCheckout = async (requestId: string, order: any) => {
    if (!order) return;
    setIsProcessingPayment(true);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !(window as any).Razorpay) {
      alert("Payment gateway failed to load. Please check your internet connection and try again.");
      setIsProcessingPayment(false);
      return;
    }

    const userToken = localStorage.getItem("fmp_user_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (userToken && userToken !== "null" && userToken !== "undefined" && userToken.trim() !== "") {
      headers["Authorization"] = `Bearer ${userToken}`;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: order.amount, // in paise
      currency: order.currency || "INR",
      name: "FindmyPoint",
      description: `Listing fee for ${businessName}`,
      order_id: order.id,
      handler: async (response: any) => {
        try {
          const resSubmit = await fetch(`${API_BASE_URL}/business-requests/verify-payment`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              requestId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            })
          });

          const submitData = await resSubmit.json();
          if (submitData.success) {
            const formattedDate = new Date().toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
            const locationStr = [area, town, district, state, pinCode ? `PIN: ${pinCode}` : ""].filter(Boolean).join(", ");
            const hoursStr = isTimeMandatory ? `${openTime} - ${closeTime}` : "Regular Working Hours";

            setSuccessData({
              requestId: submitData.request?._id || submitData.requestId || requestId,
              businessName,
              ownerName,
              category,
              contactNumber: `${contactCode} ${contactNo}`,
              whatsappNumber: `${whatsappCode} ${whatsappNo}`,
              email: email || undefined,
              location: locationStr,
              addressDetails: addressDetails || undefined,
              locationUrl: locationUrl || undefined,
              operatingHours: hoursStr,
              submittedAt: formattedDate,
              employeeName: employeeName !== "None" ? employeeName : undefined,
              amount: parseFloat(listingRequestFee) || 0,
              paymentId: response.razorpay_payment_id,
              paymentStatus: "Paid",
            });
            setIsPaymentStep(false);
            setIsSuccessStep(true);
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
          showPendingSuccess(requestId, parseFloat(listingRequestFee) || 0);
        }
      }
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (rzpErr) {
      console.error("Razorpay open error:", rzpErr);
      alert("Failed to initialize payment popup.");
      setIsProcessingPayment(false);
    }
  };

  const handleLeadFormSubmit = async (e?: React.FormEvent, skipPayment = false) => {
    if (e) e.preventDefault();

    // Verify OTP first
    if (!isOtpVerified) {
      const cleanPhone = contactNo.replace(/\D/g, "");
      const cleanOtp = otp.trim();

      if (cleanPhone.length !== 10) {
        alert("Please enter a valid 10-digit contact number.");
        return;
      }

      if (cleanOtp.length === 6) {
        try {
          const verifyRes = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: cleanPhone, otp: cleanOtp })
          });
          const verifyData = await verifyRes.json();
          if (!verifyData.success) {
            alert(verifyData.message || "Invalid OTP code. Please enter the correct OTP.");
            return;
          }
          if (verifyData.token) {
            localStorage.setItem("fmp_user_token", verifyData.token);
          }
          setIsOtpVerified(true);
        } catch (err) {
          alert("Network error verifying OTP. Please try again.");
          return;
        }
      } else {
        alert("Please enter and verify the 6-digit OTP sent to your contact number.");
        return;
      }
    }

    const validPhotos = photos.filter((p) => p && p.trim() !== "");
    if (validPhotos.length < 2) {
      alert("Please upload at least 2 business photos (e.g. Front Banner & Inside view).");
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
        locationUrl: locationUrl.trim(),
        photos: validPhotos,
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

      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (userToken && userToken !== "null" && userToken !== "undefined" && userToken.trim() !== "") {
        headers["Authorization"] = `Bearer ${userToken}`;
      }

      const res = await fetch(`${API_BASE_URL}/business-requests`, {
        method: "POST",
        headers,
        body: JSON.stringify(requestData)
      });

      let data: any;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error(`Server returned unexpected response status: ${res.status}`);
      }

      if (data.success) {
        setCurrentRequestId(data.request._id);
        setCurrentOrder(data.order);

        const hasFee = Number(listingRequestFee) > 0 && data.order;
        if (hasFee && !skipPayment) {
          setIsPaymentStep(true);
          setIsSubmittingForm(false);
          triggerRazorpayCheckout(data.request._id, data.order);
        } else if (hasFee && skipPayment) {
          setIsSubmittingForm(false);
          showPendingSuccess(data.request._id, Number(listingRequestFee) || 0);
        } else {
          // Free or ₹0 listing request
          const formattedDate = new Date().toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
          const locationStr = [area, town, district, state, pinCode ? `PIN: ${pinCode}` : ""].filter(Boolean).join(", ");
          const hoursStr = isTimeMandatory ? `${openTime} - ${closeTime}` : "Regular Working Hours";

          setSuccessData({
            requestId: data.request?._id || data.request?.id || "REQ-" + Date.now().toString().slice(-6),
            businessName,
            ownerName,
            category,
            contactNumber: `${contactCode} ${contactNo}`,
            whatsappNumber: `${whatsappCode} ${whatsappNo}`,
            email: email || undefined,
            location: locationStr,
            addressDetails: addressDetails || undefined,
            locationUrl: locationUrl || undefined,
            operatingHours: hoursStr,
            submittedAt: formattedDate,
            employeeName: employeeName !== "None" ? employeeName : undefined,
            amount: 0,
            paymentStatus: "Free",
          });
          setIsPaymentStep(false);
          setIsSubmittingForm(false);
          setIsSuccessStep(true);
        }
      } else {
        alert(data.message || "Failed to submit request.");
        setIsSubmittingForm(false);
      }
    } catch (err: any) {
      console.error("Error submitting form:", err);
      alert(err?.message || "Network error submitting business request. Please try again.");
      setIsSubmittingForm(false);
    }
  };

  const handleResetLeadForm = () => {
    setBusinessName("");
    setCategory(categories && categories.length > 0 ? categories[0].label : "Restaurant");
    setOwnerName("");
    setContactNo("");
    setWhatsappNo("");
    setEmail("");
    setOtp("");
    setOtpSent(false);
    setIsOtpVerified(false);
    setOtpTimer(0);
    setOtpMessage(null);
    setAddressDetails("");
    setLocationUrl("");
    setLocationStatus(null);
    setPhotos(["", "", "", "", "", ""]);
    setActivePhotoSlot(null);
    setShowPhotoSourceModal(false);
    stopWebcam();
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
    setIsPaymentStep(false);
    setIsSuccessStep(false);
    setSuccessData(null);
  };

  const handleCloseLeadModal = () => {
    stopWebcam();
    setShowPhotoSourceModal(false);
    setActivePhotoSlot(null);
    setLocationUrl("");
    setLocationStatus(null);
    setShowLeadForm(false);
    setIsPaymentStep(false);
    setIsSuccessStep(false);
    setSuccessData(null);
    setOtp("");
    setOtpSent(false);
    setIsOtpVerified(false);
    setOtpTimer(0);
    setOtpMessage(null);
    if (window.location.hash === "#lead-generator") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    window.dispatchEvent(new CustomEvent("fmp-navigate-home"));
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const handleFinalPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRequestId) return;
    if (currentOrder) {
      await triggerRazorpayCheckout(currentRequestId, currentOrder);
      return;
    }
    setIsProcessingPayment(true);
    try {
      const userToken = localStorage.getItem("fmp_user_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (userToken && userToken !== "null" && userToken !== "undefined" && userToken.trim() !== "") {
        headers["Authorization"] = `Bearer ${userToken}`;
      }
      const res = await fetch(`${API_BASE_URL}/business-requests/${currentRequestId}/payment-order`, {
        method: "POST",
        headers
      });
      const data = await res.json();
      if (data.success && data.order) {
        setCurrentOrder(data.order);
        await triggerRazorpayCheckout(currentRequestId, data.order);
      } else {
        alert(data.message || "Failed to initialize payment.");
      }
    } catch (err: any) {
      console.error("Error creating payment order:", err);
      alert(err?.message || "Network error initializing payment.");
    } finally {
      setIsProcessingPayment(false);
    }
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
    <footer className="mt-8 sm:mt-24 border-t border-border w-full bg-card/30 text-left">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 pb-6 sm:py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 sm:gap-10">
          {/* Brand & Socials column */}
          <div className="md:col-span-2">
            <a href="/" className="flex items-center">
              <LazyImage
                src={logoImg}
                alt="FindMyPoint Logo"
                priority={true}
                showSkeleton={false}
                className="h-7 sm:h-8 w-auto"
                imgClassName="h-7 sm:h-8 w-auto object-contain"
                style={{ mixBlendMode: "multiply" }}
              />
            </a>
            {footerData.tagline && (
              <p className="mt-2.5 sm:mt-4 max-w-sm text-xs sm:text-sm text-muted-foreground">{footerData.tagline}</p>
            )}

            {/* Dynamic Social Links */}
            <div className="mt-4 sm:mt-6 flex gap-2.5">
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
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full transition-transform duration-300 shadow-sm ${item.color}`}
                  >
                    {item.svg}
                  </a>
                );
              })}
            </div>

            {/* App Download Buttons */}
            {(footerData.playstoreUrl || footerData.appstoreUrl) && (
              <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3">
                {/* Google Play Button */}
                {footerData.playstoreUrl && (
                  <a
                    href={footerData.playstoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-[#111111] hover:bg-black text-white px-2.5 py-1.5 transition-all duration-300 shadow-sm border border-white/10 cursor-pointer"
                  >
                    <svg className="h-4 w-4 sm:h-4.5 sm:w-4.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                      <span className="text-[7.5px] font-semibold text-white/70 uppercase tracking-widest leading-none">
                        GET IT ON
                      </span>
                      <span className="text-[10.5px] font-bold leading-tight mt-0.5">Google Play</span>
                    </div>
                  </a>
                )}

                {/* App Store Button */}
                {footerData.appstoreUrl && (
                  <a
                    href={footerData.appstoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-[#111111] hover:bg-black text-white px-2.5 py-1.5 transition-all duration-300 shadow-sm border border-white/10 cursor-pointer"
                  >
                    <svg
                      className="h-4 w-4 sm:h-4.5 sm:w-4.5 fill-white"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.502 12.06 1.002 1.45 2.19 3.078 3.76 3.02 1.514-.06 2.09-.98 3.916-.98 1.81 0 2.333.98 3.917.948 1.606-.027 2.648-1.48 3.627-2.9 1.13-1.656 1.597-3.26 1.623-3.342-.03-.015-3.107-1.192-3.137-4.747-.025-2.978 2.443-4.41 2.56-4.484-1.393-2.04-3.548-2.27-4.316-2.32-2-.162-3.9 1.231-4.918 1.231zm2.33-4.57c.896-1.082 1.5-2.585 1.332-4.086-1.286.05-2.85.856-3.774 1.938-.796.918-1.492 2.455-1.304 3.925 1.438.113 2.875-.722 3.746-1.777z" />
                    </svg>
                    <div className="flex flex-col text-left">
                      <span className="text-[7.5px] font-semibold text-white/70 leading-none">
                        Download on the
                      </span>
                      <span className="text-[10.5px] font-bold leading-tight mt-0.5">App Store</span>
                    </div>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Links column: 2 columns on mobile (Company beside Business) and 3 columns on desktop */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              ["Company", ["About", "Search Employee"]],
              ["Business", ["Advertise", "Lead Generator"]],
              ["Support", ["Help Centre", "Privacy Policy", "Terms & Conditions"]],
            ].map(([h, items]) => (
              <div key={h as string} className={h === "Support" ? "col-span-2 sm:col-span-1" : ""}>
                <h5 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">{h as string}</h5>
                <ul className="mt-2.5 sm:mt-4 space-y-2 text-xs sm:text-sm text-muted-foreground">
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
                          className="transition hover:text-foreground text-left cursor-pointer bg-transparent border-none p-0 text-xs sm:text-sm text-muted-foreground font-normal"
                        >
                          {i}
                        </button>
                      ) : i === "Search Employee" ? (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setShowIdInput(true);
                          }}
                          className="transition hover:text-foreground text-left cursor-pointer bg-transparent border-none p-0 text-xs sm:text-sm text-muted-foreground font-normal"
                        >
                          {i}
                        </button>
                      ) : i === "Advertise" ? (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                            document.documentElement.scrollTop = 0;
                            document.body.scrollTop = 0;
                            window.dispatchEvent(new CustomEvent("fmp-open-advertise"));
                          }}
                          className="transition hover:text-foreground text-left cursor-pointer bg-transparent border-none p-0 text-xs sm:text-sm text-muted-foreground font-normal"
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
                          className="transition hover:text-foreground text-left cursor-pointer bg-transparent border-none p-0 text-xs sm:text-sm text-muted-foreground font-normal"
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
                          className="transition hover:text-foreground text-left cursor-pointer bg-transparent border-none p-0 text-xs sm:text-sm text-muted-foreground font-normal"
                        >
                          {i}
                        </button>
                      ) : i === "About" ? (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            window.dispatchEvent(
                              new CustomEvent("fmp-open-page", { detail: "About" }),
                            );
                          }}
                          className="transition hover:text-foreground text-left cursor-pointer bg-transparent border-none p-0 text-xs sm:text-sm text-muted-foreground font-normal"
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
        </div>

        {/* Dynamic Copyright block */}
        <div className="mt-6 sm:mt-12 flex flex-col items-center sm:items-start justify-between gap-2 border-t border-border pt-4 sm:pt-8 text-[11px] sm:text-xs text-muted-foreground md:flex-row md:items-center text-center sm:text-left">
          <p>{footerData.copyright || `© ${new Date().getFullYear()} FindmyPoint Directory Services. All rights reserved.`}</p>
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

              {/* Logo block in header centered */}
              <div className="absolute top-3 inset-x-0 z-10 flex items-center justify-center">
                <LazyImage
                  src={logoImg}
                  alt="FindMyPoint Logo"
                  priority={true}
                  showSkeleton={false}
                  className="h-4.5 w-auto"
                  imgClassName="h-4.5 w-auto object-contain"
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

              {foundEmployee.photo ? (
                <LazyImage
                  src={foundEmployee.photo}
                  alt={foundEmployee.name}
                  className="h-28 w-28 rounded-2xl border-4 border-white dark:border-slate-900 shadow-md overflow-hidden"
                  imgClassName="h-full w-full object-cover"
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
                    <span className="text-[7px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">ID NUMBER</span>
                    <span className="text-[11px] text-slate-800 dark:text-slate-200 font-extrabold mt-0.5 block font-mono truncate">{foundEmployee.empIdNumber}</span>
                  </div>
                </div>

                {/* Designation */}
                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-indigo-50 dark:bg-slate-950 text-indigo-650 dark:text-slate-450 flex items-center justify-center shrink-0 border border-indigo-100/50 dark:border-slate-800">
                    <Briefcase className="h-3 w-3" />
                  </div>
                  <div className="text-left leading-none min-w-0">
                    <span className="text-[7px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">DESIGNATION</span>
                    <span className="text-[11px] text-slate-800 dark:text-slate-200 font-extrabold mt-0.5 block truncate">{foundEmployee.designation}</span>
                  </div>
                </div>

                {/* Contact */}
                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-indigo-50 dark:bg-slate-950 text-indigo-650 dark:text-slate-450 flex items-center justify-center shrink-0 border border-indigo-100/50 dark:border-slate-800">
                    <Phone className="h-3 w-3" />
                  </div>
                  <div className="text-left leading-none min-w-0">
                    <span className="text-[7px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">CONTACT NUMBER</span>
                    <span className="text-[11px] text-slate-800 dark:text-slate-200 font-extrabold mt-0.5 block truncate">{foundEmployee.contactNumber}</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-indigo-50 dark:bg-slate-950 text-indigo-650 dark:text-slate-450 flex items-center justify-center shrink-0 border border-indigo-100/50 dark:border-slate-800">
                    <MapPin className="h-3 w-3" />
                  </div>
                  <div className="text-left leading-none min-w-0">
                    <span className="text-[7px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">FIELD LOCATION</span>
                    <span className="text-[11px] text-slate-800 dark:text-slate-200 font-extrabold mt-0.5 block truncate">{foundEmployee.fieldLocation || "Not Assigned"}</span>
                  </div>
                </div>
              </div>

              {/* Right: Scannable QR Code */}
              <div className="shrink-0 flex flex-col items-center justify-center text-center">
                <div className="h-[76px] w-[76px] sm:h-[80px] sm:w-[80px] p-1 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                      window.location.origin + "/verify/" + foundEmployee.empIdNumber
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white dark:bg-slate-900 rounded-none sm:rounded-3xl shadow-2xl border-0 sm:border border-slate-100 dark:border-slate-800/80 max-w-2xl w-full h-full sm:h-auto sm:max-h-[90vh] relative overflow-hidden flex flex-col animate-zoom-in">
            {/* Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
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
                onClick={handleCloseLeadModal}
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-955 hover:bg-rose-50 dark:hover:bg-rose-955/20 text-slate-450 hover:text-rose-600 transition cursor-pointer"
                title="Close and go to Home"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body: Success Step OR Form Step OR Payment Step */}
            {isSuccessStep && successData ? (
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 sm:space-y-3.5 text-center relative no-scrollbar animate-in fade-in zoom-in-95 duration-200">
                {/* 1. Cracker & Confetti Fireworks Canvas */}
                <CelebrationConfetti />

                {/* 2. Success Icon & Header */}
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className="relative flex items-center justify-center">
                    {successData.paymentStatus === "Paid" ? (
                      <>
                        <div className="absolute -inset-2 rounded-full bg-emerald-500/20 blur-md animate-pulse" />
                        <div className="relative h-11 w-11 sm:h-13 sm:w-13 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                          <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="absolute -inset-2 rounded-full bg-amber-500/20 blur-md animate-pulse" />
                        <div className="relative h-11 w-11 sm:h-13 sm:w-13 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                          <Clock className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />
                        </div>
                      </>
                    )}
                    <div className="absolute -top-1 -right-1 p-1 rounded-full bg-amber-400 text-slate-950 shadow-xs animate-bounce">
                      <Sparkles className="h-3 w-3 fill-current" />
                    </div>
                  </div>

                  {successData.paymentStatus === "Paid" ? (
                    <span className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Request Registered Successfully
                    </span>
                  ) : (
                    <span className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-2xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                      Request Registered (Payment Pending)
                    </span>
                  )}

                  <h3 className="font-serif text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                    Thank You, {successData.ownerName}!
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-sm mx-auto leading-tight line-clamp-1">
                    Listing request for <span className="font-bold text-slate-900 dark:text-white">{successData.businessName}</span> is queued for admin review.
                  </p>
                </div>

                {/* 3. Official Summary & Reference Card */}
                <div className="relative z-10 bg-slate-50/80 dark:bg-slate-955/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3 sm:p-3.5 text-left space-y-2.5 shadow-2xs">

                  {/* Summary Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
                    <div>
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wide block">Category</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{successData.category}</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wide block">Contact Phone</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{successData.contactNumber}</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wide block">Payment Status</span>
                      {successData.paymentStatus === "Paid" ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 truncate">
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          {successData.amount > 0 ? `Paid (₹${successData.amount})` : "Free"}
                        </span>
                      ) : successData.paymentStatus === "Pending" ? (
                        <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5 truncate">
                          <Clock className="h-3 w-3 shrink-0" />
                          Pending (₹{successData.amount})
                        </span>
                      ) : (
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 truncate">
                          Free
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wide block">Submitted On</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-400 truncate block">
                        {successData.submittedAt}
                      </span>
                    </div>

                    {/* Location & Payment ID */}
                    <div className="col-span-2 sm:col-span-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                      <div className="min-w-0 flex-1">
                        <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wide">Location: </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate" title={successData.location}>
                          {successData.location}
                        </span>
                      </div>
                      {successData.paymentId && (
                        <div className="min-w-0 shrink-0">
                          <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wide">Pay ID: </span>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[10px]">
                            {successData.paymentId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Verification Notice */}
                  <div className="p-1.5 sm:p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-1.5 text-[10px] text-indigo-800 dark:text-indigo-300 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Our executive will verify your business details within 2-4 hours.</span>
                  </div>
                </div>

                {/* 4. Action Buttons (Download Receipt & Done & Pay Now if Pending) */}
                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-2 pt-0.5">

                  <button
                    type="button"
                    onClick={() => generateLeadReceiptPDF(successData)}
                    className="w-full sm:flex-1 bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer active:scale-[0.99] transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Official Receipt (PDF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseLeadModal}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    Done & Close
                  </button>
                </div>

              </div>
            ) : !isPaymentStep ? (
              <form onSubmit={handleLeadFormSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 no-scrollbar">

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
                      E-mail (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. owner@gmail.com (optional)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-955 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                        Contact Number *
                      </label>
                      {isOtpVerified && (
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={contactCode}
                        onChange={(e) => setContactCode(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-955 text-xs px-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold shrink-0"
                      >
                        {CALLING_CODES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <div className="relative flex-1 flex items-center">
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="9876543210"
                          value={contactNo}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                            setContactNo(val);
                            if (isOtpVerified) setIsOtpVerified(false);
                          }}
                          className={`w-full bg-slate-50 dark:bg-slate-955 text-xs pl-3.5 pr-24 py-2.5 rounded-xl border outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all font-semibold ${isOtpVerified
                              ? "border-emerald-500/60 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                              : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            }`}
                        />
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isSendingOtp || otpTimer > 0 || isOtpVerified || contactNo.replace(/\D/g, "").length !== 10}
                          className={`absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${isOtpVerified
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 cursor-default border border-emerald-500/30"
                              : isSendingOtp || otpTimer > 0 || contactNo.replace(/\D/g, "").length !== 10
                                ? "bg-slate-200/80 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                            }`}
                        >
                          {isSendingOtp ? (
                            <>
                              <span className="h-2.5 w-2.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                              <span>Sending</span>
                            </>
                          ) : isOtpVerified ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Verified</span>
                            </>
                          ) : otpTimer > 0 ? (
                            <span>Resend ({otpTimer}s)</span>
                          ) : otpSent ? (
                            <span>Resend OTP</span>
                          ) : (
                            <span>Send OTP</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* OTP Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                        Enter OTP *
                      </label>
                      {otpSent && !isOtpVerified && otpTimer > 0 && (
                        <span className="text-[9.5px] font-bold text-amber-500">
                          Expires in {otpTimer}s
                        </span>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        disabled={isOtpVerified}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setOtp(val);
                        }}
                        className={`w-full bg-slate-50 dark:bg-slate-955 text-xs pl-3.5 pr-20 py-2.5 rounded-xl border outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-mono tracking-wider font-semibold transition-all ${isOtpVerified
                            ? "border-emerald-500/60 bg-emerald-50/20 text-emerald-700 dark:text-emerald-400"
                            : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          }`}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={isVerifyingOtp || isOtpVerified || otp.trim().length !== 6}
                        className={`absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${isOtpVerified
                            ? "bg-emerald-500 text-white cursor-default"
                            : isVerifyingOtp || otp.trim().length !== 6
                              ? "bg-slate-200/80 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          }`}
                      >
                        {isVerifyingOtp ? (
                          <>
                            <span className="h-2.5 w-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Verifying</span>
                          </>
                        ) : isOtpVerified ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Verified</span>
                          </>
                        ) : (
                          <span>Verify</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* WhatsApp Number */}
                  <div className="space-y-1.5 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                        WhatsApp Number *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setWhatsappCode(contactCode);
                          setWhatsappNo(contactNo);
                        }}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Same as Contact Number
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={whatsappCode}
                        onChange={(e) => setWhatsappCode(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-955 text-xs px-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold shrink-0"
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
                        maxLength={10}
                        placeholder="Same as contact or WhatsApp no"
                        value={whatsappNo}
                        onChange={(e) => setWhatsappNo(e.target.value.replace(/\D/g, "").slice(0, 10))}
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
                        <option value="India">India</option>
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
                        {(statesAndDistricts.states || []).map((s: any) => (
                          <option key={s.state} value={s.state}>
                            {s.state}
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
                        {((statesAndDistricts.states || []).find((s: any) => s.state === state)?.districts || []).map((d: string) => (
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

                  {/* Google Maps Live Location URL Fetcher */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-indigo-500" />
                        Current Location
                      </label>
                      {locationUrl && (
                        <a
                          href={locationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9.5px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                        >
                          <span>Open in Google Maps</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1 flex items-center">
                        <input
                          type="url"
                          placeholder="Click 'Fetch Current Location' or paste Google Maps URL"
                          value={locationUrl}
                          onChange={(e) => {
                            setLocationUrl(e.target.value);
                            if (locationStatus) setLocationStatus(null);
                          }}
                          className="w-full bg-white dark:bg-slate-955 text-xs pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                        />
                        {locationUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setLocationUrl("");
                              setLocationStatus(null);
                            }}
                            className="absolute right-2.5 text-slate-400 hover:text-rose-500 text-xs font-bold cursor-pointer"
                            title="Clear URL"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleFetchCurrentLocation}
                        disabled={isFetchingLocation}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs ${isFetchingLocation
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 active:scale-[0.98]"
                          }`}
                        title="Get live GPS coordinates from this device"
                      >
                        {isFetchingLocation ? (
                          <>
                            <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Fetching GPS...</span>
                          </>
                        ) : (
                          <>
                            <Navigation className="h-3.5 w-3.5" />
                            <span>Fetch Current Location</span>
                          </>
                        )}
                      </button>
                    </div>

                    {locationStatus && (
                      <p
                        className={`text-[10px] font-semibold mt-1 flex items-center gap-1 ${locationStatus.type === "success"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400"
                          }`}
                      >
                        {locationStatus.type === "success" ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-amber-500" />
                        )}
                        <span>{locationStatus.text}</span>
                      </p>
                    )}
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

                {/* Part 4: Upload Business Photos (6 slots) */}
                <div className="bg-slate-50/50 dark:bg-slate-955/20 border border-slate-100 dark:border-slate-850/60 rounded-2xl p-4 sm:p-4.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-650 dark:text-indigo-400 tracking-wider block">
                        Business Photos (6 slots) *
                      </span>
                      <span className="text-[9.5px] text-slate-450 dark:text-slate-500 font-medium">
                        Click slot to Take Camera photo or Upload from Gallery (Min 2 required)
                      </span>
                    </div>
                    <span className="text-[9.5px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-100/50 dark:border-indigo-900/30">
                      {photos.filter((p) => p && p.trim() !== "").length}/6 Added
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`group relative aspect-square rounded-2xl transition-all flex flex-col items-center justify-center overflow-hidden border ${photos[idx]
                            ? "bg-slate-900 border-indigo-500/40 shadow-sm"
                            : "bg-white dark:bg-slate-950 border-dashed border-slate-250 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/80 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 cursor-pointer"
                          }`}
                        onClick={() => {
                          if (!photos[idx]) {
                            setActivePhotoSlot(idx);
                            setShowPhotoSourceModal(true);
                          }
                        }}
                      >
                        {photos[idx] ? (
                          <>
                            <LazyImage
                              src={photos[idx]}
                              alt={`Photo ${idx + 1}`}
                              className="h-full w-full"
                              imgClassName="h-full w-full object-cover"
                            />
                            {/* Slot Tag */}
                            <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[8.5px] font-bold text-white uppercase tracking-wider z-10">
                              #{idx + 1}
                            </span>
                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePhotoUpload(idx, null);
                              }}
                              className="absolute top-1.5 right-1.5 h-6 w-6 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-xs font-black shadow-md cursor-pointer transition-transform active:scale-90 z-20"
                              title="Remove photo"
                            >
                              <X className="h-3 w-3" strokeWidth={3} />
                            </button>
                            {/* Change Button Overlay */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePhotoSlot(idx);
                                setShowPhotoSourceModal(true);
                              }}
                              className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent py-2 flex items-center justify-center gap-1 text-[9.5px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-15"
                            >
                              <Camera className="h-3 w-3" />
                              <span>Change</span>
                            </button>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center select-none">
                            <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-1 shadow-2xs">
                              <Camera className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] text-slate-700 dark:text-slate-300 font-extrabold block">
                              Photo {idx + 1}
                            </span>
                            <span className="text-[8.5px] text-indigo-600 dark:text-indigo-400 font-bold block mt-0.5">
                              + Add Photo
                            </span>
                          </div>
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
                <div className="flex flex-nowrap items-center justify-end gap-1.5 sm:gap-2 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800/80 shrink-0 bg-white dark:bg-slate-900 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={handleCloseLeadModal}
                    className="px-2.5 sm:px-4 py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-[11px] sm:text-xs font-bold rounded-xl transition cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingForm}
                    onClick={(e) => {
                      const form = (e.currentTarget as HTMLElement).closest("form");
                      if (form && !form.checkValidity()) {
                        form.reportValidity();
                        return;
                      }
                      handleLeadFormSubmit(e, true);
                    }}
                    className="px-2.5 sm:px-3.5 py-2 sm:py-2.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 text-[11px] sm:text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 sm:gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs active:scale-[0.98] shrink-0 whitespace-nowrap"
                  >
                    <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Submit without Payment</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingForm}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/60 text-white text-[11px] sm:text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 sm:gap-1.5 shadow-md shadow-indigo-600/10 disabled:cursor-not-allowed active:scale-[0.98] shrink-0 whitespace-nowrap"
                  >
                    {isSubmittingForm ? (
                      <>
                        <span className="h-3 w-3 sm:h-3.5 sm:w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                        <span>Submit Request</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            ) : (
              <form onSubmit={handleFinalPaymentSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 no-scrollbar text-center">
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
                      type="button"
                      disabled={isProcessingPayment}
                      onClick={() => showPendingSuccess(currentRequestId, parseFloat(listingRequestFee) || 0)}
                      className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
                    >
                      Pay Later / Submit as Pending
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessingPayment}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/60 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:cursor-not-allowed"
                    >
                      {isProcessingPayment ? (
                        <>
                          <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Opening Razorpay...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Proceed to Payment (₹{listingRequestFee})
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

      {/* Hidden File Inputs for Native Camera & Gallery */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleGalleryFileChange}
      />
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleNativeCameraFileChange}
      />

      {/* Photo Source Picker Modal (Take Camera vs Upload Gallery) */}
      {showPhotoSourceModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800 relative animate-zoom-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Camera className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Add Photo {activePhotoSlot !== null ? activePhotoSlot + 1 : ""}
                  </h4>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">
                    Choose an upload method
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPhotoSourceModal(false);
                  setActivePhotoSlot(null);
                }}
                className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-955/20 text-slate-400 hover:text-rose-600 transition flex items-center justify-center cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Options */}
            <div className="mt-4 space-y-2.5">
              {/* Option 1: Take Photo (Camera) */}
              <button
                type="button"
                onClick={handleTriggerCamera}
                disabled={isCameraStarting}
                className="w-full group p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/20 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-3.5 transition-all text-left cursor-pointer active:scale-[0.99]"
              >
                <div className="h-11 w-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform shrink-0">
                  <Camera className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white block">
                    Take Photo (Camera)
                  </span>
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block truncate">
                    Click a fresh photo right now with camera
                  </span>
                </div>
              </button>

              {/* Option 2: Upload from Gallery */}
              <button
                type="button"
                onClick={handleTriggerGallery}
                className="w-full group p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-955/40 dark:hover:bg-slate-850/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 transition-all text-left cursor-pointer active:scale-[0.99]"
              >
                <div className="h-11 w-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform shrink-0">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white block">
                    Upload from Gallery
                  </span>
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block truncate">
                    Select from photo gallery or files
                  </span>
                </div>
              </button>
            </div>

            {/* Cancel */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowPhotoSourceModal(false);
                  setActivePhotoSlot(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Camera Viewfinder Modal */}
      {showWebcamModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in text-left">
          <div className="bg-slate-950 rounded-3xl border border-slate-800 max-w-lg w-full overflow-hidden shadow-2xl flex flex-col relative animate-zoom-in">
            {/* Viewfinder Header */}
            <div className="px-4 py-3 border-b border-slate-850 flex items-center justify-between text-white bg-slate-900/80">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Live Camera • Photo {activePhotoSlot !== null ? activePhotoSlot + 1 : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleCameraFacingMode}
                  title="Switch Front/Rear Camera"
                  className="h-8 w-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition cursor-pointer"
                >
                  <SwitchCamera className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={stopWebcam}
                  className="h-8 w-8 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 flex items-center justify-center transition cursor-pointer"
                  title="Close Camera"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Viewfinder Video Area */}
            <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
              {cameraError ? (
                <div className="p-6 text-center text-white space-y-3 max-w-xs">
                  <div className="h-12 w-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
                    <CameraOff className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold">Camera Unavailable</h4>
                  <p className="text-xs text-slate-400">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      stopWebcam();
                      galleryInputRef.current?.click();
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
                  >
                    Select from Files Instead
                  </button>
                </div>
              ) : capturedPhotoTemp ? (
                /* Freeze Preview */
                <img
                  src={capturedPhotoTemp}
                  alt="Captured snapshot"
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Live Stream */
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className={`w-full h-full object-cover ${cameraFacingMode === "user" ? "-scale-x-100" : ""}`}
                  />
                  {/* Viewfinder Guideline Box */}
                  <div className="absolute inset-8 sm:inset-12 border-2 border-white/30 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                    <div className="flex justify-between">
                      <div className="h-4 w-4 border-t-2 border-l-2 border-indigo-400" />
                      <div className="h-4 w-4 border-t-2 border-r-2 border-indigo-400" />
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 w-4 border-b-2 border-l-2 border-indigo-400" />
                      <div className="h-4 w-4 border-b-2 border-r-2 border-indigo-400" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Hidden canvas for capturing frame */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Viewfinder Controls Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-850 flex items-center justify-center gap-3">
              {capturedPhotoTemp ? (
                <>
                  <button
                    type="button"
                    onClick={() => setCapturedPhotoTemp(null)}
                    className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Retake Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={confirmCapturedWebcamPhoto}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-600/30"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Use This Photo</span>
                  </button>
                </>
              ) : !cameraError ? (
                <div className="flex items-center justify-center w-full relative">
                  {/* Big Circular Shutter Button */}
                  <button
                    type="button"
                    onClick={captureWebcamSnapshot}
                    className="h-16 w-16 rounded-full border-4 border-white p-1 flex items-center justify-center transition transform active:scale-95 cursor-pointer hover:border-indigo-400"
                    title="Capture Photo"
                  >
                    <div className="h-full w-full rounded-full bg-white hover:bg-indigo-100 transition shadow-lg" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={stopWebcam}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
