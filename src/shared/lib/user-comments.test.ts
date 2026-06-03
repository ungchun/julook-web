import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchMyComment,
  upsertMyComment,
  deleteMyComment,
} from "./user-comments";

// supabase 단일 지점 모킹 — iOS SupabaseClientLive+Comment.swift:24-76 미러.
// chain shape: from("user_comments").select("*").eq(user_id).eq(makgeolli_id).maybeSingle()
//              from("user_comments").upsert(payload, { onConflict }).
//              from("user_comments").delete().eq(user_id).eq(makgeolli_id)
const maybeSingleMock = vi.fn();
const eqMakgeolliIdSelectMock = vi.fn();
const eqUserIdSelectMock = vi.fn();
const selectMock = vi.fn();
const upsertMock = vi.fn();
const eqMakgeolliIdDeleteMock = vi.fn();
const eqUserIdDeleteMock = vi.fn();
const deleteMock = vi.fn();
const fromMock = vi.fn();

vi.mock("@/shared/lib/supabase", () => ({
  supabase: {
    from: (table: string) => fromMock(table),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();

  // select chain
  selectMock.mockReturnValue({ eq: eqUserIdSelectMock });
  eqUserIdSelectMock.mockReturnValue({ eq: eqMakgeolliIdSelectMock });
  eqMakgeolliIdSelectMock.mockReturnValue({ maybeSingle: maybeSingleMock });

  // delete chain
  deleteMock.mockReturnValue({ eq: eqUserIdDeleteMock });
  eqUserIdDeleteMock.mockReturnValue({ eq: eqMakgeolliIdDeleteMock });

  // from dispatches per-call shape via implementations in each test
  fromMock.mockReturnValue({
    select: selectMock,
    upsert: upsertMock,
    delete: deleteMock,
  });
});

const USER_ID = "user-fixture-id";
const MAKGEOLLI_ID = "makgeolli-fixture-id";

describe("fetchMyComment", () => {
  it("queries user_comments with user_id + makgeolli_id and returns single row", async () => {
    const row = {
      id: "c1",
      user_id: USER_ID,
      makgeolli_id: MAKGEOLLI_ID,
      comment: "맛있어요",
      is_public: true,
      created_at: "2025-04-01T00:00:00Z",
      updated_at: "2025-04-01T00:00:00Z",
    };
    maybeSingleMock.mockResolvedValue({ data: row, error: null });

    const result = await fetchMyComment(USER_ID, MAKGEOLLI_ID);

    expect(fromMock).toHaveBeenCalledWith("user_comments");
    expect(selectMock).toHaveBeenCalledWith("*");
    expect(eqUserIdSelectMock).toHaveBeenCalledWith("user_id", USER_ID);
    expect(eqMakgeolliIdSelectMock).toHaveBeenCalledWith(
      "makgeolli_id",
      MAKGEOLLI_ID,
    );
    expect(result).toEqual(row);
  });

  it("returns null when row does not exist", async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: null });

    const result = await fetchMyComment(USER_ID, MAKGEOLLI_ID);

    expect(result).toBeNull();
  });

  it("throws when supabase returns an error", async () => {
    maybeSingleMock.mockResolvedValue({
      data: null,
      error: new Error("supabase failure"),
    });

    await expect(fetchMyComment(USER_ID, MAKGEOLLI_ID)).rejects.toThrow(
      "supabase failure",
    );
  });
});

describe("upsertMyComment", () => {
  it("calls upsert with onConflict 'user_id,makgeolli_id' and ISO updated_at", async () => {
    upsertMock.mockResolvedValue({ data: null, error: null });

    await upsertMyComment({
      userId: USER_ID,
      makgeolliId: MAKGEOLLI_ID,
      comment: "테스트 코멘트",
      isPublic: true,
    });

    expect(fromMock).toHaveBeenCalledWith("user_comments");
    expect(upsertMock).toHaveBeenCalledTimes(1);

    const [payload, options] = upsertMock.mock.calls[0];
    expect(payload).toMatchObject({
      user_id: USER_ID,
      makgeolli_id: MAKGEOLLI_ID,
      comment: "테스트 코멘트",
      is_public: true,
    });
    // updated_at 은 클라이언트에서 ISO 문자열로 명시 (iOS 동일).
    expect(typeof payload.updated_at).toBe("string");
    expect(() => new Date(payload.updated_at).toISOString()).not.toThrow();
    expect(options).toEqual({ onConflict: "user_id,makgeolli_id" });
  });

  it("persists is_public=false when caller passes isPublic=false", async () => {
    upsertMock.mockResolvedValue({ data: null, error: null });

    await upsertMyComment({
      userId: USER_ID,
      makgeolliId: MAKGEOLLI_ID,
      comment: "비공개 코멘트",
      isPublic: false,
    });

    const [payload] = upsertMock.mock.calls[0];
    expect(payload.is_public).toBe(false);
  });

  it("throws when supabase upsert returns an error", async () => {
    upsertMock.mockResolvedValue({
      data: null,
      error: new Error("conflict failure"),
    });

    await expect(
      upsertMyComment({
        userId: USER_ID,
        makgeolliId: MAKGEOLLI_ID,
        comment: "x",
        isPublic: true,
      }),
    ).rejects.toThrow("conflict failure");
  });
});

describe("deleteMyComment", () => {
  it("calls delete().eq(user_id).eq(makgeolli_id) on user_comments", async () => {
    eqMakgeolliIdDeleteMock.mockResolvedValue({ data: null, error: null });

    await deleteMyComment(USER_ID, MAKGEOLLI_ID);

    expect(fromMock).toHaveBeenCalledWith("user_comments");
    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(eqUserIdDeleteMock).toHaveBeenCalledWith("user_id", USER_ID);
    expect(eqMakgeolliIdDeleteMock).toHaveBeenCalledWith(
      "makgeolli_id",
      MAKGEOLLI_ID,
    );
  });

  it("throws when supabase delete returns an error", async () => {
    eqMakgeolliIdDeleteMock.mockResolvedValue({
      data: null,
      error: new Error("delete failure"),
    });

    await expect(deleteMyComment(USER_ID, MAKGEOLLI_ID)).rejects.toThrow(
      "delete failure",
    );
  });
});
