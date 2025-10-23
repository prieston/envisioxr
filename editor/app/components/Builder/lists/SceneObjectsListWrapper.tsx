import React from "react";
import { SceneObjectsList } from "@envisio/ui";
import { useSceneStore } from "@envisio/core";

/**
 * Wrapper component that connects the generic SceneObjectsList UI component
 * to the scene store. This keeps the UI component framework-agnostic.
 */
const SceneObjectsListWrapper: React.FC = () => {
  // Use selectors to avoid re-renders when weatherData updates
  const objects = useSceneStore((state) => state.objects);
  const selectObject = useSceneStore((state) => state.selectObject);
  const removeObject = useSceneStore((state) => state.removeObject);
  const deselectObject = useSceneStore((state) => state.deselectObject);

  // For selectedObject, exclude weatherData to prevent re-renders
  const selectedObject = useSceneStore((state) => {
    if (!state.selectedObject) return null;
    const { weatherData, ...rest } = state.selectedObject;
    return rest;
  });

  const handleSelect = (id: string) => {
    // Clear Cesium feature selection when selecting a scene object
    const setSelectedCesiumFeature =
      useSceneStore.getState().setSelectedCesiumFeature;
    setSelectedCesiumFeature(null);

    if (selectedObject?.id === id) {
      deselectObject();
    } else {
      const object = objects.find((obj) => obj.id === id);
      selectObject(id, object?.ref || null);
    }
  };

  const handleDelete = (id: string) => {
    removeObject(id);
  };

  // Transform objects to the format expected by UI component
  const items = objects.map((obj) => ({
    id: obj.id,
    name: obj.name || "Untitled Object",
    type: obj.type || "Unknown",
  }));

  return (
    <SceneObjectsList
      items={items}
      selectedId={selectedObject?.id || null}
      onSelect={handleSelect}
      onDelete={handleDelete}
    />
  );
};

export default SceneObjectsListWrapper;
