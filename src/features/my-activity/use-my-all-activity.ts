import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useUserId } from "@/shared/lib/use-user-id";
import { fetchMyAllActivity, type MyActivityItem } from "./api";

export function useMyAllActivity(): UseQueryResult<MyActivityItem[], Error> {
  const userId = useUserId();
  return useQuery({
    queryKey: ["my-activity", "all", userId] as const,
    queryFn: () => fetchMyAllActivity(userId!),
    enabled: !!userId,
  });
}
