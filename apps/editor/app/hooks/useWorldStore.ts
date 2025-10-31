import { create } from "zustand";
import type { World, Engine } from "@envisio/config";

interface WorldState {
  activeWorld: World | null;
  engine: Engine;
  /**
   * Selects the active world and updates the rendering engine.
   * Extend this when adding additional engines (e.g. BabylonJS).
   */
  setActiveWorld: (world: World | null) => void;
}

const useWorldStore = create<WorldState>((set) => ({
  activeWorld: null,
  engine: "three",
  setActiveWorld: (world) =>
    set({ activeWorld: world, engine: world?.engine ?? "three" }),
}));

export default useWorldStore;
