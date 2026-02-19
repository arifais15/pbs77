import { useState, useEffect, useCallback } from 'react';
import { normalizeToEnglish, toBanglaNumeral } from '@/lib/numeral-converter';

export interface UseQueryResult<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface QueryConfig {
  createdBy?: string;
  date?: string;
  limit?: number;
  [key: string]: any;
}

export function useActivities<T = any>(config?: QueryConfig): UseQueryResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (config?.createdBy) params.append('createdBy', config.createdBy);
      if (config?.date) params.append('date', config.date);
      if (config?.limit) params.append('limit', config.limit.toString());

      const res = await fetch(`/api/activities?${params}`);
      if (!res.ok) throw new Error('Failed to fetch activities');
      
      const activities = await res.json();
      setData(activities);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [config?.createdBy, config?.date, config?.limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { data, isLoading, error, refetch: fetchActivities };
}

export function useUsers<T = any>(): UseQueryResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      
      const users = await res.json();
      setData(users);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { data, isLoading, error, refetch: fetchUsers };
}

export function useConsumer(accNo: string | null) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchConsumer = useCallback(async () => {
    if (!accNo) {
      setData(null);
      return;
    }

    try {
      setIsLoading(true);
      // Normalize the input (convert any numeral format to English for API lookup)
      const normalizedAccNo = normalizeToEnglish(accNo);
      const res = await fetch(`/api/consumers/${normalizedAccNo}`);
      
      if (res.status === 404) {
        setData(null);
        setError(new Error('Consumer not found'));
      } else if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch consumer: ${errorText}`);
      } else {
        const consumer = await res.json();
        // Convert accNo to Bangla numerals for display
        if (consumer.accNo) {
          consumer.accNo = toBanglaNumeral(consumer.accNo);
        }
        setData(consumer);
        setError(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [accNo]);

  useEffect(() => {
    fetchConsumer();
  }, [fetchConsumer]);

  return { data, isLoading, error, refetch: fetchConsumer };
}

export function useCreateActivity(activityData: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createActivity = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData),
      });

      if (!res.ok) throw new Error('Failed to create activity');
      const result = await res.json();
      setError(null);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [activityData]);

  return { createActivity, isLoading, error };
}

export function useUpdateUser(userId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateUser = useCallback(async (updates: any) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error('Failed to update user');
      const result = await res.json();
      setError(null);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return { updateUser, isLoading, error };
}

export function useDeleteActivity(activityId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteActivity = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/activities/${activityId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete activity');
      setError(null);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [activityId]);

  return { deleteActivity, isLoading, error };
}

export function useDeleteUser(userId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete user');
      setError(null);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return { deleteUser, isLoading, error };
}

export function useUpdateConsumer(accNo: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateConsumer = useCallback(async (updates: any) => {
    try {
      setIsLoading(true);
      const normalizedAccNo = normalizeToEnglish(accNo);
      const res = await fetch(`/api/consumers/${normalizedAccNo}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error('Failed to update consumer');
      const result = await res.json();
      if (result.accNo) {
        result.accNo = toBanglaNumeral(result.accNo);
      }
      setError(null);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [accNo]);

  return { updateConsumer, isLoading, error };
}

export function useDeleteConsumer(accNo: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteConsumer = useCallback(async () => {
    try {
      setIsLoading(true);
      const normalizedAccNo = normalizeToEnglish(accNo);
      const res = await fetch(`/api/consumers/${normalizedAccNo}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete consumer');
      setError(null);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [accNo]);

  return { deleteConsumer, isLoading, error };
}
