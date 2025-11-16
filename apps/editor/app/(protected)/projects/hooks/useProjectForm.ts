import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createProject, updateProject } from "@/app/utils/api";
import useProjects from "@/app/hooks/useProjects";

interface UseProjectFormProps {
  projects: Array<{ id: string; title: string; description?: string; engine?: string }>;
  setProjects: React.Dispatch<
    React.SetStateAction<
      Array<{ id: string; title: string; description?: string; engine?: string }>
    >
  >;
}

export const useProjectForm = ({ projects, setProjects: _setProjects }: UseProjectFormProps) => {
  const router = useRouter();
  const { mutate } = useProjects();
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

      if (isEditing) {
        await updateProject(editingProjectId, {
          title: title.trim(),
          description: description.trim(),
          engine: engine as "three" | "cesium",
        });
        // Refresh projects list from SWR
        mutate();
      } else {
        // Create new project
        const response = await createProject({
          title: title.trim(),
          description: description.trim(),
          engine: engine as "three" | "cesium",
        });
        // Refresh projects list from SWR
        mutate();
        // Navigate to the builder for new projects
        router.push(`/projects/${response.project.id}/builder`);
      }

      // Close drawer and reset form
      handleCloseDrawer();
    } catch (error) {
      console.error("Error saving project:", error);
      // TODO: Show error toast
    } finally {
      setSaving(false);
    }
  }, [title, description, engine, editingProjectId, mutate, router, handleCloseDrawer]);

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

