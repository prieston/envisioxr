import type { Engine } from "../types/world";

// Simple utility to get the current engine without requiring Zustand
// This will be passed as a parameter to the config functions
export interface WorldStoreState {
  engine: Engine;
}

// Default state for when no world store is available
export const defaultWorldStoreState: WorldStoreState = {
  engine: "three",
};

// Utility function to get engine from world store state
export const getEngine = (worldStoreState?: WorldStoreState): Engine => {
  return worldStoreState?.engine ?? "three";
};
