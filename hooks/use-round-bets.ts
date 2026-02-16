"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { PaginationMeta } from "./use-lottery-rounds";

export interface RoundBet {
  id: string;
  userId: string;
  lotteryRoundId: string;
  betType: string;
  numbers: string[];
  amount: number;
  status: string;
  payout: number | null;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  lotteryRound: {
    id: string;
    roundNumber: string;
    lotteryType: {
      id: string;
      name: string;
      code: string;
    };
  };
}

interface UseRoundBetsParams {
  roundId: string;
  page?: number;
  limit?: number;
}

interface UseRoundBetsReturn {
  bets: RoundBet[];
  loading: boolean;
  error: Error | null;
  pagination: PaginationMeta;
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
}

export function useRoundBets(params: UseRoundBetsParams): UseRoundBetsReturn {
  const [bets, setBets] = useState<RoundBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: params.page || 1,
    limit: params.limit || 10,
    total: 0,
    totalPages: 0,
  });

  const fetchBets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/lottery/admin/rounds/${params.roundId}/bets`, {
        params: {
          page: pagination.page,
          limit: pagination.limit,
        },
      });

      let allBets: RoundBet[] = [];
      let meta: PaginationMeta | null = null;

      // Handle nested response structure
      if (response.data?.data?.data && response.data?.data?.meta) {
        allBets = Array.isArray(response.data.data.data) ? response.data.data.data : [];
        meta = response.data.data.meta;
      } else if (response.data?.data && response.data?.meta) {
        allBets = Array.isArray(response.data.data) ? response.data.data : [];
        meta = response.data.meta;
      } else if (Array.isArray(response.data)) {
        allBets = response.data;
        meta = {
          page: 1,
          limit: response.data.length,
          total: response.data.length,
          totalPages: 1,
        };
      }

      setBets(allBets);
      if (meta) {
        setPagination(meta);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch round bets");
      setError(error);
      console.error("Failed to fetch bets:", err);
      setBets([]);
    } finally {
      setLoading(false);
    }
  };

  const setPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  useEffect(() => {
    if (params.roundId) {
      fetchBets();
    }
  }, [params.roundId, pagination.page]);

  return {
    bets,
    loading,
    error,
    pagination,
    refetch: fetchBets,
    setPage,
  };
}
