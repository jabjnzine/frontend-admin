"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export interface PayoutRates {
  two_digit?: number;
  three_digit?: number;
  running?: number;
  set?: number;
  high_low?: number;
  todd?: number;
  odd_even?: number;
  rood?: number;
}

export interface LotteryType {
  id: string;
  name: string;
  code: string;
  status: string;
  payoutRates?: PayoutRates;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseLotteryTypesPaginatedParams {
  page?: number;
  limit?: number;
}

interface CreateLotteryTypeDto {
  name: string;
  code: string;
  status?: string;
  payoutRates?: PayoutRates;
}

interface UpdateLotteryTypeDto {
  name?: string;
  code?: string;
  status?: string;
  payoutRates?: PayoutRates;
}

interface UseLotteryTypesPaginatedReturn {
  types: LotteryType[];
  loading: boolean;
  error: Error | null;
  pagination: PaginationMeta;
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
  createType: (data: CreateLotteryTypeDto) => Promise<void>;
  updateType: (id: string, data: UpdateLotteryTypeDto) => Promise<void>;
  deleteType: (id: string) => Promise<void>;
}

export function useLotteryTypesPaginated(params: UseLotteryTypesPaginatedParams = {}): UseLotteryTypesPaginatedReturn {
  const [types, setTypes] = useState<LotteryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: params.page || 1,
    limit: params.limit || 10,
    total: 0,
    totalPages: 0,
  });

  const fetchTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/lottery/admin/types", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
        },
      });

      // Handle nested response structure: 
      // Response from backend: { data: { data: [...], meta: {...} }, statusCode: 200 }
      // After axios: response.data = { data: { data: [...], meta: {...} }, statusCode: 200 }
      // So we need: response.data.data.data and response.data.data.meta
      
      let typesData: LotteryType[] = [];
      let paginationMeta: PaginationMeta | null = null;

      // Check for nested structure: response.data.data.data and response.data.data.meta
      if (response.data?.data?.data && response.data?.data?.meta) {
        typesData = Array.isArray(response.data.data.data) ? response.data.data.data : [];
        paginationMeta = response.data.data.meta;
      }
      // Check for direct structure: response.data.data and response.data.meta
      else if (response.data?.data && response.data?.meta) {
        typesData = Array.isArray(response.data.data) ? response.data.data : [];
        paginationMeta = response.data.meta;
      }
      // Check if response.data is directly an array
      else if (Array.isArray(response.data)) {
        typesData = response.data;
        paginationMeta = {
          page: 1,
          limit: response.data.length,
          total: response.data.length,
          totalPages: 1,
        };
      }
      // Fallback: try response.data.data
      else if (response.data?.data) {
        const data = response.data.data;
        if (Array.isArray(data)) {
          typesData = data;
          paginationMeta = {
            page: 1,
            limit: data.length,
            total: data.length,
            totalPages: 1,
          };
        }
      }

      setTypes(typesData);
      if (paginationMeta) {
        setPagination(paginationMeta);
      } else {
        setPagination({
          page: 1,
          limit: 10,
          total: typesData.length,
          totalPages: 1,
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch lottery types");
      setError(error);
      console.error("Failed to fetch lottery types:", err);
      setTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const setPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  useEffect(() => {
    fetchTypes();
  }, [pagination.page]);

  const createType = async (data: CreateLotteryTypeDto) => {
    await api.post("/lottery/admin/types", data);
    await fetchTypes();
  };

  const updateType = async (id: string, data: UpdateLotteryTypeDto) => {
    await api.put(`/lottery/admin/types/${id}`, data);
    await fetchTypes();
  };

  const deleteType = async (id: string) => {
    await api.delete(`/lottery/admin/types/${id}`);
    await fetchTypes();
  };

  return {
    types,
    loading,
    error,
    pagination,
    refetch: fetchTypes,
    setPage,
    createType,
    updateType,
    deleteType,
  };
}
