/**
 * Check if an error is related to Gaussian splatting
 */
export function isGaussianSplattingError(error: any): boolean {
  const errorMessage = error?.message || String(error) || "";
  const errorStack = error?.stack || "";
  const errorString = JSON.stringify(error) || "";

  return (
    errorMessage.includes("KHR_spz_gaussian_splats_compression") ||
    errorMessage.includes("Unsupported glTF Extension") ||
    errorMessage.includes("gaussian_splats") ||
    errorMessage.includes("gaussian_splatting") ||
    errorStack.includes("KHR_spz_gaussian_splats_compression") ||
    errorString.includes("KHR_spz_gaussian_splats_compression")
  );
}

/**
 * Create a friendly error message for Gaussian splatting errors
 */
export function createGaussianSplattingError(): Error {
  return new Error(
    "This model uses Gaussian splatting with an unsupported extension. " +
      "Please re-upload the model to Cesium Ion to generate a compatible version " +
      "with the updated Gaussian splatting extensions."
  );
}

/**
 * Setup console error interceptor to catch Gaussian splatting errors
 */
export function setupConsoleErrorInterceptor(
  onGaussianSplattingError: (error: Error) => void
): () => void {
  const originalConsoleError = console.error;
  const errorShown = { current: false };

  const consoleErrorInterceptor = (...args: any[]) => {
    const errorString = args
      .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
      .join(" ");

    if (
      !errorShown.current &&
      (errorString.includes("KHR_spz_gaussian_splats_compression") ||
        errorString.includes("Unsupported glTF Extension") ||
        errorString.includes("gaussian_splats") ||
        errorString.includes("gaussian_splatting"))
    ) {
      errorShown.current = true;
      onGaussianSplattingError(createGaussianSplattingError());

      // Restore console.error after a delay
      setTimeout(() => {
        console.error = originalConsoleError;
      }, 1000);
    }

    // Call original console.error
    originalConsoleError.apply(console, args);
  };

  console.error = consoleErrorInterceptor;

  // Return cleanup function
  return () => {
    console.error = originalConsoleError;
  };
}

/**
 * Setup error handlers for a tileset (Gaussian splatting detection)
 * @param tileset - The Cesium3DTileset
 * @param gaussianSplatErrorShown - Ref to track if error was already shown
 * @param onError - Callback when error occurs
 * @returns Cleanup function to remove event listeners
 */
export function setupTilesetErrorHandlers(
  tileset: any,
  gaussianSplatErrorShown: { current: boolean },
  onError: (error: Error) => void
): () => void {
  const handleTileError = (tile: any, tileError: any) => {
    if (gaussianSplatErrorShown.current) {
      return;
    }

    if (isGaussianSplattingError(tileError)) {
      gaussianSplatErrorShown.current = true;
      const friendlyError = createGaussianSplattingError();
      onError(friendlyError);
    }
  };

  tileset.tileFailed.addEventListener(handleTileError);

  // Listen for general tileset errors
  let readyPromiseCleanup: (() => void) | null = null;
  if (tileset.readyPromise) {
    const promiseHandler = tileset.readyPromise.catch((readyError: any) => {
      if (gaussianSplatErrorShown.current) {
        return;
      }

      if (isGaussianSplattingError(readyError)) {
        gaussianSplatErrorShown.current = true;
        const friendlyError = createGaussianSplattingError();
        onError(friendlyError);
      }
    });
    readyPromiseCleanup = () => {
      // Note: Promise handlers can't be removed, but we track via gaussianSplatErrorShown
    };
  }

  // Return cleanup function
  return () => {
    try {
      tileset.tileFailed.removeEventListener(handleTileError);
    } catch (err) {
      // Ignore cleanup errors
    }
    if (readyPromiseCleanup) {
      readyPromiseCleanup();
    }
  };
}

