"use client";

import { useState } from "react";
import api from "@/lib/api";

export interface DashboardStats {
  totalUsers: number;
  activeRounds: number;
  pendingTransactions: number;
  totalBets: number;
}

interface UseDashboardReturn {
  stats: DashboardStats;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeRounds: 0,
    pendingTransactions: 0,
    totalBets: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reportsResponse, transactionsResponse] = await Promise.all([
        api.get("/admin/reports").catch(() => ({ data: {} })),
        api.get("/admin/transactions?status=pending&limit=1").catch(() => ({
          data: { data: { meta: { total: 0 } } },
        })),
      ]);

      // Handle nested response structure
      const reportData = reportsResponse.data?.data?.data || reportsResponse.data?.data || reportsResponse.data;
      const transactionsMeta = transactionsResponse.data?.data?.meta || transactionsResponse.data?.meta;
      const pendingCount = transactionsMeta?.total || 0;

      setStats({
        totalUsers: reportData.totalUsers || 0,
        activeRounds: reportData.activeRounds || 0,
        pendingTransactions: pendingCount,
        totalBets: reportData.totalBets || 0,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch dashboard stats");
      setError(error);
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
