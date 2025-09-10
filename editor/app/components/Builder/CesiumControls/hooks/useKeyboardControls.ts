import { useRef, useCallback } from "react";

/**
 * Hook for managing keyboard input state
 *
 * @returns Object containing keyboard event handlers and utilities
 */
export const useKeyboardControls = () => {
  const keys = useRef<Set<string>>(new Set());

  /**
   * Handle key down events
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    keys.current.add(event.code);
    if (process.env.NODE_ENV === "development") {
      console.log(`[CesiumViewModeControls] Key pressed: ${event.code}`);
    }
  }, []);

  /**
   * Handle key up events
   */
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    keys.current.delete(event.code);
  }, []);

  /**
   * Get currently pressed keys
   */
  const getPressedKeys = useCallback(() => keys.current, []);

  /**
   * Clear all pressed keys
   */
  const clearKeys = useCallback(() => keys.current.clear(), []);

  /**
   * Check if a specific key is currently pressed
   */
  const isKeyPressed = useCallback((keyCode: string) => {
    return keys.current.has(keyCode);
  }, []);

  return {
    handleKeyDown,
    handleKeyUp,
    getPressedKeys,
    clearKeys,
    isKeyPressed,
  };
};
