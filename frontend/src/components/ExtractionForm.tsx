"use client";

import { useState } from "react";
import { extractionAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { Search, Settings, X, Loader } from "lucide-react";

interface ExtractionFormProps {
  onExtractionComplete: () => void;
}

export default function ExtractionForm({ onExtractionComplete }: ExtractionFormProps) {
  const [keyword, setKeyword] = useState("");
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [skipWithoutPhone, setSkipWithoutPhone] = useState(true);
  const [skipWithoutWebsite, setSkipWithoutWebsite] = useState(false);
  const [maxResults, setMaxResults] = useState(50);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentExtractionId, setCurrentExtractionId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!keyword.trim()) {
      toast.error("Please enter a search keyword");
      return;
    }

    setLoading(true);
    setLogs([]);

    try {
      const response = await extractionAPI.startExtraction({
        keyword: keyword.trim(),
        skipDuplicates,
        skipWithoutPhone,
        skipWithoutWebsite,
        maxResults,
      });

      toast.success("Extraction started! Processing in background...");
      setCurrentExtractionId(response.data.id);

      // Poll for completion with logs
      pollExtractionStatus(response.data.id);
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
    }
  };

  const handleCancel = async () => {
    if (!currentExtractionId) return;

    try {
      await extractionAPI.cancelExtraction(currentExtractionId);
      toast.success("Extraction cancelled");
      setLoading(false);
      setCurrentExtractionId(null);
      setLogs([]);
    } catch {
      toast.error("Failed to cancel extraction");
    }
  };

  const pollExtractionStatus = async (extractionId: string) => {
    const maxAttempts = 120; // 10 minutes max
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await extractionAPI.getExtraction(extractionId);
        const extraction = response.data;

        // Update logs if available
        if (extraction.logs && extraction.logs.length > 0) {
          setLogs(extraction.logs);
        }

        if (extraction.status === "completed") {
          toast.success(`Extraction completed! Found ${extraction.totalResults} results.`);
          setLoading(false);
          setKeyword("");
          setCurrentExtractionId(null);
          setLogs([]);
          onExtractionComplete();
        } else if (extraction.status === "failed") {
          toast.error(`Extraction failed: ${extraction.errorMessage || "Unknown error"}`);
          setLoading(false);
          setCurrentExtractionId(null);
        } else if (extraction.status === "cancelled") {
          setLoading(false);
          setCurrentExtractionId(null);
          setLogs([]);
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 5000); // Check every 5 seconds
          } else {
            toast.error("Extraction is taking longer than expected. Please check history.");
            setLoading(false);
            setCurrentExtractionId(null);
          }
        }
      } catch {
        console.error("Error checking status");
        setLoading(false);
        setCurrentExtractionId(null);
      }
    };

    checkStatus();
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Search className="w-6 h-6 text-primary-600" />
        <h2 className="text-2xl font-semibold">New Extraction</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-2">
            Search Keyword
          </label>
          <input
            id="keyword"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g., restaurants in New York, coffee shops in London"
            className="input-field"
            disabled={loading}
          />
          <p className="mt-1 text-sm text-gray-500">Enter what you would search on Google Maps</p>
        </div>

        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <Settings className="w-4 h-4" />
            <span>{showAdvanced ? "Hide" : "Show"} Advanced Options</span>
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <input
                  id="skipDuplicates"
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  disabled={loading}
                />
                <label htmlFor="skipDuplicates" className="text-sm font-medium text-gray-700">
                  Skip duplicate entries
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  id="skipWithoutPhone"
                  type="checkbox"
                  checked={skipWithoutPhone}
                  onChange={(e) => setSkipWithoutPhone(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  disabled={loading}
                />
                <label htmlFor="skipWithoutPhone" className="text-sm font-medium text-gray-700">
                  Skip entries without phone numbers
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  id="skipWithoutWebsite"
                  type="checkbox"
                  checked={skipWithoutWebsite}
                  onChange={(e) => setSkipWithoutWebsite(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  disabled={loading}
                />
                <label htmlFor="skipWithoutWebsite" className="text-sm font-medium text-gray-700">
                  Skip entries without website
                </label>
              </div>

              <div>
                <label
                  htmlFor="maxResults"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Maximum Results: {maxResults}
                </label>
                <input
                  id="maxResults"
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value))}
                  className="w-full"
                  disabled={loading}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Processing extraction...
              </span>
            ) : (
              "Start Extraction"
            )}
          </button>

          {loading && (
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </form>

      {/* Real-time Logs */}
      {loading && logs.length > 0 && (
        <div className="mt-6 p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm max-h-60 overflow-y-auto">
          <div className="font-semibold mb-2 text-green-300">Processing Logs:</div>
          {logs.map((log, index) => (
            <div key={index} className="py-1 border-b border-gray-800 last:border-0">
              {log}
            </div>
          ))}
          <div className="flex items-center space-x-2 mt-2 text-green-300">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Extraction may take 30-60 seconds or more depending on the number
          of results. You can monitor the real-time progress above and cancel anytime.
        </p>
      </div>
    </div>
  );
}
