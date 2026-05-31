import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MakgeolliImage } from "./MakgeolliImage";

vi.mock("@/shared/lib/makgeolli-image", () => ({
  getMakgeolliImageUrl: (name: string | null) =>
    name ? `https://supabase.test/${name}.png` : null,
}));

const FALLBACK_SRC = "/assets/placeholder/default_makgeolli.svg";

describe("MakgeolliImage", () => {
  it("imageName이 null이면 즉시 default fallback 자산을 렌더한다", () => {
    render(<MakgeolliImage imageName={null} alt="없음" />);
    const img = screen.getByAltText("없음") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe(FALLBACK_SRC);
  });

  it("정상 imageName이면 supabase 공개 URL을 src로 렌더한다", () => {
    render(<MakgeolliImage imageName="bongttle" alt="봇뜰" />);
    const img = screen.getByAltText("봇뜰") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("https://supabase.test/bongttle.png");
  });

  it("로드 실패 1회 — cache buster 붙여 재시도한다 (아직 fallback 아님)", () => {
    render(<MakgeolliImage imageName="bongttle" alt="봇뜰" />);
    const img = screen.getByAltText("봇뜰") as HTMLImageElement;

    fireEvent.error(img);

    expect(img.getAttribute("src")).toContain("https://supabase.test/bongttle.png");
    expect(img.getAttribute("src")).toContain("retry=1");
    expect(img.getAttribute("src")).not.toBe(FALLBACK_SRC);
  });

  it("로드 실패 2회째 — default fallback 자산으로 전환된다", () => {
    render(<MakgeolliImage imageName="bongttle" alt="봇뜰" />);
    const img = screen.getByAltText("봇뜰") as HTMLImageElement;

    fireEvent.error(img); // 1차: cache buster
    fireEvent.error(img); // 2차: fallback

    expect(img.getAttribute("src")).toBe(FALLBACK_SRC);
  });

  it("fallback 자산도 onError가 다시 트리거되더라도 무한 루프 없이 fallback 유지", () => {
    render(<MakgeolliImage imageName={null} alt="없음" />);
    const img = screen.getByAltText("없음") as HTMLImageElement;

    fireEvent.error(img);
    fireEvent.error(img);
    fireEvent.error(img);

    expect(img.getAttribute("src")).toBe(FALLBACK_SRC);
  });

  it("로딩 중에는 spinner(role=status, label=이미지 로딩 중) 가 함께 표시된다", () => {
    render(<MakgeolliImage imageName="bongttle" alt="봇뜰" />);
    expect(
      screen.getByRole("status", { name: "이미지 로딩 중" }),
    ).toBeInTheDocument();
  });

  it("img onLoad 발생 후 spinner 제거된다", () => {
    render(<MakgeolliImage imageName="bongttle" alt="봇뜰" />);
    const img = screen.getByAltText("봇뜰") as HTMLImageElement;

    fireEvent.load(img);

    expect(
      screen.queryByRole("status", { name: "이미지 로딩 중" }),
    ).not.toBeInTheDocument();
  });

  it("fallback (imageName=null) 일 때는 처음부터 spinner 없음", () => {
    render(<MakgeolliImage imageName={null} alt="없음" />);
    expect(
      screen.queryByRole("status", { name: "이미지 로딩 중" }),
    ).not.toBeInTheDocument();
  });
});
