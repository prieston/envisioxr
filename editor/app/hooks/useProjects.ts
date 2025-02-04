import { useState, useEffect } from "react";

const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`/api/projects`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        setProjects(data.projects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  return { projects, setProjects, loadingProjects };
};

export default useProjects;
