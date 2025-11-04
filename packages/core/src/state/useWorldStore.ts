import { createWithEqualityFn as create } from "zustand/traditional";
import type { World, Engine } from "../types";

interface WorldState {
  activeWorld: World | null;
  engine: Engine;
  setActiveWorld: (world: World | null) => void;
}

const useWorldStore = create<WorldState>((set) => ({
  activeWorld: null,
  engine: "three",
  setActiveWorld: (world) =>
    set({ activeWorld: world, engine: world?.engine ?? "three" }),
}));

export default useWorldStore;
