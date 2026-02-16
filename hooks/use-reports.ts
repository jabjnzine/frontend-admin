"use client";

import { useState } from "react";
import api from "@/lib/api";

export interface ReportData {
  totalBets: number;
  totalWins: number;
  profit: number;
  totalUsers: number;
  activeRounds: number;
  totalDeposits: number;
  totalWithdraws: number;
}

interface UseReportsReturn {
  reportData: ReportData;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useReports(): UseReportsReturn {
  const [reportData, setReportData] = useState<ReportData>({
    totalBets: 0,
    totalWins: 0,
    profit: 0,
    totalUsers: 0,
    activeRounds: 0,
    totalDeposits: 0,
    totalWithdraws: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/admin/reports");
      // Handle nested response structure: { data: { data: {...} } }
      const reportData = response.data?.data?.data || response.data?.data || response.data;
      setReportData(reportData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch reports");
      setError(error);
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    reportData,
    loading,
    error,
    refetch: fetchReports,
  };
}
