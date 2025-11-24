"use client";

import { useEffect, useState } from "react";
import { extractionAPI, Extraction } from "@/lib/api";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Clock, CheckCircle, XCircle, Loader, Eye } from "lucide-react";

interface ExtractionHistoryProps {
  onViewResults: (extraction: Extraction) => void;
}

export default function ExtractionHistory({ onViewResults }: ExtractionHistoryProps) {
  const [extractions, setExtractions] = useState<Extraction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await extractionAPI.getHistory(20);
      setExtractions(response.data);
    } catch {
      toast.error("Failed to load extraction history");
    } finally {
      setLoading(false);
    }
  };

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
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "processing":
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case "completed":
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Completed</span>;
      case "failed":
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Failed</span>;
      case "processing":
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Processing</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Loading history...</p>
      </div>
    );
  }

  if (extractions.length === 0) {
    return (
      <div className="card text-center py-12">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No extraction history yet</p>
        <p className="text-sm text-gray-500 mt-2">Start a new extraction to see results here</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-semibold mb-6">Extraction History</h2>

      <div className="space-y-4">
        {extractions.map((extraction) => (
          <div
            key={extraction._id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(extraction.status)}
                  <h3 className="font-semibold text-lg">{extraction.keyword}</h3>
                  {getStatusBadge(extraction.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  <div>
                    <span className="text-gray-600">Created:</span>{" "}
                    <span className="font-medium">
                      {format(new Date(extraction.createdAt), "MMM dd, yyyy HH:mm")}
                    </span>
                  </div>

                  {extraction.status === "completed" && (
                    <>
                      <div>
                        <span className="text-gray-600">Results:</span>{" "}
                        <span className="font-medium text-green-600">
                          {extraction.totalResults}
                        </span>
                      </div>
                      {extraction.duplicatesSkipped > 0 && (
                        <div>
                          <span className="text-gray-600">Duplicates skipped:</span>{" "}
                          <span className="font-medium">{extraction.duplicatesSkipped}</span>
                        </div>
                      )}
                      {extraction.withoutPhoneSkipped > 0 && (
                        <div>
                          <span className="text-gray-600">Without phone skipped:</span>{" "}
                          <span className="font-medium">{extraction.withoutPhoneSkipped}</span>
                        </div>
                      )}
                    </>
                  )}

                  {extraction.status === "failed" && extraction.errorMessage && (
                    <div className="col-span-2">
                      <span className="text-red-600">Error:</span>{" "}
                      <span className="text-sm">{extraction.errorMessage}</span>
                    </div>
                  )}
                </div>
              </div>

              {extraction.status === "completed" && (
                <button
                  onClick={() => handleViewResults(extraction._id)}
                  className="ml-4 flex items-center space-x-2 btn-primary"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Results</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
