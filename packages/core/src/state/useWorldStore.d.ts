import type { World, Engine } from "@envisio/core/types";
interface WorldState {
    activeWorld: World | null;
    engine: Engine;
    setActiveWorld: (world: World | null) => void;
}
declare const useWorldStore: import("zustand/traditional").UseBoundStoreWithEqualityFn<import("zustand/vanilla").StoreApi<WorldState>>;
export default useWorldStore;
//# sourceMappingURL=useWorldStore.d.ts.map