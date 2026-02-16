"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
  wallet: {
    id: string;
    userId: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseTransactionsParams {
  status?: string;
  page?: number;
  limit?: number;
}

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: Error | null;
  pagination: PaginationMeta;
  refetch: () => Promise<void>;
  approveTransaction: (transactionId: string) => Promise<void>;
  rejectTransaction: (transactionId: string) => Promise<void>;
  setPage: (page: number) => void;
}

export function useTransactions(params: UseTransactionsParams = {}): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: params.page || 1,
    limit: params.limit || 10,
    total: 0,
    totalPages: 0,
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/admin/transactions", {
        params: {
          status: params.status || "pending",
          page: pagination.page,
          limit: pagination.limit,
        },
      });

      // Handle nested response structure: { data: { data: [...], meta: {...} } }
      let transactionsData: Transaction[] = [];
      let paginationMeta: PaginationMeta | null = null;

      // Check for nested structure: response.data.data.data and response.data.data.meta
      if (response.data?.data?.data && response.data?.data?.meta) {
        transactionsData = Array.isArray(response.data.data.data) ? response.data.data.data : [];
        paginationMeta = response.data.data.meta;
      }
      // Check for direct structure: response.data.data and response.data.meta
      else if (response.data?.data && response.data?.meta) {
        transactionsData = Array.isArray(response.data.data) ? response.data.data : [];
        paginationMeta = response.data.meta;
      }
      // Check if response.data is directly an array
      else if (Array.isArray(response.data)) {
        transactionsData = response.data;
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
          transactionsData = data;
          paginationMeta = {
            page: 1,
            limit: data.length,
            total: data.length,
            totalPages: 1,
          };
        }
      }

      setTransactions(transactionsData);
      if (paginationMeta) {
        setPagination(paginationMeta);
      } else {
        setPagination({
          page: 1,
          limit: 10,
          total: transactionsData.length,
          totalPages: 1,
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch transactions");
      setError(error);
      console.error("Failed to fetch transactions:", err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const approveTransaction = async (transactionId: string) => {
    try {
      await api.put(`/admin/transactions/${transactionId}/approve`);
      await fetchTransactions();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to approve transaction");
      setError(error);
      throw error;
    }
  };

  const rejectTransaction = async (transactionId: string) => {
    try {
      await api.put(`/admin/transactions/${transactionId}/reject`);
      await fetchTransactions();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to reject transaction");
      setError(error);
      throw error;
    }
  };

  const setPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page]);

  return {
    transactions,
    loading,
    error,
    pagination,
    refetch: fetchTransactions,
    approveTransaction,
    rejectTransaction,
    setPage,
  };
}
