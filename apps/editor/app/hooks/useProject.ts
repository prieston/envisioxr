import useSWR from "swr";
import { projectFetcher } from "@/app/utils/api";
import type { Project } from "@/app/utils/api";

const useProject = (projectId: string | null | undefined) => {
  const { data: project, error, isLoading, mutate } = useSWR<Project>(
    projectId ? `/api/projects/${projectId}` : null,
    projectFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    project,
    loadingProject: isLoading,
    error,
    mutate,
  };
};

export default useProject;

