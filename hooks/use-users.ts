"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export interface User {
  id: string;
  username: string;
  role: string;
  status: string;
  createdAt: string;
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
}

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: Error | null;
  pagination: PaginationMeta;
  refetch: () => Promise<void>;
  deactivateUser: (userId: string) => Promise<void>;
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/admin/users", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
        },
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

  const setPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page]);

  return {
    users,
    loading,
    error,
    pagination,
    refetch: fetchUsers,
    deactivateUser,
    setPage,
  };
}
