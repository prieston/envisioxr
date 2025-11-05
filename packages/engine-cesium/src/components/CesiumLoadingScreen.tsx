/**
 * Loading screen component for Cesium viewer
 */

export function CesiumLoadingScreen() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0a0d10 0%, #14171a 50%, #1a1f24 100%)",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          padding: "32px",
          backgroundColor: "rgba(20, 23, 26, 0.95)",
          backdropFilter: "blur(24px) saturate(140%)",
          WebkitBackdropFilter: "blur(24px) saturate(140%)",
          borderRadius: "8px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 0 30px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: "3px solid rgba(107, 156, 216, 0.2)",
            borderTopColor: "#6B9CD8",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <p
          style={{
            color: "rgba(148, 163, 184, 0.9)",
            fontSize: "15px",
            fontWeight: 500,
            margin: 0,
          }}
        >
          Loading scene...
        </p>
      </div>
    </div>
  );
}

