  console.log("\n💡 How to fix:");
  console.log("   - Mark 3D packages as client-only: dynamic(() => import('./Component'), { ssr: false })");
  console.log("   - Lazy-load Cesium/Three panels (don't import in dashboard shell)");
  console.log("   - Use code splitting: React.lazy() for heavy components");
  console.log("   - Review bundle analyzer: pnpm analyze:editor\n");