import useSWR from "swr";
import { activitiesFetcher } from "@/app/utils/api";
import type { ActivitiesResponse } from "@/app/utils/api";

interface UseActivityOptions {
  limit?: number;
  organizationId?: string;
}

const useActivity = (options?: UseActivityOptions) => {
  // Build the SWR key with query parameters
  const params = new URLSearchParams();
  if (options?.limit) {
    params.append("limit", String(options.limit));
  }
  if (options?.organizationId) {
    params.append("organizationId", options.organizationId);
  }
  const key = `/api/activity${params.toString() ? `?${params.toString()}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<ActivitiesResponse>(
    key,
    activitiesFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    activities: data?.activities || [],
    loadingActivity: isLoading,
    error,
    mutate,
  };
};

export default useActivity;

