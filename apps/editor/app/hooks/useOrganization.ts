import useSWR from "swr";
import { organizationFetcher } from "@/app/utils/api";
import type { Organization } from "@/app/utils/api";

const useOrganization = () => {
  const { data: organization, error, isLoading, mutate } = useSWR<Organization>(
    "/api/organizations",
    organizationFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    organization,
    loadingOrganization: isLoading,
    error,
    mutate,
  };
};

export default useOrganization;

