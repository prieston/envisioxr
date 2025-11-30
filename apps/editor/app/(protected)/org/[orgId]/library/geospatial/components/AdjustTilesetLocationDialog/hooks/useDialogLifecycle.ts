import { useEffect, useRef } from "react";

interface UseDialogLifecycleOptions {
  open: boolean;
  initialTransform?: number[];
  onReset: () => void;
}

export function useDialogLifecycle({
  open,
  initialTransform,
  onReset,
}: UseDialogLifecycleOptions) {
  const stableInitialTransformRef = useRef<number[] | undefined>(
    initialTransform
  );
  const onResetRef = useRef(onReset);
  const hasOpenedRef = useRef(false);

  // Update callback ref when it changes
  useEffect(() => {
    onResetRef.current = onReset;
  }, [onReset]);

  useEffect(() => {
    // Only run when dialog transitions from closed to open
    if (open && !hasOpenedRef.current) {
      hasOpenedRef.current = true;
      stableInitialTransformRef.current = initialTransform;
      onResetRef.current();
    } else if (!open) {
      // Reset flag when dialog closes
      hasOpenedRef.current = false;
    }
  }, [open, initialTransform]);

  return {
    stableInitialTransformRef,
  };
}

