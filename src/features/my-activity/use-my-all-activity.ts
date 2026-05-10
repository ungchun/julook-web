import { useEffect, useState } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getOrCreateUserId } from "@/shared/lib/identity";
import { fetchMyAllActivity, type MyActivityItem } from "./api";

function useUserId(): string | undefined {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    getOrCreateUserId().then((id) => {
      if (alive) setUserId(id);
    });
    return () => {
      alive = false;
    };
  }, []);
  return userId;
}

export function useMyAllActivity(): UseQueryResult<MyActivityItem[], Error> {
  const userId = useUserId();
  return useQuery({
    queryKey: ["my-activity", "all", userId] as const,
    queryFn: () => fetchMyAllActivity(userId!),
    enabled: !!userId,
  });
}
