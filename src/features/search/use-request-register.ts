import { useMutation } from "@tanstack/react-query";
import { requestRegisterMakgeolli } from "@/shared/lib/makgeolli-requests";

type UseRequestRegisterResult = {
  request: (searchText: string) => Promise<void>;
  isPending: boolean;
  error: Error | null;
};

// 검색 결과 없을 때 "등록 요청하기" 클릭 → makgeolli_requests insert.
// 응답 본문 불필요 — 성공 여부만 Search 페이지가 dialog 표시에 사용.
export function useRequestRegister(): UseRequestRegisterResult {
  const mutation = useMutation<void, Error, string>({
    mutationFn: (searchText) => requestRegisterMakgeolli(searchText),
  });

  return {
    request: (searchText) => mutation.mutateAsync(searchText),
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
