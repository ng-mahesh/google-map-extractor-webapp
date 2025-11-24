import React from 'react';
import { Activity } from 'lucide-react';

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

  return (
    <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg">
      <Activity className="w-5 h-5 text-primary-600" />
      <div>
        <div className="text-sm font-medium text-gray-900">
          {quota.remaining} / {quota.dailyQuota} remaining
        </div>
        <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
