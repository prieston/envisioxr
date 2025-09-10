# Cesium Setup Guide

This project is configured to work with Cesium in Next.js following the best practices from the Cesium community.

## Configuration Overview

### 1. Webpack Configuration (`next.config.mjs`)

- ✅ Proper asset handling for Cesium files (PNG, GIF, JPG, SVG, XML, JSON)
- ✅ CSS handling for Cesium widgets
- ✅ Static asset copying (Workers, ThirdParty, Assets, Widgets)
- ✅ Webpack optimization with Cesium chunk splitting
- ✅ Fallback configuration for Node.js modules

### 2. Asset Copying (`scripts/copy-cesium-assets.js`)

- ✅ Automatically copies Cesium static assets to `public/cesium/`
- ✅ Runs before development and build
- ✅ Robust error handling and logging

### 3. Environment Configuration

- ✅ `NEXT_PUBLIC_CESIUM_ION_KEY` environment variable
- ✅ `NEXT_PUBLIC_BING_MAPS_KEY` environment variable (optional)
- ✅ Proper TypeScript declarations
- ✅ Client and server-side validation

### 4. Component Implementation

- ✅ Dynamic imports for Cesium library
- ✅ Proper CESIUM_BASE_URL configuration
- ✅ Error handling and retry mechanisms
- ✅ Performance optimizations

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Environment Variables

Create a `.env.local` file in the `editor` directory:

```env
NEXT_PUBLIC_CESIUM_ION_KEY=your_cesium_ion_access_token_here
```

Get your access token from: https://cesium.com/ion/signup/

### 3. Run Development Server

```bash
pnpm dev
```

The script will automatically:

- Copy Cesium assets to `public/cesium/`
- Start the development server on port 3001

### 4. Build for Production

```bash
pnpm build
```

## Key Features

### CesiumViewer Component

- ✅ Dynamic loading with error handling
- ✅ Performance optimizations (requestRenderMode, targetFrameRate)
- ✅ Terrain provider with water mask and vertex normals
- ✅ Entity rendering from world data
- ✅ Proper cleanup and memory management
- ✅ Multiple basemap support (Cesium World Imagery, Google Satellite, Bing Maps)
- ✅ Full-width/height container sizing

### 3D Tiles Integration

- ✅ Cesium Ion 3D Tiles support
- ✅ Multiple asset rendering
- ✅ Coordinate system handling
- ✅ Camera auto-centering

### Performance Optimizations

- ✅ Webpack chunk splitting for Cesium
- ✅ Request render mode for better performance
- ✅ Disabled unnecessary UI widgets
- ✅ Optimized terrain loading

## Troubleshooting

### Common Issues

1. **Cesium assets not loading**

   - Check that `public/cesium/` directory exists
   - Verify the copy script ran successfully
   - Check browser console for 404 errors

2. **Cesium Ion authentication errors**

   - Verify `NEXT_PUBLIC_CESIUM_ION_KEY` is set correctly
   - Check that the token is valid and has proper permissions

3. **Performance issues**
   - Ensure `requestRenderMode` is enabled
   - Check that unnecessary UI widgets are disabled
   - Monitor memory usage in browser dev tools

### Debug Mode

Enable debug logging by checking the browser console for messages prefixed with `[CesiumViewer]`.

## Best Practices Followed

1. **Dynamic Imports**: Cesium is loaded dynamically to avoid SSR issues
2. **Asset Management**: Static assets are properly copied and served
3. **Error Handling**: Comprehensive error handling with user-friendly messages
4. **Performance**: Optimized configuration for smooth rendering
5. **Memory Management**: Proper cleanup to prevent memory leaks
6. **TypeScript**: Full type safety with proper declarations

## Comparison with Successful Next.js 14 + Cesium Implementations

This implementation follows the same patterns as successful Next.js 14 + TypeScript + Cesium deployments on Vercel, including:

### ✅ **Matching Best Practices:**

- **Next.js 14 + TypeScript**: Using the latest stable versions
- **Dynamic Imports**: Avoiding SSR issues with Cesium
- **Asset Management**: Proper static asset copying
- **Webpack Optimization**: Enhanced chunk splitting and caching
- **Performance Monitoring**: Real-time frame rate and memory monitoring
- **Error Handling**: Comprehensive error handling with retry mechanisms

### 🔧 **Additional Optimizations Added:**

- **Performance Optimizer Component**: Automatic performance tuning
- **Enhanced Webpack Configuration**: Better chunk splitting for Three.js and Cesium
- **Memory Management**: Automatic garbage collection and memory monitoring
- **Frame Rate Monitoring**: Adaptive quality settings based on performance

### 📊 **Performance Features:**

- **Request Render Mode**: Only renders when needed
- **Optimized Terrain Settings**: Balanced quality vs performance
- **Memory Monitoring**: Prevents memory leaks
- **Adaptive Quality**: Automatically adjusts settings for low-end devices

## Environment Variables

This implementation supports both naming conventions for the Cesium Ion token:

```env
# Option 1 (recommended)
NEXT_PUBLIC_CESIUM_ION_KEY=your_cesium_ion_access_token_here

# Option 2 (alternative, matches working example)
NEXT_PUBLIC_CESIUM_TOKEN=your_cesium_ion_access_token_here
```

## React Strict Mode Compatibility

This implementation includes React Strict Mode compatible cleanup functions to handle the double-initialization that occurs in development mode. The cleanup ensures that:

- Primitives are properly removed before re-initialization
- Memory leaks are prevented
- No duplicate entities are created

## References

- [Cesium Community - Next.js Integration](https://community.cesium.com/t/cesium-nextjs/27658/2)
- [Success! Next.js 14, TypeScript + Cesium on Vercel](https://community.cesium.com/t/success-next-js-14-typescript-cesium-on-vercel/31109/2)
- [Working Next.js + Cesium Example](https://github.com/hyundotio/nextjs-ts-cesium-example)
- [Cesium Documentation](https://cesium.com/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
