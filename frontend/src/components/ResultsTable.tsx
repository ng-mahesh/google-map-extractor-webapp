"use client";

import { useState } from "react";
import { Extraction, ExtractedPlace, extractionAPI } from "@/lib/api";
import toast from "react-hot-toast";
import {
  Download,
  FileSpreadsheet,
  Search,
  Phone,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Globe,
  Navigation,
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
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<ExtractedPlace | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
    setShowExportMenu(false);
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

  // Helper function to clean data by removing prefixes and invalid characters
  const cleanData = (value: string | number): string => {
    if (typeof value !== "string") return String(value);

    // Remove common prefixes like "Address:", "Phone:", etc.
    let cleaned = value
      .replace(/^Address:\s*/i, "")
      .replace(/^Phone:\s*/i, "")
      .replace(/^Email:\s*/i, "")
      .replace(/^Website:\s*/i, "")
      .trim();

    // Replace invalid characters with proper ones
    cleaned = cleaned
      .replace(/·/g, "•") // Replace middle dot with bullet
      .replace(/□/g, "") // Remove empty box characters
      .replace(/☐/g, "") // Remove checkbox characters
      .replace(/[\u0000-\u001F]/g, "") // Remove control characters
      .replace(/\uFFFD/g, ""); // Remove replacement characters

    return cleaned;
  };

  // Helper function to format description with tick icons
  const formatDescription = (description: string): JSX.Element => {
    if (!description) return <></>;

    // Clean the description first
    let cleaned = cleanData(description);

    // Remove all special characters except spaces, letters, numbers, and common punctuation
    cleaned = cleaned.replace(/[^\w\s.,!?'-]/g, "");

    // Split by bullet points, middle dots, or multiple spaces
    const items = cleaned
      .split(/[•·]\s*|\s{2,}/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    return (
      <div className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <span key={index} className="inline-flex items-center gap-1 text-sm text-gray-600">
            <span className="text-green-600">✓</span>
            {item}
          </span>
        ))}
      </div>
    );
  };

  const handleExportExcel = async () => {
    setDownloading(true);
    setShowExportMenu(false);
    try {
      // Convert data to Excel format using a simple approach
      const XLSX = await import("xlsx");

      // Prepare data for Excel - clean all string values
      const excelData = extraction.results.map((place, index) => ({
        "#": index + 1,
        "Business Name": cleanData(place.name || ""),
        Category: cleanData(place.category || ""),
        Address: cleanData(place.address || ""),
        Phone: cleanData(place.phone || ""),
        Email: cleanData(place.email || ""),
        Website: cleanData(place.website || ""),
        Rating: place.rating || "",
        "Review Count": place.reviewsCount || "",
        Description: cleanData(place.description || ""),
        Price: cleanData(place.price || ""),
        "Opening Hours": place.openingHours?.join("; ") || "",
        "Is Open": place.isOpen ? "Yes" : "No",
        "Review URL": place.reviewUrl || "",
        "Place ID": place.placeId || "",
        CID: place.cid || "",
        KGMID: place.kgmid || "",
      }));

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

      // Set column widths
      worksheet["!cols"] = [
        { wch: 5 }, // #
        { wch: 30 }, // Business Name
        { wch: 20 }, // Category
        { wch: 40 }, // Address
        { wch: 15 }, // Phone
        { wch: 25 }, // Email
        { wch: 35 }, // Website
        { wch: 8 }, // Rating
        { wch: 12 }, // Review Count
        { wch: 50 }, // Description
        { wch: 10 }, // Price
        { wch: 50 }, // Opening Hours
        { wch: 8 }, // Is Open
        { wch: 50 }, // Review URL
        { wch: 30 }, // Place ID
        { wch: 20 }, // CID
        { wch: 20 }, // KGMID
      ];

      // Generate Excel file
      XLSX.writeFile(
        workbook,
        `google-maps-${extraction.keyword.replace(/\s+/g, "-")}-${Date.now()}.xlsx`
      );

      toast.success("Excel exported successfully!");
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("Failed to export Excel. Please try CSV instead.");
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

        {/* Export Button with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={downloading}
            className="btn-primary flex items-center space-x-2 whitespace-nowrap"
            onBlur={() => setTimeout(() => setShowExportMenu(false), 200)}
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? "Exporting..." : "Export"}</span>
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>

          {/* Export Dropdown Menu */}
          {showExportMenu && !downloading && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-google-lg border border-gray-200 py-2 z-10">
              <button
                onClick={handleExportCSV}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
              >
                <Download className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium">Export as CSV</div>
                  <div className="text-xs text-gray-500">Comma-separated values</div>
                </div>
              </button>
              <button
                onClick={handleExportExcel}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                <div>
                  <div className="font-medium">Export as Excel</div>
                  <div className="text-xs text-gray-500">Microsoft Excel format</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search and Items Per Page */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search results..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg hover:shadow-google focus:outline-none focus:shadow-google-lg transition-shadow duration-200 text-sm bg-white"
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
            className="appearance-none bg-white border border-gray-300 rounded-lg py-2.5 pl-3 pr-8 text-sm hover:shadow-google focus:outline-none focus:shadow-google-lg transition-shadow duration-200 cursor-pointer bg-[length:16px_16px] bg-[position:right_0.5rem_center] bg-no-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            }}
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
      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
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
              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm hover:shadow-google focus:outline-none focus:shadow-google-lg transition-shadow duration-200 cursor-pointer bg-[length:16px_16px] bg-[position:right_0.5rem_center] bg-no-repeat"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              }}
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
              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm hover:shadow-google focus:outline-none focus:shadow-google-lg transition-shadow duration-200 cursor-pointer bg-[length:16px_16px] bg-[position:right_0.5rem_center] bg-no-repeat"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              }}
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
              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm hover:shadow-google focus:outline-none focus:shadow-google-lg transition-shadow duration-200 cursor-pointer min-w-[140px] bg-[length:16px_16px] bg-[position:right_0.5rem_center] bg-no-repeat"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              }}
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
            className="text-sm text-google-blue hover:text-primary-700 font-medium whitespace-nowrap transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results - Google Maps Style Cards */}
      {filteredResults.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No results found</p>
        </div>
      ) : (
        <>
          {/* Results List - Clean Design */}
          <div className="space-y-3">
            {paginatedResults.map((place, index) => (
              <div
                key={startIndex + index}
                className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-150 p-5 cursor-pointer"
                onClick={() => {
                  setSelectedPlace(place);
                  setShowDetailModal(true);
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left Content */}
                  <div className="flex-1 min-w-0">
                    {/* Business Name */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-google-blue">
                      {place.name || "Business Name"}
                    </h3>

                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-2 text-sm mb-2">
                      {place.rating > 0 && (
                        <>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-gray-900">
                              {place.rating.toFixed(1)}
                            </span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.floor(place.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                          </div>
                          {place.reviewsCount > 0 && (
                            <span className="text-gray-600">
                              ({place.reviewsCount.toLocaleString()})
                            </span>
                          )}
                          <span className="text-gray-400">·</span>
                        </>
                      )}
                      <span className="text-gray-600">{place.category}</span>
                      {place.price && (
                        <>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-600 font-medium">{place.price}</span>
                        </>
                      )}
                    </div>

                    {/* Description */}
                    {place.description && (
                      <div className="mb-2">{formatDescription(place.description)}</div>
                    )}

                    {/* Address */}
                    {place.address && (
                      <div className="flex items-start gap-2 text-sm text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{cleanData(place.address)}</span>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex flex-wrap items-center gap-2 text-sm mt-3">
                      {place.phone && (
                        <a
                          href={`tel:${place.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">Call</span>
                        </a>
                      )}
                      <a
                        href={getGoogleMapsUrl(place)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-white bg-google-blue hover:bg-blue-700 rounded-full transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Get Directions</span>
                      </a>
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-google-blue rounded-full transition-colors">
                        <span className="text-xs font-medium">View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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

      {/* Detail Modal */}
      {showDetailModal && selectedPlace && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{selectedPlace.name}</h2>
                  {/* Action Buttons at Top */}
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={getGoogleMapsUrl(selectedPlace)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 text-white bg-google-blue hover:bg-blue-700 rounded-full transition-colors font-medium text-sm"
                    >
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </a>
                    {selectedPlace.phone && (
                      <a
                        href={`tel:${selectedPlace.phone}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-full transition-colors font-medium text-sm"
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </a>
                    )}
                    {selectedPlace.website && (
                      <a
                        href={selectedPlace.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-full transition-colors font-medium text-sm"
                      >
                        <Globe className="w-4 h-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl leading-none flex-shrink-0"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Rating & Category */}
              <div className="flex items-center gap-3 mb-4">
                {selectedPlace.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold">{selectedPlace.rating.toFixed(1)}</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${i < Math.floor(selectedPlace.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    {selectedPlace.reviewsCount > 0 && (
                      <span className="text-gray-600 text-lg">
                        ({selectedPlace.reviewsCount.toLocaleString()} reviews)
                      </span>
                    )}
                  </div>
                )}
                {selectedPlace.price && (
                  <>
                    <span className="text-gray-400">·</span>
                    <span className="text-lg font-medium text-gray-700">{selectedPlace.price}</span>
                  </>
                )}
              </div>

              <div className="text-gray-600 mb-6">{selectedPlace.category}</div>

              {/* Description */}
              {selectedPlace.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                  {formatDescription(selectedPlace.description)}
                </div>
              )}

              {/* Contact Information */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {selectedPlace.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{cleanData(selectedPlace.address)}</span>
                    </div>
                  )}
                  {selectedPlace.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <a
                        href={`tel:${selectedPlace.phone}`}
                        className="text-google-blue hover:underline"
                      >
                        {cleanData(selectedPlace.phone)}
                      </a>
                    </div>
                  )}
                  {selectedPlace.email && (
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📧</span>
                      <a
                        href={`mailto:${selectedPlace.email}`}
                        className="text-google-blue hover:underline"
                      >
                        {cleanData(selectedPlace.email)}
                      </a>
                    </div>
                  )}
                  {selectedPlace.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <a
                        href={selectedPlace.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-google-blue hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Opening Hours */}
              {selectedPlace.openingHours && selectedPlace.openingHours.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Hours</h3>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedPlace.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {selectedPlace.isOpen ? "● Open" : "● Closed"}
                  </div>
                  <div className="mt-3 space-y-1">
                    {selectedPlace.openingHours.map((hours, idx) => (
                      <div key={idx} className="text-gray-700">
                        {hours}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {selectedPlace.reviews && selectedPlace.reviews.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      Reviews ({selectedPlace.reviews.length})
                    </h3>
                    {selectedPlace.reviewUrl && (
                      <a
                        href={selectedPlace.reviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-google-blue hover:underline font-medium"
                      >
                        See all reviews
                      </a>
                    )}
                  </div>
                  <div className="space-y-4">
                    {/* Remove duplicates based on author and text */}
                    {Array.from(
                      new Map(
                        selectedPlace.reviews.map((review) => [
                          `${review.author}-${review.text}`,
                          review,
                        ])
                      ).values()
                    )
                      .slice(0, 5)
                      .map((review, idx) => (
                        <div key={idx} className="border-b pb-4 last:border-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-gray-900">
                              {review.author.replace("Photo of ", "")}
                            </span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <p className="text-gray-700">{review.text}</p>
                        </div>
                      ))}
                  </div>
                  {selectedPlace.reviewUrl && selectedPlace.reviews.length > 5 && (
                    <div className="mt-4">
                      <a
                        href={selectedPlace.reviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-full transition-colors font-medium text-sm text-gray-700"
                      >
                        More reviews
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Additional Actions */}
              {selectedPlace.reviewUrl && (
                <div className="pt-6 border-t">
                  <a
                    href={selectedPlace.reviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-full transition-colors font-medium text-sm"
                  >
                    <Star className="w-4 h-4" />
                    Write a review
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
