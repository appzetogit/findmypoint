import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, Calendar, Phone, MapPin, User, ShieldCheck, X, Briefcase, Heart, CheckCircle2, UserPlus, Image as ImageIcon } from "lucide-react";
import { API_BASE_URL, BACKEND_ORIGIN } from "../config";

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

const splitPhoneNumber = (fullPhone: string) => {
  const cleanPhone = (fullPhone || "").trim();
  const match = cleanPhone.match(/^(\+\d+)\s*(.*)$/);
  if (match) {
    return {
      code: match[1],
      number: match[2]
    };
  }
  return {
    code: "+91",
    number: cleanPhone
  };
};

const getNextEmployeeId = (currentEmployees: Employee[]) => {
  let maxNum = 0;
  currentEmployees.forEach((emp) => {
    const match = emp.empIdNumber.match(/^FMPEMP(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) {
        maxNum = num;
      }
    }
  });
  const nextNum = maxNum + 1;
  const paddedNum = String(nextNum).padStart(3, "0");
  return `FMPEMP${paddedNum}`;
};

// Dialing codes list
const CALLING_CODES = ["+91", "+1", "+44", "+61", "+65", "+971"];

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);

  const getImageUrl = (img: string) => {
    if (!img) return "";
    if (img.startsWith("data:") || img.startsWith("http")) return img;
    return `${BACKEND_ORIGIN}${img}`;
  };

  // Form Fields
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [fieldLocation, setFieldLocation] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [contactCode, setContactCode] = useState("+91");
  const [contactNumber, setContactNumber] = useState("");
  const [photo, setPhoto] = useState("");
  const [empIdNumber, setEmpIdNumber] = useState("");
  const [designation, setDesignation] = useState("");
  const [joinedDate, setJoinedDate] = useState("");
  const [isValidWorking, setIsValidWorking] = useState(true);

  const fetchEmployees = async () => {
    setLoading(true);
    const token = localStorage.getItem("fmp_admin_token");
    try {
      const res = await fetch(`${API_BASE_URL}/employees`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && data.employees) {
        const mapped = data.employees.map((emp: any) => ({
          ...emp,
          id: emp._id
        }));
        setEmployees(mapped);
      } else {
        console.error("Failed to fetch employees:", data.message);
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setName("");
    setAddress("");
    setFieldLocation("");
    setBloodGroup("O+");
    setContactCode("+91");
    setContactNumber("");
    setPhoto("");
    setEmpIdNumber(getNextEmployeeId(employees));
    setDesignation("");
    setJoinedDate(new Date().toISOString().split("T")[0]);
    setIsValidWorking(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setAddress(emp.address);
    setFieldLocation(emp.fieldLocation);
    setBloodGroup(emp.bloodGroup);
    
    const parsedPhone = splitPhoneNumber(emp.contactNumber);
    setContactCode(parsedPhone.code);
    setContactNumber(parsedPhone.number);
    
    setPhoto(emp.photo);
    setEmpIdNumber(emp.empIdNumber);
    setDesignation(emp.designation);
    setJoinedDate(emp.joinedDate);
    setIsValidWorking(emp.isValidWorking);
    setIsModalOpen(true);
  };

  // Convert uploaded image to Base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        alert("File size should not exceed 1.5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      const token = localStorage.getItem("fmp_admin_token");
      try {
        const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setEmployees(employees.filter((emp) => emp.id !== id));
        } else {
          alert("Failed to delete employee: " + (data.message || "Unknown error"));
        }
      } catch (err) {
        console.error("Error deleting employee:", err);
        alert("Network error occurred while deleting employee.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !empIdNumber.trim() || !designation.trim() || !contactNumber.trim()) {
      alert("Please fill in all mandatory fields.");
      return;
    }

    const fullContact = `${contactCode} ${contactNumber}`.trim();
    const token = localStorage.getItem("fmp_admin_token");

    const employeePayload = {
      name,
      address,
      fieldLocation,
      bloodGroup,
      contactNumber: fullContact,
      photo,
      empIdNumber,
      designation,
      joinedDate,
      isValidWorking,
    };

    try {
      if (editingEmployee) {
        // Edit mode
        const res = await fetch(`${API_BASE_URL}/employees/${editingEmployee.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(employeePayload)
        });
        const data = await res.json();
        if (data.success && data.employee) {
          const updatedEmp = { ...data.employee, id: data.employee._id };
          setEmployees(employees.map((emp) => emp.id === editingEmployee.id ? updatedEmp : emp));
          setIsModalOpen(false);
        } else {
          alert("Failed to update employee: " + (data.message || "Unknown error"));
        }
      } else {
        // Add mode
        const res = await fetch(`${API_BASE_URL}/employees`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(employeePayload)
        });
        const data = await res.json();
        if (data.success && data.employee) {
          const newEmp = { ...data.employee, id: data.employee._id };
          setEmployees([newEmp, ...employees]);
          setIsModalOpen(false);
        } else {
          alert("Failed to create employee: " + (data.message || "Unknown error"));
        }
      }
    } catch (err) {
      console.error("Error saving employee:", err);
      alert("Network error occurred while saving employee.");
    }
  };

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return employees;
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(term) ||
        emp.empIdNumber.toLowerCase().includes(term) ||
        emp.designation.toLowerCase().includes(term) ||
        emp.fieldLocation.toLowerCase().includes(term)
    );
  }, [employees, searchTerm]);

  // Utility to render placeholder avatar based on name initials
  const getInitials = (n: string) => {
    const parts = n.split(" ");
    return parts.map((p) => p[0]).join("").substring(0, 2).toUpperCase() || "E";
  };

  return (
    <>
      <div className="space-y-6 w-full animate-fade-in-up text-left">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              Employee Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Add, edit, view, or remove employee records and field personnel details
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition duration-250 cursor-pointer text-xs shrink-0 self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          Add Employee
        </button>
      </div>

      {/* Search Filter Row */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, designation, zone or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 text-xs font-semibold pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition shadow-sm"
        />
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-955/20 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                <th className="py-4 px-6">Employee Info</th>
                <th className="py-4 px-6">ID & Designation</th>
                <th className="py-4 px-6">Contact Info</th>
                <th className="py-4 px-6">Field Location</th>
                <th className="py-4 px-6">Joined Date</th>
                <th className="py-4 px-6">Working Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/5 transition">
                  {/* Photo & Name / Blood */}
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      {emp.photo ? (
                        <img
                          src={getImageUrl(emp.photo)}
                          alt={emp.name}
                          className="h-10 w-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-xs shrink-0 border border-slate-250/25">
                          {getInitials(emp.name)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{emp.name}</h4>
                        <span className="inline-flex items-center gap-0.5 mt-0.5 text-[10px] font-black bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-md border border-rose-100 dark:border-rose-900/30">
                          <Heart className="h-2.5 w-2.5 fill-rose-600 dark:fill-rose-400 stroke-none" />
                          Blood: {emp.bloodGroup}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* ID & Designation */}
                  <td className="py-3.5 px-6">
                    <div className="space-y-0.5">
                      <span className="font-bold text-[11px] text-slate-450 dark:text-slate-500 tracking-wide uppercase font-mono block">
                        {emp.empIdNumber}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                        {emp.designation}
                      </span>
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-400">
                      <Phone className="h-3.5 w-3.5 text-slate-450 shrink-0" />
                      {emp.contactNumber}
                    </div>
                  </td>

                  {/* Field Location */}
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-1.5 text-slate-650 dark:text-slate-350 font-bold">
                      <MapPin className="h-3.5 w-3.5 text-slate-455 shrink-0" />
                      {emp.fieldLocation || "Not Assigned"}
                    </div>
                  </td>

                  {/* Joined Date */}
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-bold">
                      <Calendar className="h-3.5 w-3.5 text-slate-455 shrink-0" />
                      {emp.joinedDate}
                    </div>
                  </td>

                  {/* Working Status */}
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center gap-1 text-[10.5px] font-black uppercase px-2.5 py-1 rounded-full border ${
                        emp.isValidWorking
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-850 dark:text-emerald-300"
                          : "bg-slate-50 border-slate-300 text-slate-500 dark:bg-slate-950/20 dark:border-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {emp.isValidWorking ? "Active / Working" : "Inactive"}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(emp)}
                        title="Edit Employee Detail"
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteEmployee(emp.id)}
                        title="Delete Record"
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-955/30 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-450 transition cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No employee records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* CRUD Modal Form overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800/80 max-w-xl w-full relative overflow-hidden flex flex-col max-h-[90vh] animate-zoom-in">
            {/* Background design accents */}
            <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/5 rounded-full blur-xl -translate-y-5 translate-x-5 pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-32 w-32 bg-indigo-500/5 rounded-full blur-xl translate-y-5 -translate-x-5 pointer-events-none" />

            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                    {editingEmployee ? "Edit Employee Record" : "Add New Employee"}
                  </h3>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                    Enter valid information for verification
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-955 hover:bg-rose-50 dark:hover:bg-rose-955/20 text-slate-450 hover:text-rose-600 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable form) */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                  />
                </div>

                {/* 7. Employee ID Number */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    Employee ID Number *
                  </label>
                  <input
                    type="text"
                    disabled
                    value={empIdNumber}
                    className="w-full bg-slate-100 dark:bg-slate-950/80 text-xs px-3.5 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 outline-none text-slate-500 dark:text-slate-400 font-mono font-bold cursor-not-allowed"
                  />
                </div>

                {/* 8. Employee Designation */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Field Officer"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                  />
                </div>

                {/* 4. Blood Group */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    Blood Group *
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold cursor-pointer"
                  >
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Contact Number */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    Contact Number *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={contactCode}
                      onChange={(e) => setContactCode(e.target.value)}
                      className="w-24 bg-slate-50 dark:bg-slate-955 text-xs px-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-955 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold cursor-pointer shrink-0 text-center"
                    >
                      {CALLING_CODES.map((code) => (
                        <option key={code} value={code}>
                          {code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 98765 43210"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-955 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                    />
                  </div>
                </div>

                {/* 3. Field Location */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    Field Location / Zone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vijay Nagar Zone"
                    value={fieldLocation}
                    onChange={(e) => setFieldLocation(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                  />
                </div>

                {/* 9. Joined Date */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    Joined Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={joinedDate}
                    onChange={(e) => setJoinedDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold cursor-pointer"
                  />
                </div>

                {/* 2. Address */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    Residential Address
                  </label>
                  <textarea
                    rows={2.5}
                    placeholder="Enter permanent or current residential address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold resize-none"
                  />
                </div>

                {/* 6. Photo upload */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block">
                    Profile Photo
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-955">
                    {photo ? (
                      <div className="relative group shrink-0">
                        <img
                          src={getImageUrl(photo)}
                          alt="Preview"
                          className="h-16 w-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => setPhoto("")}
                          className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white p-0.5 rounded-full hover:bg-rose-700 transition cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-800 shrink-0">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                    <div className="space-y-1.5 text-center sm:text-left">
                      <input
                        type="file"
                        accept="image/*"
                        id="empPhotoFile"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="empPhotoFile"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-sm shadow-indigo-600/10"
                      >
                        Upload Photo
                      </label>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                        JPG, PNG formats supported. Max size 1.5MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 10. Valid Working Option */}
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-250/50 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-955/5">
                    <div className="space-y-0.5 text-left">
                      <label className="text-[10.5px] font-black uppercase text-slate-900 dark:text-white tracking-wide">
                        Valid Working Status
                      </label>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">
                        Designate if this employee is currently working with valid credentials
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsValidWorking(!isValidWorking)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none align-middle ${
                        isValidWorking ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isValidWorking ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

              </div>

              {/* Form Actions Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/10"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {editingEmployee ? "Save Changes" : "Create Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
