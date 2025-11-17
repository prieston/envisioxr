import useSWR from "swr";
import { projectsFetcher } from "@/app/utils/api";

interface UseProjectsOptions {
  search?: string;
}

const useProjects = (options?: UseProjectsOptions) => {
  // Build the SWR key with search as query parameter
  const searchQuery = options?.search?.trim() || "";
  const key = searchQuery
    ? `/api/projects?search=${encodeURIComponent(searchQuery)}`
    : "/api/projects";

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
