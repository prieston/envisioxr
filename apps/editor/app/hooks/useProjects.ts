import useSWR from "swr";
import { projectsFetcher } from "@/app/utils/api";

const useProjects = () => {
  const { data: projects = [], error, isLoading: loadingProjects, mutate } = useSWR(
    "/api/projects",
    projectsFetcher,
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
