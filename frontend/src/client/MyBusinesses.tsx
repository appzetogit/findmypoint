import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Search, Building, Star, Edit2, Eye, ClipboardList, X, Globe } from "lucide-react";
import { BusinessListingData } from "../data/businessesData";
import ServiceForm from "./ServiceForm";

interface MyBusinessesProps {
  filteredListings: BusinessListingData[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  onViewListing: (id: string) => void;
  onEditListing: (id: string) => void;
}

export default function MyBusinesses({
  filteredListings,
  searchTerm,
  setSearchTerm,
  onViewListing,
  onEditListing,
}: MyBusinessesProps) {
  const [viewFormListing, setViewFormListing] = useState<BusinessListingData | null>(null);
  return (
    <div className="space-y-6 animate-fade-in-up text-left">
      {/* Header Titles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Your Businesses</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage or update details for listings registered to you.</p>
        </div>
      </div>

      {/* Search Field */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search your listings by name, category or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 text-xs font-semibold pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none focus:border-indigo-500 transition shadow-sm"
        />
      </div>

      {/* Listings Data Grid */}
      {filteredListings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <Building className="h-12 w-12 mx-auto text-slate-400 mb-3" />
          <p className="text-sm font-semibold">No businesses match your search term.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-250/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider">
                  <th className="py-4 px-6">Business</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Rating</th>
                  <th className="py-4 px-6">Reviews</th>
                  <th className="py-4 px-6">Phone</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={listing.images[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80"}
                          alt={listing.name}
                          className="h-10 w-10 rounded-lg object-cover shrink-0 bg-slate-100 dark:bg-slate-800"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-[200px]">{listing.name}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[200px]">{listing.address}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">
                      {listing.category}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 font-black bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-lg border border-amber-250 dark:border-amber-900/30">
                        {listing.rating} <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-600 dark:text-slate-400">
                      {listing.reviewCount || 0} reviews
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-650 dark:text-slate-400">
                      {listing.phone}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {(() => {
                          const canonical = listing.canonicalUrl || `/${listing.citySlug || 'indore'}/${listing.localitySlug || 'vijay-nagar'}/${listing.slug || listing.id}`;
                          return (
                            <a
                              href={canonical}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 text-xs font-bold transition cursor-pointer shrink-0"
                              title="View Public Profile Page"
                            >
                              <Globe className="h-3.5 w-3.5" />
                              <span>Public Page</span>
                            </a>
                          );
                        })()}

                        <button
                          onClick={() => setViewFormListing(listing)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-bold transition cursor-pointer shrink-0"
                          title="View Service Form"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Form</span>
                        </button>

                        <button
                          onClick={() => onEditListing(listing.id)}
                          className="p-2 rounded-lg bg-slate-50 hover:bg-amber-50 dark:bg-slate-850 dark:hover:bg-amber-950/40 text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-800 transition cursor-pointer"
                          title="Edit Listing"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
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

      {/* Service Form Read-Only Preview Modal */}
      {viewFormListing && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col my-auto animate-scale-in text-left">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
                      {viewFormListing.category.split(" > ")[0]}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">• Read-Only Preview</span>
                  </div>
                  <h2 className="text-base font-bold font-serif text-slate-900 dark:text-white uppercase tracking-tight">
                    Service Form — {viewFormListing.name}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setViewFormListing(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 no-scrollbar bg-slate-50/40 dark:bg-slate-950/40">
              <ServiceForm business={viewFormListing} readOnly={true} onClose={() => setViewFormListing(null)} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
