import useSWR from "swr";
import { modelsFetcher } from "@/app/utils/api";
import type { ModelsResponse } from "@/app/utils/api";

interface UseModelsOptions {
  assetType?: "model" | "cesiumIonAsset";
}

const useModels = (options?: UseModelsOptions) => {
  // Build the SWR key with assetType as query parameter
  const key = options?.assetType
    ? `/api/models?assetType=${options.assetType}`
    : "/api/models";

  const { data, error, isLoading, mutate } = useSWR<ModelsResponse>(
    key,
    (url) => modelsFetcher(url, options?.assetType),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    models: data?.assets || [],
    stockModels: data?.stockModels || [],
    loadingModels: isLoading,
    error,
    mutate,
  };
};

export default useModels;

