import useSWR from "swr";
import { projectsFetcher } from "@/app/utils/api";
import { useOrgId } from "./useOrgId";

interface UseProjectsOptions {
  search?: string;
  orgId?: string | null;
}

const useProjects = (options?: UseProjectsOptions) => {
  const orgIdFromUrl = useOrgId();
  const orgId = options?.orgId ?? orgIdFromUrl;

  // Build the SWR key with orgId and search as query parameters
  const searchQuery = options?.search?.trim() || "";
  const params = new URLSearchParams();
  if (orgId) {
    params.append("organizationId", orgId);
  }
  if (searchQuery) {
    params.append("search", searchQuery);
  }
  const key = orgId ? `/api/projects?${params.toString()}` : null;

  const { data: projects = [], error, isLoading: loadingProjects, mutate } = useSWR(
    key,
    (url) => projectsFetcher(url),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    projects,
    setProjects: mutate,
    loadingProjects,
    error,
  };
};

export default useProjects;
