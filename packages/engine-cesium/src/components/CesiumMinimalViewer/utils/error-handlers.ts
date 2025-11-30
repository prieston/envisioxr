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

