"use client";

import { useState } from "react";
import { Extraction, ExtractedPlace, extractionAPI } from "@/lib/api";
import toast from "react-hot-toast";
import {
  Download,
  Search,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ResultsTableProps {
  extraction: Extraction;
}

export default function ResultsTable({ extraction }: ResultsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [contactFilter, setContactFilter] = useState<"all" | "yes" | "no">("all");
  const [websiteFilter, setWebsiteFilter] = useState<"all" | "yes" | "no">("all");
  const [sortBy, setSortBy] = useState<"none" | "rating-high" | "rating-low">("none");

  // Apply filters and sorting
  let filteredResults = extraction.results.filter((place) => {
    // Search filter
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      place.name.toLowerCase().includes(search) ||
      place.address.toLowerCase().includes(search) ||
      place.category.toLowerCase().includes(search) ||
      place.phone.toLowerCase().includes(search);

    if (!matchesSearch) return false;

    // Contact filter (phone or email)
    const hasContact = !!(place.phone || place.email);
    if (contactFilter === "yes" && !hasContact) {
      return false;
    }
    if (contactFilter === "no" && hasContact) {
      return false;
    }

    // Website filter
    const hasWebsite = !!place.website;
    if (websiteFilter === "yes" && !hasWebsite) {
      return false;
    }
    if (websiteFilter === "no" && hasWebsite) {
      return false;
    }

    return true;
  });

  // Apply sorting
  if (sortBy === "rating-high") {
    filteredResults = [...filteredResults].sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "rating-low") {
    filteredResults = [...filteredResults].sort((a, b) => a.rating - b.rating);
  }

  // Pagination calculations
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResults = filteredResults.slice(startIndex, endIndex);

  // Reset to page 1 when search term changes
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleExportCSV = async () => {
    setDownloading(true);
    try {
      const response = await extractionAPI.exportToCSV(extraction._id);

      // Create a blob from the response
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `google-maps-${extraction.keyword.replace(/\s+/g, "-")}-${Date.now()}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("CSV exported successfully!");
    } catch {
      toast.error("Failed to export CSV");
    } finally {
      setDownloading(false);
    }
  };

  const getGoogleMapsUrl = (place: ExtractedPlace) => {
    const query = encodeURIComponent(`${place.name}, ${place.address}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold">{extraction.keyword}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {extraction.totalResults} results found
            {extraction.duplicatesSkipped > 0 &&
              ` • ${extraction.duplicatesSkipped} duplicates skipped`}
            {extraction.withoutPhoneSkipped > 0 &&
              ` • ${extraction.withoutPhoneSkipped} without phone skipped`}
            {(extraction.withoutWebsiteSkipped || 0) > 0 &&
              ` • ${extraction.withoutWebsiteSkipped} without website skipped`}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={downloading}
          className="btn-primary flex items-center space-x-2 whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? "Exporting..." : "Export CSV"}</span>
        </button>
      </div>

      {/* Search and Items Per Page */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search results..."
              className="input-field pl-10"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="itemsPerPage" className="text-sm text-gray-700 whitespace-nowrap">
            Show:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="input-field py-2 px-3 w-20"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-700">per page</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center flex-1">
          {/* Contact Filter */}
          <div className="flex items-center space-x-2">
            <label
              htmlFor="contactFilter"
              className="text-sm font-medium text-gray-700 whitespace-nowrap"
            >
              Contact:
            </label>
            <select
              id="contactFilter"
              value={contactFilter}
              onChange={(e) => {
                setContactFilter(e.target.value as "all" | "yes" | "no");
                setCurrentPage(1);
              }}
              className="input-field py-2 px-3 text-sm"
            >
              <option value="all">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {/* Website Filter */}
          <div className="flex items-center space-x-2">
            <label
              htmlFor="websiteFilter"
              className="text-sm font-medium text-gray-700 whitespace-nowrap"
            >
              Website:
            </label>
            <select
              id="websiteFilter"
              value={websiteFilter}
              onChange={(e) => {
                setWebsiteFilter(e.target.value as "all" | "yes" | "no");
                setCurrentPage(1);
              }}
              className="input-field py-2 px-3 text-sm"
            >
              <option value="all">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {/* Sort by Rating */}
          <div className="flex items-center space-x-2">
            <label
              htmlFor="sortRating"
              className="text-sm font-medium text-gray-700 whitespace-nowrap"
            >
              Sort by:
            </label>
            <select
              id="sortRating"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as "none" | "rating-high" | "rating-low");
                setCurrentPage(1);
              }}
              className="input-field py-2 px-3 text-sm"
            >
              <option value="none">Default</option>
              <option value="rating-high">Rating: High to Low</option>
              <option value="rating-low">Rating: Low to High</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(contactFilter !== "all" || websiteFilter !== "all" || sortBy !== "none") && (
          <button
            onClick={() => {
              setContactFilter("all");
              setWebsiteFilter("all");
              setSortBy("none");
              setCurrentPage(1);
            }}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Table */}
      {filteredResults.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No results found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Website
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedResults.map((place, index) => (
                  <tr key={startIndex + index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">{startIndex + index + 1}</td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <a
                            href={getGoogleMapsUrl(place)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                          >
                            <span>{place.name || "Business Name"}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {place.category || "Category"}
                        </div>
                        {place.address && (
                          <a
                            href={getGoogleMapsUrl(place)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start space-x-1 text-sm text-gray-500 mt-1 hover:text-primary-600"
                          >
                            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{place.address}</span>
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {place.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <a
                              href={`tel:${place.phone}`}
                              className="text-sm text-primary-600 hover:text-primary-700 whitespace-nowrap"
                            >
                              {place.phone}
                            </a>
                          </div>
                        )}
                        {place.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <a
                              href={`mailto:${place.email}`}
                              className="text-sm text-primary-600 hover:text-primary-700 truncate"
                            >
                              {place.email}
                            </a>
                          </div>
                        )}
                        {!place.phone && !place.email && (
                          <span className="text-sm text-gray-400">No contact info</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {place.rating > 0 ? (
                        <div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-semibold">{place.rating.toFixed(1)}</span>
                          </div>
                          {place.reviewsCount > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {place.reviewsCount.toLocaleString()} reviews
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No rating</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {place.website ? (
                        <a
                          href={place.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
                        >
                          <span className="truncate max-w-xs">{place.website}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">No website</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Showing info */}
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredResults.length)} of{" "}
                  {filteredResults.length} results
                </div>

                {/* Pagination controls */}
                <div className="flex items-center space-x-2">
                  {/* Previous button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center space-x-1">
                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => (typeof page === "number" ? handlePageChange(page) : null)}
                        disabled={page === "..."}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          page === currentPage
                            ? "bg-primary-600 text-white"
                            : page === "..."
                              ? "text-gray-400 cursor-default"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        } ${page === "..." ? "" : "min-w-[40px]"}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  {/* Next button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
