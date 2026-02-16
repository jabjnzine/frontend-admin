"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { LotteryRound, PaginationMeta } from "./use-lottery-rounds";

interface UseLotteryResultsParams {
  page?: number;
  limit?: number;
}

interface UseLotteryResultsReturn {
  rounds: LotteryRound[];
  loading: boolean;
  error: Error | null;
  pagination: PaginationMeta;
  refetch: () => Promise<void>;
  submitResult: (roundId: string, result: {
    firstPrize?: string;
    lastTwoDigits?: string;
    lastThreeDigits?: string;
  }) => Promise<{
    won: number;
    lost: number;
    totalPayout: number;
  } | undefined>;
  setPage: (page: number) => void;
}

export function useLotteryResults(params: UseLotteryResultsParams = {}): UseLotteryResultsReturn {
  const [rounds, setRounds] = useState<LotteryRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: params.page || 1,
    limit: params.limit || 10,
    total: 0,
    totalPages: 0,
  });

  const fetchRounds = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/lottery/admin/rounds", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
        },
      });

      let allRounds: LotteryRound[] = [];
      let meta: PaginationMeta | null = null;

      // Handle nested response structure: { data: { data: [...], meta: {...} } }
      // Check for nested structure: response.data.data.data and response.data.data.meta
      if (response.data?.data?.data && response.data?.data?.meta) {
        allRounds = Array.isArray(response.data.data.data) ? response.data.data.data : [];
        meta = response.data.data.meta;
      }
      // Check for direct structure: response.data.data and response.data.meta
      else if (response.data?.data && response.data?.meta) {
        allRounds = Array.isArray(response.data.data) ? response.data.data : [];
        meta = response.data.meta;
      }
      // Check if response.data is directly an array
      else if (Array.isArray(response.data)) {
        allRounds = response.data;
        meta = {
          page: 1,
          limit: response.data.length,
          total: response.data.length,
          totalPages: 1,
        };
      }
      else {
        // Fallback
        const openResponse = await api.get("/lottery/rounds/open");
        const openData = openResponse.data?.data?.data || openResponse.data?.data || openResponse.data;
        allRounds = Array.isArray(openData) ? openData : [];
        meta = {
          page: 1,
          limit: 10,
          total: allRounds.length,
          totalPages: 1,
        };
      }

      // แสดงเฉพาะรอบที่ยังไม่กรอกผล (open หรือ closed)
      const filteredRounds = allRounds.filter(
        (r: LotteryRound) => r.status === "open" || r.status === "closed"
      );

      setRounds(filteredRounds);
      if (meta) {
        setPagination({
          ...meta,
          total: filteredRounds.length,
          totalPages: Math.ceil(filteredRounds.length / meta.limit),
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch lottery rounds");
      setError(error);
      console.error("Failed to fetch rounds:", err);
      setRounds([]);
    } finally {
      setLoading(false);
    }
  };

  const submitResult = async (
    roundId: string,
    result: {
      firstPrize?: string;
      lastTwoDigits?: string;
      lastThreeDigits?: string;
    }
  ) => {
    try {
      const response = await api.put(`/lottery/admin/rounds/${roundId}/result`, {
        result: {
          firstPrize: result.firstPrize || undefined,
          lastTwoDigits: result.lastTwoDigits || undefined,
          lastThreeDigits: result.lastThreeDigits || undefined,
        },
      });
      await fetchRounds();
      // ส่งคืนผลการคำนวณถ้ามี
      return response.data?.calculationResult;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to submit lottery result");
      setError(error);
      throw error;
    }
  };

  const setPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  useEffect(() => {
    fetchRounds();
  }, [pagination.page]);

  return {
    rounds,
    loading,
    error,
    pagination,
    refetch: fetchRounds,
    submitResult,
    setPage,
  };
}
