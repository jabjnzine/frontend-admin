"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export interface Bet {
  id: string;
  userId: string;
  lotteryRoundId: string;
  betType: string;
  numbers: string[];
  amount: number;
  status: string;
  payout: number | null;
  createdAt: string;
  user?: {
    id: string;
    username: string;
  };
  lotteryRound?: {
    id: string;
    roundNumber: string;
    lotteryType?: {
      id: string;
      name: string;
    };
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseBetsParams {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
}

interface UseBetsReturn {
  bets: Bet[];
  loading: boolean;
  error: Error | null;
  pagination: PaginationMeta;
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
}

export function useBets(params: UseBetsParams = {}): UseBetsReturn {
  const [bets, setBets] = useState<Bet[]>([]);
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
      const queryParams: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      if (params.status) {
        queryParams.status = params.status;
      }
      if (params.userId) {
        queryParams.userId = params.userId;
      }

      const response = await api.get("/admin/bets", {
        params: queryParams,
      });

      let betsData: Bet[] = [];
      let paginationMeta: PaginationMeta | null = null;

      // Handle nested response structure
      if (response.data?.data?.data && response.data?.data?.meta) {
        betsData = Array.isArray(response.data.data.data) ? response.data.data.data : [];
        paginationMeta = response.data.data.meta;
      } else if (response.data?.data && response.data?.meta) {
        betsData = Array.isArray(response.data.data) ? response.data.data : [];
        paginationMeta = response.data.meta;
      } else if (Array.isArray(response.data)) {
        betsData = response.data;
        paginationMeta = {
          page: 1,
          limit: response.data.length,
          total: response.data.length,
          totalPages: 1,
        };
      } else if (response.data?.data) {
        const data = response.data.data;
        if (Array.isArray(data)) {
          betsData = data;
          paginationMeta = {
            page: 1,
            limit: data.length,
            total: data.length,
            totalPages: 1,
          };
        }
      }

      setBets(betsData);
      if (paginationMeta) {
        setPagination(paginationMeta);
      } else {
        setPagination({
          page: 1,
          limit: 10,
          total: betsData.length,
          totalPages: 1,
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch bets");
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
    fetchBets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, params.status, params.userId]);

  return {
    bets,
    loading,
    error,
    pagination,
    refetch: fetchBets,
    setPage,
  };
}
