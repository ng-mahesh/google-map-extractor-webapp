import React from "react";
import { Activity } from "lucide-react";

interface QuotaDisplayProps {
  quota: {
    dailyQuota: number;
    usedToday: number;
    remaining: number;
    resetDate: string;
  };
}

export default function QuotaDisplay({ quota }: QuotaDisplayProps) {
  const percentage = (quota.usedToday / quota.dailyQuota) * 100;
  const isLowQuota = quota.remaining < quota.dailyQuota * 0.2;

  return (
    <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2.5 rounded-full border border-gray-200">
      <Activity className={`w-4 h-4 ${isLowQuota ? "text-google-red" : "text-google-blue"}`} />
      <div>
        <div className="text-xs font-medium text-gray-700">
          <span className={isLowQuota ? "text-google-red" : "text-gray-900"}>
            {quota.remaining}
          </span>
          <span className="text-gray-500"> / {quota.dailyQuota} today</span>
        </div>
        <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
          <div
            className={`h-1.5 rounded-full transition-all ${
              isLowQuota ? "bg-google-red" : "bg-google-blue"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
