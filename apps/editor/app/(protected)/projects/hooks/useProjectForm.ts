import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface UseProjectFormProps {
  projects: Array<{ id: string; title: string; description?: string; engine?: string }>;
  setProjects: React.Dispatch<
    React.SetStateAction<
      Array<{ id: string; title: string; description?: string; engine?: string }>
    >
  >;
}

export const useProjectForm = ({ projects, setProjects }: UseProjectFormProps) => {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [engine, setEngine] = useState("three");
  const [saving, setSaving] = useState(false);

  const handleCreateProject = useCallback(() => {
    setEditingProjectId(null);
    setTitle("");
    setDescription("");
    setEngine("three");
    setDrawerOpen(true);
  }, []);

  const handleEditProject = useCallback(
    (projectId: string) => {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        setEditingProjectId(projectId);
        setTitle(project.title || "");
        setDescription(project.description || "");
        setEngine(project.engine || "three");
        setDrawerOpen(true);
      }
    },
    [projects]
  );

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEditingProjectId(null);
    setTitle("");
    setDescription("");
    setEngine("three");
  }, []);

  const handleSaveProject = useCallback(async () => {
    if (!title.trim()) return;

    setSaving(true);
    try {
      const isEditing = !!editingProjectId;
      const url = isEditing ? `/api/projects/${editingProjectId}` : "/api/projects";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        credentials: "include",
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          engine,
        }),
      });

      if (!res.ok) {
        throw new Error(
          isEditing ? "Failed to update project" : "Failed to create project"
        );
      }

      const data = await res.json();
      const project = data.project || data;

      if (isEditing) {
        // Update the project in the list
        setProjects((prev) =>
          prev.map((p) => (p.id === editingProjectId ? project : p))
        );
      } else {
        // Add the new project to the list
        setProjects((prev) => [project, ...prev]);
        // Navigate to the builder for new projects
        router.push(`/projects/${project.id}/builder`);
      }

      // Close drawer and reset form
      handleCloseDrawer();
    } catch (error) {
      console.error("Error saving project:", error);
      // TODO: Show error toast
    } finally {
      setSaving(false);
    }
  }, [title, description, engine, editingProjectId, setProjects, router, handleCloseDrawer]);

  return {
    drawerOpen,
    editingProjectId,
    title,
    description,
    engine,
    saving,
    setTitle,
    setDescription,
    setEngine,
    handleCreateProject,
    handleEditProject,
    handleCloseDrawer,
    handleSaveProject,
  };
};

