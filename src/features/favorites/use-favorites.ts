import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loadFavorites, saveFavorites } from "@/shared/lib/favorites-storage";

const FAVORITES_KEY = ["favorites"] as const;

type UseFavoritesResult = {
  favorites: ReadonlyArray<string>;
  isFavorite: (makgeolliId: string) => boolean;
  toggle: (makgeolliId: string) => Promise<void>;
};

// 찜 상태 hook — iOS myMakgeolliClient.isFavorite + toggle 미러.
// Apps in Toss Storage 가 단일 진실, React Query 캐시로 컴포넌트 reactivity 확보.
export function useFavorites(): UseFavoritesResult {
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: FAVORITES_KEY,
    queryFn: loadFavorites,
  });

  const favoriteSet = useMemo(() => new Set(data), [data]);

  const mutation = useMutation({
    mutationFn: async (makgeolliId: string) => {
      const current = queryClient.getQueryData<string[]>(FAVORITES_KEY) ?? [];
      const next = current.includes(makgeolliId)
        ? current.filter((id) => id !== makgeolliId)
        : [...current, makgeolliId];
      await saveFavorites(next);
      return next;
    },
    onSuccess: (next) => {
      queryClient.setQueryData<string[]>(FAVORITES_KEY, next);
    },
  });

  return {
    favorites: data,
    isFavorite: (id) => favoriteSet.has(id),
    toggle: (id) => mutation.mutateAsync(id).then(() => undefined),
  };
}
