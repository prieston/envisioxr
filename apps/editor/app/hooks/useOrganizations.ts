import useSWR from "swr";
import { organizationsFetcher } from "@/app/utils/api";
import type { Organization } from "@/app/utils/api";

const useOrganizations = () => {
  const { data: organizations, error, isLoading, mutate } = useSWR<Organization[]>(
    "/api/organizations/list",
    organizationsFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    organizations: organizations || [],
    loadingOrganizations: isLoading,
    error,
    mutate,
  };
};

export default useOrganizations;

