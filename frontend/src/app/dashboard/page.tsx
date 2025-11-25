"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUser, removeAuthToken, getRefreshToken } from "@/lib/auth";
import { extractionAPI, Extraction, authAPI } from "@/lib/api";
import toast from "react-hot-toast";
import ExtractionForm from "@/components/ExtractionForm";
import ExtractionHistory from "@/components/ExtractionHistory";
import ResultsTable from "@/components/ResultsTable";
import QuotaDisplay from "@/components/QuotaDisplay";
import { Database } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [selectedExtraction, setSelectedExtraction] = useState<Extraction | null>(null);
  const [quota, setQuota] = useState<{
    dailyQuota: number;
    usedToday: number;
    remaining: number;
    resetDate: string;
  } | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const currentUser = getUser();
    setUser(currentUser);
    loadQuota();
  }, [router]);

  const loadQuota = async () => {
    try {
      const response = await extractionAPI.getQuota();
      setQuota(response.data);
    } catch {
      toast.error("Failed to load quota information");
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch {
      // Ignore logout errors, still clear local storage
    } finally {
      removeAuthToken();
      toast.success("Logged out successfully");
      router.push("/login");
    }
  };

  const handleExtractionComplete = () => {
    setActiveTab("history");
    loadQuota();
  };

  const handleViewResults = (extraction: Extraction) => {
    setSelectedExtraction(extraction);
  };

  const handleBackToList = () => {
    setSelectedExtraction(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Google-style Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <Database className="w-7 h-7 text-google-blue" />
              <h1 className="text-xl font-normal">
                <span className="text-google-blue">G</span>
                <span className="text-google-red">o</span>
                <span className="text-google-yellow">o</span>
                <span className="text-google-blue">g</span>
                <span className="text-google-green">l</span>
                <span className="text-google-red">e</span>
                <span className="text-gray-600 ml-1">Maps Extractor</span>
              </h1>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-6">
              {quota && <QuotaDisplay quota={quota} />}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-google-blue rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {selectedExtraction ? (
          <div>
            <button
              onClick={handleBackToList}
              className="mb-6 flex items-center space-x-2 text-google-blue hover:text-primary-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Back to list</span>
            </button>
            <ResultsTable extraction={selectedExtraction} />
          </div>
        ) : (
          <>
            {/* Google-style Tabs */}
            <div className="mb-8">
              <nav className="flex space-x-8 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("new")}
                  className={`${
                    activeTab === "new"
                      ? "border-google-blue text-google-blue"
                      : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                  } py-4 px-2 border-b-2 font-medium text-sm transition-all`}
                >
                  New Extraction
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`${
                    activeTab === "history"
                      ? "border-google-blue text-google-blue"
                      : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                  } py-4 px-2 border-b-2 font-medium text-sm transition-all`}
                >
                  Extraction History
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="py-6">
              {activeTab === "new" ? (
                <ExtractionForm onExtractionComplete={handleExtractionComplete} />
              ) : (
                <ExtractionHistory onViewResults={handleViewResults} />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
