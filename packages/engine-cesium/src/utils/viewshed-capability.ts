/**
 * Utility functions for checking viewshed capability on mobile GPUs
 */

export function canSupportViewshed(viewer: any): boolean {
  const ctx: any = viewer?.scene?.context;

  const gl: WebGLRenderingContext | WebGL2RenderingContext | undefined =
    ctx?._gl;
  if (!gl) {
    return false;
  }

  const isWebGL2 = !!ctx?.webgl2;
  const hasDepthTex = isWebGL2 || !!gl.getExtension("WEBGL_depth_texture");
  // Be more permissive - only require depth texture for basic viewshed
  const permissiveResult = hasDepthTex;

  return permissiveResult;
}

