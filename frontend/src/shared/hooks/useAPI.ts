import { useState, useCallback } from 'react';
import { quantumAPI, APIResponse } from '../api/apiClient';

// Generic hook for API calls
export function useAPI<T = any>(
  apiFunction: (...args: any[]) => Promise<APIResponse<T>>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiFunction(...args);
        setData(response.data);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return { data, loading, error, execute };
}

// Specific hooks for different API calls
export function useLogin() {
  return useAPI(quantumAPI.login);
}

export function useRegister() {
  return useAPI(quantumAPI.register);
}

export function useUpdateProfile() {
  return useAPI(quantumAPI.updateProfile);
}

export function useGetPets() {
  return useAPI(quantumAPI.getPets);
}

export function useCreatePet() {
  return useAPI(quantumAPI.createPet);
}

export function useUpdatePet() {
  return useAPI(quantumAPI.updatePet);
}

export function useDeletePet() {
  return useAPI(quantumAPI.deletePet);
}

export function useGetBookings() {
  return useAPI(quantumAPI.getBookings);
}

export function useCreateBooking() {
  return useAPI(quantumAPI.createBooking);
}

export function useUpdateBooking() {
  return useAPI(quantumAPI.updateBooking);
}

export function useCancelBooking() {
  return useAPI(quantumAPI.cancelBooking);
}

export function useGetSitters() {
  return useAPI(quantumAPI.getSitters);
}

export function useGetSitterProfile() {
  return useAPI(quantumAPI.getSitterProfile);
}

export function useGetReviews() {
  return useAPI(quantumAPI.getReviews);
}

export function useCreateReview() {
  return useAPI(quantumAPI.createReview);
}

export function useGetPaymentMethods() {
  return useAPI(quantumAPI.getPaymentMethods);
}

export function useGetNotificationSettings() {
  return useAPI(quantumAPI.getNotificationSettings);
}

export function useUpdateNotificationSettings() {
  return useAPI(quantumAPI.updateNotificationSettings);
}

export function useGetNotificationHistory() {
  return useAPI(quantumAPI.getNotificationHistory);
}

export function useGetAnalytics() {
  return useAPI(quantumAPI.getAnalytics);
}

export function useGetBusinessMetrics() {
  return useAPI(quantumAPI.getBusinessMetrics);
}

export function useGetUserAnalytics() {
  return useAPI(quantumAPI.getUserAnalytics);
}

export function useGetSitterAnalytics() {
  return useAPI(quantumAPI.getSitterAnalytics);
}

export function useGetAIPerformanceMetrics() {
  return useAPI(quantumAPI.getAIPerformanceMetrics);
}

export function useCreateVideoCall() {
  return useAPI(quantumAPI.createVideoCall);
}

export function useJoinVideoCall() {
  return useAPI(quantumAPI.joinVideoCall);
}

export function useEndVideoCall() {
  return useAPI(quantumAPI.endVideoCall);
}

export function useUploadFile() {
  return useAPI(quantumAPI.uploadFile);
}

export function useDeleteFile() {
  return useAPI(quantumAPI.deleteFile);
}
