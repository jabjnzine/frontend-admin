"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export interface LotteryType {
  id: string;
  name: string;
  code: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UseLotteryTypesReturn {
  types: LotteryType[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useLotteryTypes(): UseLotteryTypesReturn {
  const [types, setTypes] = useState<LotteryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/lottery/types");
      // Handle nested response structure: { data: { data: [...], meta: {...} } }
      const data = response.data?.data?.data || response.data?.data || response.data;
      setTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch lottery types");
      setError(error);
      console.error("Failed to fetch lottery types:", err);
      setTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  return {
    types,
    loading,
    error,
    refetch: fetchTypes,
  };
}
