import { beforeEach, describe, expect, it, vi } from "vitest";
import { Storage } from "@apps-in-toss/web-framework";
import { v4 as uuidv4 } from "uuid";

// SDK 경계에서 모킹: Storage named export 객체 통째로 mock
vi.mock("@apps-in-toss/web-framework", () => ({
  Storage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}));

// uuid 모킹: 결정적 값으로 생성된 UUID 검증 가능하게
vi.mock("uuid", () => ({
  v4: vi.fn(() => "mocked-uuid-1234-5678-90ab-cdef01234567"),
}));

describe("getOrCreateUserId", () => {
  beforeEach(() => {
    // 모듈 메모리 캐시 격리: 모듈 그래프 리셋 → 각 테스트가 새로운 cachedUserId로 시작
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("first call generates a new uuidv4 and persists it to Storage", async () => {
    vi.mocked(Storage.getItem).mockResolvedValueOnce(null);
    vi.mocked(Storage.setItem).mockResolvedValueOnce(undefined);

    const { getOrCreateUserId } = await import("./identity");
    const result = await getOrCreateUserId();

    expect(Storage.getItem).toHaveBeenCalledTimes(1);
    expect(Storage.getItem).toHaveBeenCalledWith("julook:user-id");
    expect(uuidv4).toHaveBeenCalledTimes(1);
    expect(Storage.setItem).toHaveBeenCalledTimes(1);
    expect(Storage.setItem).toHaveBeenCalledWith(
      "julook:user-id",
      "mocked-uuid-1234-5678-90ab-cdef01234567",
    );
    expect(result).toBe("mocked-uuid-1234-5678-90ab-cdef01234567");
  });

  it("second call returns the same id from memory cache without touching Storage", async () => {
    vi.mocked(Storage.getItem).mockResolvedValueOnce(null);
    vi.mocked(Storage.setItem).mockResolvedValueOnce(undefined);

    const { getOrCreateUserId } = await import("./identity");
    const first = await getOrCreateUserId();
    const second = await getOrCreateUserId();

    // 두 번째 호출은 메모리 캐시에서 반환 → Storage.getItem 호출 횟수 증가 X
    expect(Storage.getItem).toHaveBeenCalledTimes(1);
    expect(Storage.setItem).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
    expect(second).toBe("mocked-uuid-1234-5678-90ab-cdef01234567");
  });

  it("when Storage already has a value, returns that value (not a new uuid)", async () => {
    vi.mocked(Storage.getItem).mockResolvedValueOnce(
      "existing-uuid-from-prev-session",
    );

    const { getOrCreateUserId } = await import("./identity");
    const result = await getOrCreateUserId();

    expect(Storage.getItem).toHaveBeenCalledTimes(1);
    expect(Storage.getItem).toHaveBeenCalledWith("julook:user-id");
    // 기존 값이 있으니 새 uuid 생성/저장 없음
    expect(uuidv4).not.toHaveBeenCalled();
    expect(Storage.setItem).not.toHaveBeenCalled();
    expect(result).toBe("existing-uuid-from-prev-session");
  });

  it("when Storage SDK throws, the error propagates", async () => {
    vi.mocked(Storage.getItem).mockRejectedValueOnce(
      new Error("native bridge error"),
    );

    const { getOrCreateUserId } = await import("./identity");

    await expect(getOrCreateUserId()).rejects.toThrow("native bridge error");
    // 에러 시 캐시 미갱신, setItem 미호출
    expect(Storage.setItem).not.toHaveBeenCalled();
  });
});
