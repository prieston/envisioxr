"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var traditional_1 = require("zustand/traditional");
var useWorldStore = (0, traditional_1.createWithEqualityFn)(function (set) { return ({
    activeWorld: null,
    engine: "three",
    setActiveWorld: function (world) { var _a; return set({ activeWorld: world, engine: (_a = world === null || world === void 0 ? void 0 : world.engine) !== null && _a !== void 0 ? _a : "three" }); },
}); });
exports.default = useWorldStore;
