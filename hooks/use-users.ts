"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export interface User {
  id: string;
  username: string;
  role: string;
  status: string;
  createdAt: string;
  wallet?: {
    id: string;
    balance: number;
  };
  stats?: {
    totalBets: number;
    totalBetAmount: number;
    totalTransactions: number;
    totalDeposits: number;
    totalWithdraws: number;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}

interface CreateUserDto {
  username: string;
  password: string;
  role?: string;
  status?: string;
}

interface UpdateUserDto {
  username?: string;
  password?: string;
  role?: string;
  status?: string;
}

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
  lotteryRound?: {
    id: string;
    roundNumber: string;
    lotteryType?: {
      id: string;
      name: string;
    };
  };
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string | null;
  walletId: string;
  createdAt: string;
  updatedAt: string;
}

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: Error | null;
  pagination: PaginationMeta;
  refetch: () => Promise<void>;
  createUser: (data: CreateUserDto) => Promise<User>;
  updateUser: (userId: string, data: UpdateUserDto) => Promise<User>;
  getUser: (userId: string) => Promise<User>;
  deactivateUser: (userId: string) => Promise<void>;
  activateUser: (userId: string) => Promise<void>;
  getUserBets: (userId: string) => Promise<Bet[]>;
  getUserTransactions: (userId: string) => Promise<Transaction[]>;
  updateWalletBalance: (userId: string, balance: number, description?: string) => Promise<void>;
  setPage: (page: number) => void;
}

export function useUsers(params: UseUsersParams = {}): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: params.page || 1,
    limit: params.limit || 10,
    total: 0,
    totalPages: 0,
  });

  // Sync pagination state with params when they change
  useEffect(() => {
    if (params.page && params.page !== pagination.page) {
      setPagination((prev) => ({ ...prev, page: params.page! }));
    }
    if (params.limit && params.limit !== pagination.limit) {
      setPagination((prev) => ({ ...prev, limit: params.limit! }));
    }
  }, [params.page, params.limit]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      // Add filters if provided
      if (params.role && params.role !== "all") {
        queryParams.role = params.role;
      }
      if (params.status && params.status !== "all") {
        queryParams.status = params.status;
      }
      if (params.search) {
        queryParams.search = params.search;
      }

      const response = await api.get("/admin/users", {
        params: queryParams,
      });

      // Handle nested response structure: { data: { data: [...], meta: {...} } }
      let usersData: User[] = [];
      let paginationMeta: PaginationMeta | null = null;

      // Check for nested structure: response.data.data.data and response.data.data.meta
      if (response.data?.data?.data && response.data?.data?.meta) {
        usersData = Array.isArray(response.data.data.data) ? response.data.data.data : [];
        paginationMeta = response.data.data.meta;
      }
      // Check for direct structure: response.data.data and response.data.meta
      else if (response.data?.data && response.data?.meta) {
        usersData = Array.isArray(response.data.data) ? response.data.data : [];
        paginationMeta = response.data.meta;
      }
      // Check if response.data is directly an array
      else if (Array.isArray(response.data)) {
        usersData = response.data;
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
          usersData = data;
          paginationMeta = {
            page: 1,
            limit: data.length,
            total: data.length,
            totalPages: 1,
          };
        }
      }

      setUsers(usersData);
      if (paginationMeta) {
        setPagination(paginationMeta);
      } else {
        setPagination({
          page: 1,
          limit: 10,
          total: usersData.length,
          totalPages: 1,
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch users");
      setError(error);
      console.error("Failed to fetch users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data: CreateUserDto): Promise<User> => {
    try {
      const response = await api.post("/admin/users", data);
      await fetchUsers();
      return response.data.data || response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create user");
      setError(error);
      throw error;
    }
  };

  const updateUser = async (userId: string, data: UpdateUserDto): Promise<User> => {
    try {
      const response = await api.put(`/admin/users/${userId}`, data);
      await fetchUsers();
      return response.data.data || response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to update user");
      setError(error);
      throw error;
    }
  };

  const getUser = async (userId: string): Promise<User> => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data.data || response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to get user");
      setError(error);
      throw error;
    }
  };

  const deactivateUser = async (userId: string) => {
    try {
      await api.put(`/admin/users/${userId}/deactivate`);
      await fetchUsers();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to deactivate user");
      setError(error);
      throw error;
    }
  };

  const activateUser = async (userId: string) => {
    try {
      await api.put(`/admin/users/${userId}/activate`);
      await fetchUsers();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to activate user");
      setError(error);
      throw error;
    }
  };

  const getUserBets = async (userId: string): Promise<Bet[]> => {
    try {
      const response = await api.get(`/admin/users/${userId}/bets`);
      return response.data.data || response.data || [];
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to get user bets");
      setError(error);
      throw error;
    }
  };

  const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
    try {
      const response = await api.get(`/admin/users/${userId}/transactions`);
      return response.data.data || response.data || [];
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to get user transactions");
      setError(error);
      throw error;
    }
  };

  const updateWalletBalance = async (userId: string, balance: number, description?: string): Promise<void> => {
    try {
      await api.put(`/admin/users/${userId}/wallet/balance`, {
        balance,
        description,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to update wallet balance");
      setError(error);
      throw error;
    }
  };

  const setPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, params.role, params.status, params.search]);

  return {
    users,
    loading,
    error,
    pagination,
    refetch: fetchUsers,
    createUser,
    updateUser,
    getUser,
    deactivateUser,
    activateUser,
    getUserBets,
    getUserTransactions,
    updateWalletBalance,
    setPage,
  };
}
