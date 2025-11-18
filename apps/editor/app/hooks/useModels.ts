import useSWR from "swr";
import { modelsFetcher } from "@/app/utils/api";
import type { ModelsResponse } from "@/app/utils/api";
import { useOrgId } from "./useOrgId";

interface UseModelsOptions {
  assetType?: "model" | "cesiumIonAsset";
  orgId?: string | null;
}

const useModels = (options?: UseModelsOptions) => {
  const orgIdFromUrl = useOrgId();
  const orgId = options?.orgId ?? orgIdFromUrl;

  // Build the SWR key with orgId and assetType as query parameters
  const params = new URLSearchParams();
  if (orgId) {
    params.append("organizationId", orgId);
  }
  if (options?.assetType) {
    params.append("assetType", options.assetType);
  }
  const key = orgId ? `/api/models?${params.toString()}` : null;

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

