import { useEffect, useState } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getOrCreateUserId } from "@/shared/lib/identity";
import { fetchMyComments, type MyCommentItem } from "./api";

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

export function useMyCommentActivity(): UseQueryResult<MyCommentItem[], Error> {
  const userId = useUserId();
  return useQuery({
    queryKey: ["my-activity", "comment", userId] as const,
    queryFn: () => fetchMyComments(userId!),
    enabled: !!userId,
  });
}
