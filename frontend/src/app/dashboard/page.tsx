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
import { LogOut, Database } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Google Maps Data Extractor</h1>
                <p className="text-sm text-gray-600">Welcome back, {user.name || user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {quota && <QuotaDisplay quota={quota} />}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedExtraction ? (
          <div>
            <button
              onClick={handleBackToList}
              className="mb-4 text-primary-600 hover:text-primary-700 font-semibold"
            >
              ← Back to list
            </button>
            <ResultsTable extraction={selectedExtraction} />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab("new")}
                    className={`${
                      activeTab === "new"
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                  >
                    New Extraction
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`${
                      activeTab === "history"
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                  >
                    Extraction History
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "new" ? (
              <ExtractionForm onExtractionComplete={handleExtractionComplete} />
            ) : (
              <ExtractionHistory onViewResults={handleViewResults} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
