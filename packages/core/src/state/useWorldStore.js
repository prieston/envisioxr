import { createWithEqualityFn as create } from "zustand/traditional";
const useWorldStore = create((set) => ({
    activeWorld: null,
    engine: "three",
    setActiveWorld: (world) => { var _a; return set({ activeWorld: world, engine: (_a = world === null || world === void 0 ? void 0 : world.engine) !== null && _a !== void 0 ? _a : "three" }); },
}));
export default useWorldStore;
//# sourceMappingURL=useWorldStore.js.map