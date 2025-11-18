import useSWR from "swr";
import { organizationFetcher } from "@/app/utils/api";
import type { Organization } from "@/app/utils/api";
import { useOrgId } from "./useOrgId";

const useOrganization = (orgId?: string | null) => {
  const orgIdFromUrl = useOrgId();
  const targetOrgId = orgId ?? orgIdFromUrl;

  const { data: organization, error, isLoading, mutate } = useSWR<Organization>(
    targetOrgId ? `/api/organizations/${targetOrgId}` : null,
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

