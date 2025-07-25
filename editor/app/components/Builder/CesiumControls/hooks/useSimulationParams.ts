import { useMemo } from "react";
import { SimulationParams } from "../types";
import { DEFAULT_SIMULATION_PARAMS } from "../constants";

/**
 * Hook for managing simulation parameters
 *
 * @returns Memoized simulation parameters configuration
 */
export const useSimulationParams = (): SimulationParams => {
  return useMemo(
    (): SimulationParams => ({
      ...DEFAULT_SIMULATION_PARAMS,
    }),
    []
  );
};
