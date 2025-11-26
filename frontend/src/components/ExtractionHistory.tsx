"use client";

import { useEffect, useState } from "react";
import { extractionAPI, Extraction } from "@/lib/api";
import toast from "react-hot-toast";
import { format } from "date-fns";
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Eye,
  Download,
  Calendar,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { useExtraction } from "@/contexts/ExtractionContext";

interface ExtractionHistoryProps {
  onViewResults: (extraction: Extraction) => void;
}

export default function ExtractionHistory({ onViewResults }: ExtractionHistoryProps) {
  const [extractions, setExtractions] = useState<Extraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { activeExtractions, setOnExtractionComplete } = useExtraction();

  const loadHistory = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }

    try {
      const response = await extractionAPI.getHistory(20);
      setExtractions(response.data);
      if (isRefresh) {
        toast.success("History refreshed");
      }
    } catch (error: unknown) {
      // Check if it's a 401 (handled by interceptor) or 429 error
      const isAuthError =
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status === 401;
      const isRateLimitError =
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status === 429;

      // Only show error toast if it's not an auth error (interceptor handles that)
      // and not a rate limit error (already handled)
      if (!isAuthError && !isRateLimitError) {
        toast.error("Failed to load extraction history");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();

    // Set up callback to refresh history when extractions complete
    if (setOnExtractionComplete) {
      setOnExtractionComplete(() => {
        loadHistory();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewResults = async (extractionId: string) => {
    try {
      const response = await extractionAPI.getExtraction(extractionId);
      onViewResults(response.data);
    } catch {
      toast.error("Failed to load extraction details");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-google-green" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-google-red" />;
      case "processing":
        return <Loader className="w-5 h-5 text-google-blue animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1.5 rounded-full text-xs font-medium";
    switch (status) {
      case "completed":
        return (
          <span className={`${baseClasses} bg-green-50 text-google-green border border-green-200`}>
            Completed
          </span>
        );
      case "failed":
        return (
          <span className={`${baseClasses} bg-red-50 text-google-red border border-red-200`}>
            Failed
          </span>
        );
      case "processing":
        return (
          <span className={`${baseClasses} bg-blue-50 text-google-blue border border-blue-200`}>
            Processing
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-50 text-gray-700 border border-gray-200`}>
            Pending
          </span>
        );
    }
  };

  const handleExportCSV = async (extractionId: string) => {
    try {
      const response = await extractionAPI.exportToCSV(extractionId);
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `extraction-${extractionId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("CSV exported successfully");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  // Helper function to clean data by removing prefixes
  const cleanData = (value: string | number): string => {
    if (typeof value !== "string") return String(value);

    // Remove common prefixes like "Address:", "Phone:", etc.
    const cleaned = value
      .replace(/^Address:\s*/i, "")
      .replace(/^Phone:\s*/i, "")
      .replace(/^Email:\s*/i, "")
      .replace(/^Website:\s*/i, "")
      .trim();

    return cleaned;
  };

  const handleExportExcel = async (extraction: Extraction) => {
    try {
      const XLSX = await import("xlsx");

      // Prepare data for Excel - clean all string values
      const excelData = extraction.results.map((place, index) => ({
        "#": index + 1,
        "Business Name": cleanData(place.name || ""),
        Category: cleanData(place.category || ""),
        Address: cleanData(place.address || ""),
        Phone: cleanData(place.phone || ""),
        Website: cleanData(place.website || ""),
        Rating: place.rating || "",
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
        { wch: 35 }, // Website
        { wch: 8 }, // Rating
      ];

      // Generate Excel file
      XLSX.writeFile(workbook, `extraction-${extraction._id}-${Date.now()}.xlsx`);

      toast.success("Excel exported successfully");
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("Failed to export Excel");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-google p-12 text-center">
          <Loader className="w-10 h-10 text-google-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  if (extractions.length === 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-google p-12 text-center">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">No extraction history yet</h3>
          <p className="text-sm text-gray-500">Start a new extraction to see results here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header with Stats */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-normal text-gray-800 mb-2">Extraction History</h2>
          <p className="text-sm text-gray-600">View and manage your recent data extractions</p>
        </div>
        <button
          onClick={() => loadHistory(true)}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
          title="Refresh history"
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? "animate-spin" : ""}`} />
          <span className="text-sm font-medium text-gray-700">Refresh</span>
        </button>
      </div>

      {/* Extraction Cards Grid */}
      <div className="space-y-4">
        {extractions.map((extraction) => {
          const progress = activeExtractions.get(extraction._id);

          return (
            <div
              key={extraction._id}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-google-hover transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-6">
                {/* Left Content */}
                <div className="flex-1 min-w-0">
                  {/* Header Row */}
                  <div className="flex items-center gap-3 mb-4">
                    {getStatusIcon(extraction.status)}
                    <h3 className="font-medium text-lg text-gray-800 truncate flex-1">
                      {extraction.keyword}
                    </h3>
                    {getStatusBadge(extraction.status)}
                  </div>

                  {/* Real-time Progress for Processing Extractions */}
                  {extraction.status === "processing" && progress && (
                    <div className="mb-4">
                      {progress.percentage !== undefined && progress.percentage > 0 && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{progress.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-google-blue h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {progress.message && (
                        <p className="text-xs text-gray-600 italic">{progress.message}</p>
                      )}
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Date */}
                    <div className="flex items-start space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="text-sm font-medium text-gray-700">
                          {format(new Date(extraction.createdAt), "MMM dd, yyyy")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(extraction.createdAt), "HH:mm")}
                        </p>
                      </div>
                    </div>

                    {/* Results Count */}
                    {extraction.status === "completed" && (
                      <div className="flex items-start space-x-2">
                        <TrendingUp className="w-4 h-4 text-google-green mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Total Results</p>
                          <p className="text-lg font-semibold text-google-green">
                            {extraction.totalResults}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Skipped Stats */}
                    {extraction.status === "completed" &&
                      (extraction.duplicatesSkipped > 0 || extraction.withoutPhoneSkipped > 0) && (
                        <div className="flex items-start space-x-2">
                          <XCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">Skipped</p>
                            {extraction.duplicatesSkipped > 0 && (
                              <p className="text-xs text-gray-600">
                                {extraction.duplicatesSkipped} duplicates
                              </p>
                            )}
                            {extraction.withoutPhoneSkipped > 0 && (
                              <p className="text-xs text-gray-600">
                                {extraction.withoutPhoneSkipped} without phone
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Error Message */}
                  {extraction.status === "failed" && extraction.errorMessage && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-600 font-medium">Error:</p>
                      <p className="text-sm text-red-700 mt-1">{extraction.errorMessage}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {extraction.status === "completed" && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleViewResults(extraction._id)}
                      className="flex items-center space-x-2 bg-google-blue hover:bg-primary-700 text-white font-medium py-2.5 px-5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleExportCSV(extraction._id)}
                        className="flex items-center space-x-1.5 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-full transition-all duration-200 border border-gray-300 shadow-sm hover:shadow-md whitespace-nowrap text-xs"
                        title="Export as CSV"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>CSV</span>
                      </button>
                      <button
                        onClick={async () => {
                          const response = await extractionAPI.getExtraction(extraction._id);
                          handleExportExcel(response.data);
                        }}
                        className="flex items-center space-x-1.5 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-full transition-all duration-200 border border-gray-300 shadow-sm hover:shadow-md whitespace-nowrap text-xs"
                        title="Export as Excel"
                      >
                        <Download className="w-3.5 h-3.5 text-green-600" />
                        <span>Excel</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
