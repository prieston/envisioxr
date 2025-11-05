/**
 * Error display component for Cesium viewer
 */

interface CesiumErrorDisplayProps {
  error: string;
  instanceId: string;
}

export function CesiumErrorDisplay({
  error,
  instanceId,
}: CesiumErrorDisplayProps) {
  return (
    <div className="flex items-center justify-center h-full bg-red-50 border border-red-200 rounded">
      <div className="text-center">
        <p className="text-red-600 font-medium">Failed to load Cesium</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
        <p className="text-red-400 text-xs mt-1">Instance: {instanceId}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

