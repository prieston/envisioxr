/* eslint-disable no-console */

/**
 * Request pointer lock on a canvas element with an optional delay.
 * Falls back silently if not available.
 */
export function requestPointerLockForCanvas(
  canvas: HTMLCanvasElement | null | undefined,
  delayMs: number = 0
) {
  if (!canvas) return;
  const doRequest = () => {
    if (!document.pointerLockElement && canvas.requestPointerLock) {
      try {
        const maybePromise = canvas.requestPointerLock();
        if (
          maybePromise &&
          typeof (maybePromise as Promise<void>).then === "function"
        ) {
          (maybePromise as Promise<void>).catch(() => {});
        }
      } catch (_) {
        // ignore
      }
    }
  };
  if (delayMs > 0) setTimeout(doRequest, delayMs);
  else doRequest();
}

/** Exit pointer lock if currently locked. */
export function exitPointerLockIfActive() {
  if (document.pointerLockElement) {
    try {
      document.exitPointerLock();
    } catch (_) {
      // ignore
    }
  }
}

