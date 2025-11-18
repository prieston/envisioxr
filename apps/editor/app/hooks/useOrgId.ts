import { usePathname, useParams } from "next/navigation";
import { useMemo } from "react";

/**
 * Hook to get the current organization ID from the URL
 * Works for both /org/[orgId]/... routes and extracts orgId from pathname
 */
export const useOrgId = (): string | null => {
  const pathname = usePathname();
  const params = useParams();

  return useMemo(() => {
    // Try to get from params first (for dynamic routes)
    if (params?.orgId && typeof params.orgId === "string") {
      return params.orgId;
    }

    // Fallback to extracting from pathname
    const match = pathname?.match(/^\/org\/([^/]+)/);
    return match ? match[1] : null;
  }, [pathname, params]);
};

