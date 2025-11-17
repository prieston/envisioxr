"use client";

/**
 * Screenshot capture utilities for Three.js and Cesium scenes
 */

/**
 * Captures a screenshot from a Three.js canvas
 */
export function captureThreeJSScreenshot(scene: any): string | null {
  const canvas: HTMLCanvasElement =
    (scene?.renderer?.domElement as HTMLCanvasElement) ||
    (document.querySelector("canvas") as HTMLCanvasElement);

  if (canvas) {
    // Ensure preserveDrawingBuffer is enabled (should be set in Canvas component)
    const dataUrl = canvas.toDataURL("image/png");
    return dataUrl;
  }

  return null;
}

/**
 * Captures a screenshot from a Cesium viewer
 * Uses postRender callback to read framebuffer before it's cleared
 */
export async function captureCesiumScreenshot(
  viewer: any
): Promise<string | null> {
  if (!viewer) {
    throw new Error("Cesium viewer not ready");
  }

  const scene = viewer.scene;
  const canvas = scene.canvas;
  const context = scene.context;

  if (!scene || !canvas || !context) {
    throw new Error("Scene not available");
  }

  const gl = context._gl;

  // Read pixels during postRender callback to capture before buffer is cleared
  return new Promise<string>((resolve, reject) => {
    const width = canvas.width;
    const height = canvas.height;
    const pixels = new Uint8Array(width * height * 4);

    const renderListener = () => {
      try {
        // Remove listener immediately to avoid multiple calls
        scene.postRender.removeEventListener(renderListener);

        // Read pixels synchronously during the render callback
        // This is critical - must read before the buffer is cleared
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        // Check if we got valid pixel data
        let hasData = false;
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i] > 5 || pixels[i + 1] > 5 || pixels[i + 2] > 5) {
            hasData = true;
            break;
          }
        }

        if (!hasData) {
          reject(new Error("Framebuffer appears to be empty"));
          return;
        }

        // Create a temporary canvas and draw the pixels
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = width;
        tempCanvas.height = height;
        const ctx = tempCanvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not create 2D context"));
          return;
        }

        const imageData = ctx.createImageData(width, height);
        // Flip vertically (WebGL has origin at bottom-left, canvas at top-left)
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const srcIndex = ((height - 1 - y) * width + x) * 4;
            const dstIndex = (y * width + x) * 4;
            imageData.data[dstIndex] = pixels[srcIndex]; // R
            imageData.data[dstIndex + 1] = pixels[srcIndex + 1]; // G
            imageData.data[dstIndex + 2] = pixels[srcIndex + 2]; // B
            imageData.data[dstIndex + 3] = pixels[srcIndex + 3]; // A
          }
        }
        ctx.putImageData(imageData, 0, 0);
        const dataUrl = tempCanvas.toDataURL("image/png");

        if (dataUrl && dataUrl !== "data:,") {
          resolve(dataUrl);
        } else {
          reject(new Error("Failed to create data URL"));
        }
      } catch (error) {
        scene.postRender.removeEventListener(renderListener);
        reject(error);
      }
    };

    // Request a render and wait for postRender callback
    scene.postRender.addEventListener(renderListener);
    scene.requestRender();

    // Timeout fallback
    setTimeout(() => {
      scene.postRender.removeEventListener(renderListener);
      reject(new Error("Screenshot capture timed out"));
    }, 5000);
  });
}

