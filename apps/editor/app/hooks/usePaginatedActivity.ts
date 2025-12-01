import { useState } from "react";
import useSWR from "swr";
import { activitiesFetcher } from "@/app/utils/api";
import type { ActivitiesResponse } from "@/app/utils/api";
import { useOrgId } from "./useOrgId";

interface UsePaginatedActivityOptions {
  page?: number;
  pageSize?: number;
  organizationId?: string | null;
}

const usePaginatedActivity = (options?: UsePaginatedActivityOptions) => {
  const orgIdFromUrl = useOrgId();
  const orgId = options?.organizationId ?? orgIdFromUrl;
  const pageSize = options?.pageSize ?? 50;
  const [page, setPage] = useState(options?.page ?? 1);

  // Build the SWR key with query parameters - orgId is required
  const params = new URLSearchParams();
  const skip = (page - 1) * pageSize;
  params.append("skip", String(skip));
  params.append("take", String(pageSize));
  
  const key = orgId ? `/api/organizations/${orgId}/activity?${params.toString()}` : null;

  const { data, error, isLoading, mutate } = useSWR<ActivitiesResponse>(
    key,
    activitiesFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  return {
    activities: data?.activities || [],
    loadingActivity: isLoading,
    error,
    mutate,
    page,
    pageSize,
    total,
    totalPages,
    handlePageChange,
  };
};

export default usePaginatedActivity;

