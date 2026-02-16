"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export interface LotteryRound {
  id: string;
  roundNumber: string;
  openTime: string;
  closeTime: string;
  status: string;
  lotteryType: {
    id: string;
    name: string;
    code: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseLotteryRoundsParams {
  page?: number;
  limit?: number;
  filterStatus?: string[];
}

interface UseLotteryRoundsReturn {
  rounds: LotteryRound[];
  loading: boolean;
  error: Error | null;
  pagination: PaginationMeta;
  refetch: () => Promise<void>;
  createRound: (data: {
    lotteryTypeId: string;
    roundNumber: string;
    openTime: string;
    closeTime: string;
  }) => Promise<void>;
  setPage: (page: number) => void;
}

export function useLotteryRounds(params: UseLotteryRoundsParams = {}): UseLotteryRoundsReturn {
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
        // Fallback to open rounds if admin endpoint doesn't support pagination
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

      // Filter by status if provided
      let filteredRounds = allRounds;
      if (params.filterStatus && params.filterStatus.length > 0) {
        filteredRounds = allRounds.filter((r) => params.filterStatus!.includes(r.status));
      }

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

  const createRound = async (data: {
    lotteryTypeId: string;
    roundNumber: string;
    openTime: string;
    closeTime: string;
  }) => {
    try {
      await api.post("/lottery/admin/rounds", data);
      await fetchRounds();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create lottery round");
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
    createRound,
    setPage,
  };
}
