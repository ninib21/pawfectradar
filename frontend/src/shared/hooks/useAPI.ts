import { useState, useCallback } from 'react';
import { quantumAPI } from '../api/apiClient';

// 🔧 QUANTUM API HOOKS: Custom hooks for API operations with quantum security

// Generic API hook for any API operation
export const useAPI = <T = any, P = any>(
  apiFunction: (params: P) => Promise<T>
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (params: P) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiFunction(params);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  };
};

// Authentication hooks
export const useLogin = () => {
  return useAPI(quantumAPI.login);
};

export const useRegister = () => {
  return useAPI(quantumAPI.register);
};

export const useLogout = () => {
  return useAPI(quantumAPI.logout);
};

// User hooks
export const useGetCurrentUser = () => {
  return useAPI(quantumAPI.getCurrentUser);
};

export const useUpdateProfile = () => {
  return useAPI(quantumAPI.updateProfile);
};

export const useUploadAvatar = () => {
  return useAPI(quantumAPI.uploadAvatar);
};

// Pet hooks
export const useGetPets = () => {
  return useAPI(quantumAPI.getPets);
};

export const useCreatePet = () => {
  return useAPI(quantumAPI.createPet);
};

export const useUpdatePet = () => {
  return useAPI(quantumAPI.updatePet);
};

export const useDeletePet = () => {
  return useAPI(quantumAPI.deletePet);
};

// Booking hooks
export const useGetBookings = () => {
  return useAPI(quantumAPI.getBookings);
};

export const useCreateBooking = () => {
  return useAPI(quantumAPI.createBooking);
};

export const useUpdateBooking = () => {
  return useAPI(quantumAPI.updateBooking);
};

export const useCancelBooking = () => {
  return useAPI(quantumAPI.cancelBooking);
};

// Sitter search hooks
export const useSearchSitters = () => {
  return useAPI(quantumAPI.searchSitters);
};

export const useGetSitterProfile = () => {
  return useAPI(quantumAPI.getSitterProfile);
};

// Review hooks
export const useGetReviews = () => {
  return useAPI(quantumAPI.getReviews);
};

export const useCreateReview = () => {
  return useAPI(quantumAPI.createReview);
};

// Payment hooks
export const useCreatePaymentIntent = () => {
  return useAPI(quantumAPI.createPaymentIntent);
};

export const useConfirmPayment = () => {
  return useAPI(quantumAPI.confirmPayment);
};

// Notification hooks
export const useGetNotifications = () => {
  return useAPI(quantumAPI.getNotifications);
};

export const useMarkNotificationAsRead = () => {
  return useAPI(quantumAPI.markNotificationAsRead);
};

// Analytics hooks
export const useTrackEvent = () => {
  return useAPI(quantumAPI.trackEvent);
};

export const useGetAnalytics = () => {
  return useAPI(quantumAPI.getAnalytics);
};

// Session hooks
export const useGetSessions = () => {
  return useAPI(quantumAPI.getSessions);
};

export const useCreateSession = () => {
  return useAPI(quantumAPI.createSession);
};

export const useUpdateSession = () => {
  return useAPI(quantumAPI.updateSession);
};

// File upload hooks
export const useUploadFile = () => {
  return useAPI(quantumAPI.uploadFile);
};

// Custom hook for data fetching with automatic refresh
export const useDataFetch = <T = any>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
      setLastFetched(new Date());
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction]);

  const refresh = useCallback(() => {
    return fetch();
  }, [fetch]);

  return {
    data,
    isLoading,
    error,
    lastFetched,
    fetch,
    refresh,
  };
};

// Custom hook for optimistic updates
export const useOptimisticUpdate = <T = any>(
  updateFunction: (params: any) => Promise<T>
) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (params: any, optimisticData?: T) => {
    try {
      setIsUpdating(true);
      setError(null);
      
      // Return optimistic data immediately if provided
      if (optimisticData) {
        return optimisticData;
      }
      
      const result = await updateFunction(params);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [updateFunction]);

  return {
    isUpdating,
    error,
    update,
  };
};

// Custom hook for pagination
export const usePagination = <T = any>(
  fetchFunction: (page: number, limit: number) => Promise<{ data: T[]; total: number }>,
  initialPage: number = 1,
  initialLimit: number = 10
) => {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetch = useCallback(async (pageNum: number = page, limitNum: number = limit) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchFunction(pageNum, limitNum);
      
      if (pageNum === 1) {
        setData(result.data);
      } else {
        setData(prev => [...prev, ...result.data]);
      }
      
      setTotal(result.total);
      setHasMore(result.data.length === limitNum && result.data.length * pageNum < result.total);
      setPage(pageNum);
      setLimit(limitNum);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction, page, limit]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      return fetch(page + 1, limit);
    }
  }, [fetch, page, limit, hasMore, isLoading]);

  const refresh = useCallback(() => {
    return fetch(1, limit);
  }, [fetch, limit]);

  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setLimit(initialLimit);
    setTotal(0);
    setHasMore(true);
    setError(null);
  }, [initialPage, initialLimit]);

  return {
    data,
    isLoading,
    error,
    page,
    limit,
    total,
    hasMore,
    fetch,
    loadMore,
    refresh,
    reset,
    setPage,
    setLimit,
  };
};

// Custom hook for real-time data
export const useRealTimeData = <T = any>(
  initialData: T[] = [],
  eventType: string,
  transformFunction?: (data: any) => T
) => {
  const [data, setData] = useState<T[]>(initialData);
  const [isConnected, setIsConnected] = useState(false);

  const updateData = useCallback((newData: any) => {
    if (transformFunction) {
      const transformed = transformFunction(newData);
      setData(prev => {
        const index = prev.findIndex(item => (item as any).id === (transformed as any).id);
        if (index >= 0) {
          return prev.map((item, i) => i === index ? transformed : item);
        } else {
          return [transformed, ...prev];
        }
      });
    } else {
      setData(prev => {
        const index = prev.findIndex(item => (item as any).id === (newData as any).id);
        if (index >= 0) {
          return prev.map((item, i) => i === index ? newData : item);
        } else {
          return [newData, ...prev];
        }
      });
    }
  }, [transformFunction]);

  return {
    data,
    setData,
    updateData,
    isConnected,
    setIsConnected,
  };
};
