import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    credentials: "include",
  });
  if (!res.ok) {
    const error = new Error("Failed to fetch projects");
    throw error;
  }
  const data = await res.json();
  return data.projects;
};

const useProjects = () => {
  const { data: projects = [], error, isLoading: loadingProjects, mutate } = useSWR(
    "/api/projects",
    fetcher,
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
