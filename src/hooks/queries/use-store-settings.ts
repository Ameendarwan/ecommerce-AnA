import { storeSettingsService } from "@/services/settings/storeSettingsService";
import { StoreSettingsType } from "@/types";
import { UNABLE_TO_REACH_DATABASE } from "@/utils/errorHandling";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export const storeSettingsKeys = {
  all: ["store-settings"] as const,
  detail: () => [...storeSettingsKeys.all, "detail"] as const,
};

export function useStoreSettings(
  options?: Omit<
    UseQueryOptions<StoreSettingsType>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: storeSettingsKeys.detail(),
    queryFn: storeSettingsService.getSettings,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      if (
        error instanceof Error &&
        (error.message.includes(UNABLE_TO_REACH_DATABASE) ||
          error.message.includes("404") ||
          error.message.includes("permission") ||
          error.message.includes("do not have permission"))
      ) {
        return false;
      }
      return failureCount < 2;
    },
    throwOnError: false,
    ...options,
  });
}
