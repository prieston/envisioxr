import useSWR from "swr";
import { activitiesFetcher } from "@/app/utils/api";
import type { ActivitiesResponse } from "@/app/utils/api";
import { useOrgId } from "./useOrgId";

interface UseActivityOptions {
  limit?: number;
  organizationId?: string | null;
}

const useActivity = (options?: UseActivityOptions) => {
  const orgIdFromUrl = useOrgId();
  const orgId = options?.organizationId ?? orgIdFromUrl;

  // Build the SWR key with query parameters - orgId is required
  const params = new URLSearchParams();
  if (options?.limit) {
    params.append("limit", String(options.limit));
  }
  const key = orgId ? `/api/organizations/${orgId}/activity?${params.toString()}` : null;

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

