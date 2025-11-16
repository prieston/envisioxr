import useSWR from "swr";
import { userFetcher } from "@/app/utils/api";
import type { User } from "@/app/utils/api";

const useUser = () => {
  const { data: user, error, isLoading, mutate } = useSWR<User>(
    "/api/user",
    userFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    user,
    loadingUser: isLoading,
    error,
    mutate,
  };
};

export default useUser;

