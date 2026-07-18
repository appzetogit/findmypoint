import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Eye,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  Mail,
  User,
  Briefcase,
  Calendar,
  Heart,
  Plus,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Building,
  Award,
} from "lucide-react";
import { UserProfile, AddressItem } from "../data/usersData";
import { createPortal } from "react-dom";
import { API_BASE_URL } from "../config";

export default function UsersManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // View / Edit States
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [activeEditTab, setActiveEditTab] = useState<"personal" | "addresses">("personal");

  // New address state within edit modal
  const [newAddr, setNewAddr] = useState<Omit<AddressItem, "id">>({
    name: "",
    phone: "",
    email: "",
    address: "",
    pincode: "",
    city: "",
    landlineStd: "",
    landlineNum: "",
    tag: "Home",
  });

  const loadUsersData = async () => {
    const token = localStorage.getItem("fmp_admin_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && data.users) {
        const mappedUsers: UserProfile[] = data.users.map((u: any) => ({
          id: u._id,
          personal: {
            title: u.title || "",
            firstName: u.firstName || "",
            middleName: u.middleName || "",
            lastName: u.lastName || "",
            dobDD: u.dobDD || "",
            dobMM: u.dobMM || "",
            dobYYYY: u.dobYYYY || "",
            maritalStatus: u.maritalStatus || "",
            occupation: u.occupation || "",
            mobile1: u.mobile1 || "",
            mobile2: u.mobile2 || "",
            avatar: u.avatar || "",
          },
          addresses: u.addresses ? u.addresses.map((a: any) => ({
            id: a._id || a.id,
            name: a.name || "",
            phone: a.phone || "",
            email: a.email || "",
            address: a.address || "",
            pincode: a.pincode || "",
            city: a.city || "",
            landlineStd: a.landlineStd || "",
            landlineNum: a.landlineNum || "",
            tag: a.tag || "Home",
          })) : [],
          selectedFavorites: u.selectedFavorites || [],
        }));
        setUsers(mappedUsers);
      }
    } catch (err) {
      console.error("Failed to fetch admin users", err);
    }
  };

  useEffect(() => {
    loadUsersData();
  }, []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const fullName =
        `${user.personal.title || ""} ${user.personal.firstName || ""} ${user.personal.middleName || ""} ${user.personal.lastName || ""}`.toLowerCase();
      const phoneMatch =
        (user.personal.mobile1 || "").includes(searchTerm) ||
        (user.personal.mobile2 || "").includes(searchTerm);
      const emailMatch = user.addresses.some((a) =>
        (a.email || "").toLowerCase().includes(searchTerm.toLowerCase()),
      );
      const cityMatch = user.addresses.some((a) =>
        (a.city || "").toLowerCase().includes(searchTerm.toLowerCase()),
      );
      const occupationMatch = (user.personal.occupation || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        phoneMatch ||
        emailMatch ||
        cityMatch ||
        occupationMatch
      );
    });
  }, [users, searchTerm]);

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const currentUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      const token = localStorage.getItem("fmp_admin_token");
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setUsers(users.filter((u) => u.id !== id));
          alert("User deleted successfully!");
        } else {
          alert(data.message || "Failed to delete user");
        }
      } catch (err) {
        console.error("Failed to delete user", err);
        alert("An error occurred while deleting the user.");
      }
    }
  };

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(JSON.parse(JSON.stringify(user))); // Deep clone
    setActiveEditTab("personal");
    setNewAddr({
      name: user.personal.firstName + " " + user.personal.lastName,
      phone: user.personal.mobile1,
      email: "",
      address: "",
      pincode: "",
      city: "",
      landlineStd: "",
      landlineNum: "",
      tag: "Home",
    });
  };

  const handleUpdatePersonalField = (field: keyof UserProfile["personal"], value: string) => {
    if (!editingUser) return;
    setEditingUser({
      ...editingUser,
      personal: {
        ...editingUser.personal,
        [field]: value,
      },
    });
  };

  const handleAddAddress = () => {
    if (!editingUser) return;
    if (!newAddr.address || !newAddr.city || !newAddr.pincode) {
      alert("Address, City, and Pincode are required!");
      return;
    }
    const addressWithId: AddressItem = {
      ...newAddr,
      id: "addr-" + Math.random().toString(36).substring(2, 9),
    };

    setEditingUser({
      ...editingUser,
      addresses: [...editingUser.addresses, addressWithId],
    });

    // Reset address form
    setNewAddr({
      name: editingUser.personal.firstName + " " + editingUser.personal.lastName,
      phone: editingUser.personal.mobile1,
      email: "",
      address: "",
      pincode: "",
      city: "",
      landlineStd: "",
      landlineNum: "",
      tag: "Home",
    });
  };

  const handleDeleteAddress = (addrId: string) => {
    if (!editingUser) return;
    setEditingUser({
      ...editingUser,
      addresses: editingUser.addresses.filter((a) => a.id !== addrId),
    });
  };

  const handleSaveUserEdit = async () => {
    if (!editingUser) return;

    const token = localStorage.getItem("fmp_admin_token");
    if (!token) return;

    try {
      const body = {
        title: editingUser.personal.title,
        firstName: editingUser.personal.firstName,
        middleName: editingUser.personal.middleName,
        lastName: editingUser.personal.lastName,
        dobDD: editingUser.personal.dobDD,
        dobMM: editingUser.personal.dobMM,
        dobYYYY: editingUser.personal.dobYYYY,
        maritalStatus: editingUser.personal.maritalStatus,
        occupation: editingUser.personal.occupation,
        mobile1: editingUser.personal.mobile1,
        mobile2: editingUser.personal.mobile2,
        avatar: editingUser.personal.avatar,
        addresses: editingUser.addresses.map((a) => ({
          _id: a.id.startsWith("addr-") ? undefined : a.id,
          name: a.name,
          phone: a.phone,
          email: a.email,
          address: a.address,
          pincode: a.pincode,
          city: a.city,
          landlineStd: a.landlineStd,
          landlineNum: a.landlineNum,
          tag: a.tag
        })),
        selectedFavorites: editingUser.selectedFavorites
      };

      const res = await fetch(`${API_BASE_URL}/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success && data.user) {
        const u = data.user;
        const updatedUser: UserProfile = {
          id: u._id,
          personal: {
            title: u.title || "",
            firstName: u.firstName || "",
            middleName: u.middleName || "",
            lastName: u.lastName || "",
            dobDD: u.dobDD || "",
            dobMM: u.dobMM || "",
            dobYYYY: u.dobYYYY || "",
            maritalStatus: u.maritalStatus || "",
            occupation: u.occupation || "",
            mobile1: u.mobile1 || "",
            mobile2: u.mobile2 || "",
            avatar: u.avatar || "",
          },
          addresses: u.addresses ? u.addresses.map((a: any) => ({
            id: a._id || a.id,
            name: a.name || "",
            phone: a.phone || "",
            email: a.email || "",
            address: a.address || "",
            pincode: a.pincode || "",
            city: a.city || "",
            landlineStd: a.landlineStd || "",
            landlineNum: a.landlineNum || "",
            tag: a.tag || "Home",
          })) : [],
          selectedFavorites: u.selectedFavorites || []
        };

        const updatedList = users.map((item) => (item.id === updatedUser.id ? updatedUser : item));
        setUsers(updatedList);
        setEditingUser(null);
        alert("User details updated successfully!");
      } else {
        alert(data.message || "Failed to update user");
      }
    } catch (err) {
      console.error("Failed to update user", err);
      alert("An error occurred while updating the user.");
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingUser) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdatePersonalField("avatar", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 w-full animate-fade-in-up">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-500 shrink-0 shadow-sm">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              Users Directory
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage and view details of registered application users
            </p>
          </div>
        </div>
      </div>

      {/* Search Filter Row */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name, contact, city, occupation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 text-xs font-semibold pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition shadow-sm"
          />
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-16 px-4 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl bg-white/50 dark:bg-slate-900/50">
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            No users found matching your search.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border-t border-b border-slate-200/60 dark:border-slate-800/60">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-transparent text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500">
                <th className="py-3.5 px-6">User details</th>
                <th className="py-3.5 px-6">Mobile 1</th>
                <th className="py-3.5 px-6">Occupation</th>
                <th className="py-3.5 px-6">Locations (Cities)</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-[13px] text-slate-700 dark:text-slate-350">
              {currentUsers.map((user) => {
                const uniqueCities = Array.from(
                  new Set(user.addresses.map((a) => a.city).filter(Boolean)),
                );
                return (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/40 dark:hover:bg-slate-950/10 transition-colors"
                  >
                    {/* User Details */}
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full overflow-hidden border border-slate-200/50 bg-slate-100 flex items-center justify-center shrink-0">
                          {user.personal.avatar ? (
                            <img
                              src={user.personal.avatar}
                              alt="Avatar"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-4.5 w-4.5 text-slate-450" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block leading-snug">
                            {`${user.personal.firstName} ${user.personal.middleName || ""} ${user.personal.lastName}`.replace(/\s+/g, " ").trim()}
                          </span>
                          <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider leading-none">
                            {user.personal.maritalStatus}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Mobile 1 */}
                    <td className="py-3 px-6 text-slate-600 dark:text-slate-450">
                      <span className="flex items-center gap-1.5 font-semibold text-[11.5px]">
                        <Phone className="h-3 w-3 text-slate-400" />
                        +91 {user.personal.mobile1}
                      </span>
                    </td>

                    {/* Occupation */}
                    <td className="py-3 px-6 text-slate-600 dark:text-slate-450">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                        {user.personal.occupation || "N/A"}
                      </span>
                    </td>

                    {/* Locations */}
                    <td className="py-3 px-6 text-slate-500 dark:text-slate-400">
                      {uniqueCities.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {uniqueCities.map((city, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-650 dark:text-slate-350"
                            >
                              <MapPin className="h-2.5 w-2.5 text-rose-500/80" />
                              {city}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No address saved</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Eye Icon (View Details) */}
                        <button
                          onClick={() => setViewingUser(user)}
                          title="View Details"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-slate-200 transition cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(user)}
                          title="Edit User"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-slate-200 transition cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(user.id)}
                          title="Delete User"
                          className="p-1.5 rounded-lg border border-rose-100 dark:border-rose-950/40 bg-rose-50/50 dark:bg-rose-950/10 hover:bg-rose-100/60 dark:hover:bg-rose-900/25 text-rose-600 dark:text-rose-450 transition cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
      {filteredUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 text-left">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Showing{" "}
            <span className="text-slate-800 dark:text-slate-250">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="text-slate-800 dark:text-slate-250">
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
            </span>{" "}
            of <span className="text-slate-850 dark:text-slate-200">{filteredUsers.length}</span>{" "}
            users
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold transition text-xs flex items-center gap-1 ${
                currentPage === 1
                  ? "text-slate-300 dark:text-slate-700 cursor-not-allowed border-slate-100 dark:border-slate-850"
                  : "text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              <ChevronLeft className="h-4.5 w-4.5" />
              <span>Prev</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                  currentPage === num
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-sm"
                    : "border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                }`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold transition text-xs flex items-center gap-1 ${
                currentPage === totalPages
                  ? "text-slate-300 dark:text-slate-700 cursor-not-allowed border-slate-100 dark:border-slate-850"
                  : "text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              <span>Next</span>
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW USER DETAILS MODAL (Eye Icon) */}
      {viewingUser &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl animate-fade-in text-left my-auto">
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-150 dark:border-slate-800 mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center text-indigo-650 dark:text-indigo-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                      User Profile Summary
                    </h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      Full archive details of the registered user account
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingUser(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-6">
                {/* Profile Card Overlay (Personal Details Section) */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 flex flex-col md:flex-row gap-5 items-center md:items-start">
                  {/* Avatar Column */}
                  <div className="h-20 w-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center shrink-0 shadow-sm">
                    {viewingUser.personal.avatar ? (
                      <img
                        src={viewingUser.personal.avatar}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-9 w-9 text-slate-300 dark:text-slate-700" />
                    )}
                  </div>

                  {/* Profile fields */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-xs w-full">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                        Full Name
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-[13px]">
                        {`${viewingUser.personal.firstName} ${viewingUser.personal.middleName || ""} ${viewingUser.personal.lastName}`.replace(
                          /\s+/g,
                          " ",
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                        Date of Birth (DOB)
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-[13px]">
                        {viewingUser.personal.dobDD
                          ? `${viewingUser.personal.dobDD} ${viewingUser.personal.dobMM} ${viewingUser.personal.dobYYYY}`
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                        Marital Status
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-[13px]">
                        {viewingUser.personal.maritalStatus || "Single"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                        Occupation
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-[13px]">
                        {viewingUser.personal.occupation || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                        Phone Contact
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-[13px]">
                        +91 {viewingUser.personal.mobile1}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                        WhatsApp Contact
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-[13px]">
                        {viewingUser.personal.mobile2
                          ? `+91 ${viewingUser.personal.mobile2}`
                          : "Not Added"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Saved Addresses Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4.5 w-4.5 text-rose-500" />
                    <h4 className="font-serif text-[14.5px] font-bold text-slate-900 dark:text-white">
                      Configured Addresses ({viewingUser.addresses.length})
                    </h4>
                  </div>

                  {viewingUser.addresses.length === 0 ? (
                    <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <p className="text-xs text-slate-450 italic">No addresses added yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {viewingUser.addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs relative overflow-hidden flex flex-col justify-between"
                        >
                          {/* Address tag */}
                          <div className="absolute top-2 right-2">
                            <span
                              className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                addr.tag === "Home"
                                  ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-650 dark:text-indigo-400"
                                  : addr.tag === "Office"
                                    ? "bg-amber-50 dark:bg-amber-950/50 text-amber-650 dark:text-amber-400"
                                    : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-650 dark:text-emerald-400"
                              }`}
                            >
                              {addr.tag}
                            </span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="font-extrabold text-slate-900 dark:text-white pr-10">
                              {addr.name}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                              {addr.address}
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-850/50 text-[11px] text-slate-450 font-semibold">
                              <div>
                                City:{" "}
                                <span className="text-slate-700 dark:text-slate-300 font-bold">
                                  {addr.city}
                                </span>
                              </div>
                              <div>
                                Pincode:{" "}
                                <span className="text-slate-700 dark:text-slate-300 font-bold">
                                  {addr.pincode}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1 pt-1">
                              {addr.phone && (
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                  <Phone className="h-3 w-3 text-slate-400" />
                                  <span>
                                    Phone:{" "}
                                    <span className="font-bold text-slate-755 dark:text-slate-300">
                                      +91 {addr.phone}
                                    </span>
                                  </span>
                                </div>
                              )}
                              {addr.email && (
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                  <Mail className="h-3 w-3 text-slate-400" />
                                  <span className="truncate">
                                    Email:{" "}
                                    <span className="font-bold text-slate-755 dark:text-slate-300">
                                      {addr.email}
                                    </span>
                                  </span>
                                </div>
                              )}
                              {addr.landlineNum && (
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                  <Building className="h-3 w-3 text-slate-400" />
                                  <span>
                                    Landline:{" "}
                                    <span className="font-bold text-slate-755 dark:text-slate-300">
                                      {addr.landlineStd}-{addr.landlineNum}
                                    </span>
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Favorites category tags */}
                {viewingUser.selectedFavorites && viewingUser.selectedFavorites.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-450">
                      <Award className="h-4 w-4 text-amber-500" />
                      <span>Favorited Categories</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {viewingUser.selectedFavorites.map((fav) => (
                        <span
                          key={fav}
                          className="inline-block text-[11px] font-bold bg-indigo-500/10 dark:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-xl uppercase tracking-tight"
                        >
                          {fav}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setViewingUser(null)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 text-xs font-black px-6 py-3 rounded-xl transition cursor-pointer"
                >
                  Close View
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* EDIT USER DETAILS MODAL */}
      {editingUser &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl animate-fade-in text-left my-auto">
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-150 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                    <Edit2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                      Edit User Account
                    </h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      Update account records and addresses of {editingUser.personal.firstName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs Row */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveEditTab("personal")}
                  className={`px-4 py-2.5 text-xs font-black transition-all cursor-pointer border-b-2 -mb-[2px] ${
                    activeEditTab === "personal"
                      ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400"
                      : "border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Personal Profile
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEditTab("addresses")}
                  className={`px-4 py-2.5 text-xs font-black transition-all cursor-pointer border-b-2 -mb-[2px] ${
                    activeEditTab === "addresses"
                      ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400"
                      : "border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Manage Addresses ({editingUser.addresses.length})
                </button>
              </div>

              {/* Tabs Content */}
              <div className="space-y-6">
                {/* TAB 1: PERSONAL DETAILS */}
                {activeEditTab === "personal" && (
                  <div className="space-y-5">
                    {/* Avatar Upload */}
                    <div className="flex items-center gap-4.5 bg-slate-50 dark:bg-slate-950/20 p-4.5 rounded-2xl border border-slate-150 dark:border-slate-850">
                      <div className="h-16 w-16 rounded-xl overflow-hidden border border-slate-250 bg-slate-100 flex items-center justify-center shrink-0">
                        {editingUser.personal.avatar ? (
                          <img
                            src={editingUser.personal.avatar}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-7 w-7 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider mb-1.5">
                          Avatar Image
                        </span>
                        <label className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg transition duration-200 cursor-pointer text-[10.5px] inline-block shadow-sm">
                          Change Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                      {/* First Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={editingUser.personal.firstName}
                          onChange={(e) => handleUpdatePersonalField("firstName", e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold"
                        />
                      </div>

                      {/* Middle Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">
                          Middle Name
                        </label>
                        <input
                          type="text"
                          value={editingUser.personal.middleName}
                          onChange={(e) => handleUpdatePersonalField("middleName", e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold"
                        />
                      </div>

                      {/* Last Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={editingUser.personal.lastName}
                          onChange={(e) => handleUpdatePersonalField("lastName", e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold"
                        />
                      </div>

                      {/* Date Of Birth */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">
                          Date of Birth (DOB)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {/* Day */}
                          <input
                            type="text"
                            placeholder="DD"
                            value={editingUser.personal.dobDD}
                            onChange={(e) => handleUpdatePersonalField("dobDD", e.target.value)}
                            maxLength={2}
                            className="w-full bg-slate-50 dark:bg-slate-950 text-xs text-center px-2 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold"
                          />
                          {/* Month */}
                          <select
                            value={editingUser.personal.dobMM}
                            onChange={(e) => handleUpdatePersonalField("dobMM", e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-2 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold cursor-pointer"
                          >
                            <option value="January">January</option>
                            <option value="February">February</option>
                            <option value="March">March</option>
                            <option value="April">April</option>
                            <option value="May">May</option>
                            <option value="June">June</option>
                            <option value="July">July</option>
                            <option value="August">August</option>
                            <option value="September">September</option>
                            <option value="October">October</option>
                            <option value="November">November</option>
                            <option value="December">December</option>
                          </select>
                          {/* Year */}
                          <input
                            type="text"
                            placeholder="YYYY"
                            value={editingUser.personal.dobYYYY}
                            onChange={(e) => handleUpdatePersonalField("dobYYYY", e.target.value)}
                            maxLength={4}
                            className="w-full bg-slate-50 dark:bg-slate-950 text-xs text-center px-2 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold"
                          />
                        </div>
                      </div>

                      {/* Marital Status */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">
                          Marital Status
                        </label>
                        <select
                          value={editingUser.personal.maritalStatus}
                          onChange={(e) =>
                            handleUpdatePersonalField("maritalStatus", e.target.value)
                          }
                          className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold cursor-pointer"
                        >
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      </div>

                      {/* Occupation */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">
                          Occupation
                        </label>
                        <input
                          type="text"
                          value={editingUser.personal.occupation}
                          onChange={(e) => handleUpdatePersonalField("occupation", e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold"
                        />
                      </div>

                      {/* Mobile 1 */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">
                          Mobile Number 1
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-xs text-slate-450 font-bold">
                            +91
                          </span>
                          <input
                            type="text"
                            value={editingUser.personal.mobile1}
                            onChange={(e) => handleUpdatePersonalField("mobile1", e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 text-xs pl-11 pr-3 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold"
                          />
                        </div>
                      </div>

                      {/* Mobile 2 (WhatsApp) */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">
                          WhatsApp Number
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-xs text-slate-450 font-bold">
                            +91
                          </span>
                          <input
                            type="text"
                            value={editingUser.personal.mobile2}
                            onChange={(e) => handleUpdatePersonalField("mobile2", e.target.value)}
                            placeholder="Same as mobile or write here"
                            className="w-full bg-slate-50 dark:bg-slate-950 text-xs pl-11 pr-3 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: ADDRESSES MANAGEMENT */}
                {activeEditTab === "addresses" && (
                  <div className="space-y-6">
                    {/* Add New Address Node Section */}
                    <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 space-y-4">
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase text-indigo-600 dark:text-indigo-400">
                        <Plus className="h-4 w-4" />
                        <span>Add Address Node</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Recipient Name */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-450">
                            Recipient Name
                          </label>
                          <input
                            type="text"
                            value={newAddr.name}
                            onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                            className="w-full bg-white dark:bg-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-850 outline-none focus:border-indigo-500 transition font-medium"
                          />
                        </div>

                        {/* Contact Number */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-450">
                            Contact Number
                          </label>
                          <input
                            type="text"
                            value={newAddr.phone}
                            onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                            className="w-full bg-white dark:bg-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-850 outline-none focus:border-indigo-500 transition font-medium"
                          />
                        </div>

                        {/* Email Address */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-450">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={newAddr.email}
                            placeholder="recipient@example.com"
                            onChange={(e) => setNewAddr({ ...newAddr, email: e.target.value })}
                            className="w-full bg-white dark:bg-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-850 outline-none focus:border-indigo-500 transition font-medium"
                          />
                        </div>

                        {/* City */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-450">
                            City
                          </label>
                          <input
                            type="text"
                            placeholder="City"
                            value={newAddr.city}
                            onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                            className="w-full bg-white dark:bg-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-850 outline-none focus:border-indigo-500 transition font-medium"
                          />
                        </div>

                        {/* Pincode */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-450">
                            Pincode
                          </label>
                          <input
                            type="text"
                            placeholder="Pincode"
                            value={newAddr.pincode}
                            onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                            className="w-full bg-white dark:bg-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-850 outline-none focus:border-indigo-500 transition font-medium"
                          />
                        </div>

                        {/* Tag */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-450">
                            Tag
                          </label>
                          <select
                            value={newAddr.tag}
                            onChange={(e) => setNewAddr({ ...newAddr, tag: e.target.value })}
                            className="w-full bg-white dark:bg-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-850 outline-none focus:border-indigo-500 transition font-semibold cursor-pointer"
                          >
                            <option value="Home">Home</option>
                            <option value="Office">Office</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Address details text area */}
                      <div className="space-y-1 text-left">
                        <label className="text-[9px] font-black uppercase text-slate-450">
                          Address Details
                        </label>
                        <textarea
                          value={newAddr.address}
                          placeholder="House No, Floor, Street, Landmark details..."
                          onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })}
                          rows={2}
                          className="w-full bg-white dark:bg-slate-900 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 outline-none focus:border-indigo-500 transition font-medium"
                        />
                      </div>

                      {/* Landline */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-450">
                            Landline STD
                          </label>
                          <input
                            type="text"
                            placeholder="STD"
                            value={newAddr.landlineStd}
                            onChange={(e) =>
                              setNewAddr({ ...newAddr, landlineStd: e.target.value })
                            }
                            className="w-full bg-white dark:bg-slate-900 text-xs text-center px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-850 outline-none focus:border-indigo-500 transition font-medium"
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-450">
                            Landline Number (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="Landline Number"
                            value={newAddr.landlineNum}
                            onChange={(e) =>
                              setNewAddr({ ...newAddr, landlineNum: e.target.value })
                            }
                            className="w-full bg-white dark:bg-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-850 outline-none focus:border-indigo-500 transition font-medium"
                          />
                        </div>
                      </div>

                      {/* Add Address button */}
                      <button
                        type="button"
                        onClick={handleAddAddress}
                        className="bg-slate-850 text-white hover:bg-slate-950 dark:bg-slate-800 dark:hover:bg-slate-700 font-extrabold text-[11px] py-2 px-4 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Address Node
                      </button>
                    </div>

                    {/* Configured Addresses List */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider">
                        Addresses Configured ({editingUser.addresses.length})
                      </span>
                      {editingUser.addresses.length === 0 ? (
                        <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                          <p className="text-xs text-slate-450 italic">
                            No addresses saved yet. Use the form above to add a location node.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {editingUser.addresses.map((addr) => (
                            <div
                              key={addr.id}
                              className="p-4.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 shadow-xs relative flex flex-col justify-between"
                            >
                              {/* Delete address action */}
                              <button
                                type="button"
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="absolute top-2.5 right-2.5 p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/30 text-rose-500 hover:text-rose-600 transition cursor-pointer"
                                title="Delete Address"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>

                              <div className="space-y-2 text-xs">
                                {/* Tag */}
                                <span className="inline-block text-[8.5px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 px-2 py-0.5 rounded-full leading-none">
                                  {addr.tag}
                                </span>

                                <div className="font-bold text-slate-900 dark:text-white pr-6">
                                  {addr.name}
                                </div>
                                <div className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                  {addr.address}
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-450 font-semibold pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                                  <div>
                                    City:{" "}
                                    <span className="text-slate-700 dark:text-slate-300 font-bold">
                                      {addr.city}
                                    </span>
                                  </div>
                                  <div>
                                    Pin:{" "}
                                    <span className="text-slate-700 dark:text-slate-300 font-bold">
                                      {addr.pincode}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 text-xs font-black px-5 py-3 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveUserEdit}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-6 py-3 rounded-xl shadow-md transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
