"use client";

import { useState, useEffect } from "react";
import { extractionAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { Search, Settings, X, Loader, MapPin } from "lucide-react";
import { useExtraction } from "@/contexts/ExtractionContext";

interface ExtractionFormProps {
  onExtractionComplete: () => void;
}

export default function ExtractionForm({ onExtractionComplete }: ExtractionFormProps) {
  const [keyword, setKeyword] = useState("");
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [skipWithoutPhone, setSkipWithoutPhone] = useState(true);
  const [skipWithoutWebsite, setSkipWithoutWebsite] = useState(false);
  const [skipAlreadyExtracted, setSkipAlreadyExtracted] = useState(false);
  const [maxResults, setMaxResults] = useState(50);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentExtractionId, setCurrentExtractionId] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const { activeExtractions, startMonitoring, stopMonitoring } = useExtraction();

  // Monitor active extraction progress
  useEffect(() => {
    if (currentExtractionId && activeExtractions.has(currentExtractionId)) {
      const progress = activeExtractions.get(currentExtractionId);
      if (progress) {
        setProgressMessage(progress.message || "Processing...");
        setProgressPercentage(progress.percentage || 0);

        // Check if extraction completed
        if (progress.status === "completed") {
          setLoading(false);
          setKeyword("");
          setCurrentExtractionId(null);
          setProgressMessage("");
          setProgressPercentage(0);
          onExtractionComplete();
        } else if (progress.status === "failed") {
          setLoading(false);
          setCurrentExtractionId(null);
          setProgressMessage("");
          setProgressPercentage(0);
        }
      }
    }
  }, [activeExtractions, currentExtractionId, onExtractionComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!keyword.trim()) {
      toast.error("Please enter a search keyword");
      return;
    }

    setLoading(true);
    setProgressMessage("Starting extraction...");
    setProgressPercentage(0);

    try {
      const response = await extractionAPI.startExtraction({
        keyword: keyword.trim(),
        skipDuplicates,
        skipWithoutPhone,
        skipWithoutWebsite,
        skipAlreadyExtracted,
        maxResults,
      });

      toast.success("Extraction started! You can navigate away - we'll notify you when it's done.");
      setCurrentExtractionId(response.data.id);

      // Start monitoring via WebSocket
      startMonitoring(response.data.id);
    } catch (err: unknown) {
      let message = "Failed to start extraction";
      interface AxiosError {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosError = err as AxiosError;
        if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message;
        }
      }
      toast.error(message);
      setLoading(false);
      setProgressMessage("");
      setProgressPercentage(0);
    }
  };

  const handleCancel = async () => {
    if (!currentExtractionId) return;

    try {
      await extractionAPI.cancelExtraction(currentExtractionId);
      stopMonitoring(currentExtractionId);
      toast.success("Extraction cancelled");
      setLoading(false);
      setCurrentExtractionId(null);
      setProgressMessage("");
      setProgressPercentage(0);
    } catch {
      toast.error("Failed to cancel extraction");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Google Maps Logo and Title */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <MapPin className="w-10 h-10 text-google-blue" />
          <h1 className="text-4xl font-normal text-gray-800">
            <span className="text-google-blue">G</span>
            <span className="text-google-red">o</span>
            <span className="text-google-yellow">o</span>
            <span className="text-google-blue">g</span>
            <span className="text-google-green">l</span>
            <span className="text-google-red">e</span>
            <span className="text-gray-600 ml-2">Maps Extractor</span>
          </h1>
        </div>
        <p className="text-gray-600 text-lg">Extract business data from Google Maps</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Google-style Search Box */}
        <div className="relative max-w-3xl mx-auto">
          <div className="relative flex items-center bg-white rounded-full shadow-google hover:shadow-google-hover transition-shadow duration-200">
            <Search className="absolute left-6 w-5 h-5 text-gray-400" />
            <input
              id="keyword"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search Google Maps (e.g., restaurants in pune)"
              className="w-full pl-14 pr-6 py-5 rounded-full focus:outline-none text-base text-gray-700"
              disabled={loading}
            />
            {keyword && !loading && (
              <button
                type="button"
                onClick={() => setKeyword("")}
                className="absolute right-6 text-gray-400 hover:text-gray-600"
                title="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Google-style Action Buttons */}
        <div className="flex justify-center space-x-4 max-w-3xl mx-auto">
          <button type="submit" disabled={loading || !keyword.trim()} className="btn-primary">
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Extracting Data...
              </span>
            ) : (
              <span className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Start Extraction
              </span>
            )}
          </button>

          {loading && (
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary flex items-center space-x-2"
            >
              <X className="w-5 h-5" />
              <span>Cancel</span>
            </button>
          )}
        </div>

        {/* Advanced Options - Collapsible */}
        <div className="max-w-3xl mx-auto">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-sm font-medium text-google-blue hover:text-primary-700 mx-auto transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>{showAdvanced ? "Hide" : "Show"} Advanced Options</span>
          </button>

          {showAdvanced && (
            <div className="mt-6 bg-white rounded-2xl shadow-google p-6 space-y-5">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Extraction Settings</h3>

              <div className="flex items-start space-x-3">
                <input
                  id="skipDuplicates"
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="mt-1 w-5 h-5 text-google-blue rounded focus:ring-google-blue"
                  disabled={loading}
                />
                <div>
                  <label
                    htmlFor="skipDuplicates"
                    className="text-sm font-medium text-gray-700 block"
                  >
                    Skip duplicate entries
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Avoid extracting the same business multiple times
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  id="skipWithoutPhone"
                  type="checkbox"
                  checked={skipWithoutPhone}
                  onChange={(e) => setSkipWithoutPhone(e.target.checked)}
                  className="mt-1 w-5 h-5 text-google-blue rounded focus:ring-google-blue"
                  disabled={loading}
                />
                <div>
                  <label
                    htmlFor="skipWithoutPhone"
                    className="text-sm font-medium text-gray-700 block"
                  >
                    Skip entries without phone numbers
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Only extract businesses with phone numbers
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  id="skipWithoutWebsite"
                  type="checkbox"
                  checked={skipWithoutWebsite}
                  onChange={(e) => setSkipWithoutWebsite(e.target.checked)}
                  className="mt-1 w-5 h-5 text-google-blue rounded focus:ring-google-blue"
                  disabled={loading}
                />
                <div>
                  <label
                    htmlFor="skipWithoutWebsite"
                    className="text-sm font-medium text-gray-700 block"
                  >
                    Skip entries without website
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Only extract businesses with websites
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  id="skipAlreadyExtracted"
                  type="checkbox"
                  checked={skipAlreadyExtracted}
                  onChange={(e) => setSkipAlreadyExtracted(e.target.checked)}
                  className="mt-1 w-5 h-5 text-google-blue rounded focus:ring-google-blue"
                  disabled={loading}
                />
                <div>
                  <label
                    htmlFor="skipAlreadyExtracted"
                    className="text-sm font-medium text-gray-700 block"
                  >
                    Skip already extracted places
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Skip places that you already extracted with this keyword before
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <label
                  htmlFor="maxResults"
                  className="block text-sm font-medium text-gray-700 mb-3"
                >
                  Maximum Results:{" "}
                  <span className="text-google-blue font-semibold">{maxResults}</span>
                </label>
                <input
                  id="maxResults"
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-google-blue"
                  disabled={loading}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>10</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Real-time Progress */}
      {loading && progressMessage && (
        <div className="mt-8 max-w-3xl mx-auto bg-white rounded-2xl shadow-google p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Loader className="w-5 h-5 text-google-blue animate-spin" />
            <h3 className="font-medium text-gray-800">Extraction Progress</h3>
          </div>

          {/* Progress Bar */}
          {progressPercentage > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-google-blue h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Status Message */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">{progressMessage}</p>
          </div>

          {/* Info about navigation */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            You can navigate to other pages - extraction will continue in the background
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="mt-8 max-w-3xl mx-auto bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-google-blue" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Extraction Information</p>
            <p className="text-blue-800">
              Extraction typically takes 30-60 seconds depending on the number of results. You can
              monitor real-time progress and cancel anytime if needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
