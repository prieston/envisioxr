import useSWR from "swr";
import { modelFetcher } from "@/app/utils/api";
import type { Asset } from "@/app/utils/api";

const useModel = (assetId: string | null | undefined) => {
  const { data: model, error, isLoading, mutate } = useSWR<Asset>(
    assetId ? `/api/models/${assetId}` : null,
    modelFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    model,
    loadingModel: isLoading,
    error,
    mutate,
  };
};

export default useModel;

