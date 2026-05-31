import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SortSelector } from "./SortSelector";

describe("SortSelector", () => {
  it("3개 옵션을 렌더하고 현재 value를 표시한다", () => {
    render(<SortSelector value="recommended" onChange={() => {}} />);

    const select = screen.getByLabelText("정렬 선택") as HTMLSelectElement;
    expect(select.value).toBe("recommended");

    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toEqual(["recommended", "highAlcohol", "lowAlcohol"]);
  });

  it("옵션 라벨이 한국어 표시명", () => {
    render(<SortSelector value="recommended" onChange={() => {}} />);

    const select = screen.getByLabelText("정렬 선택") as HTMLSelectElement;
    const labels = Array.from(select.options).map((o) => o.textContent);
    expect(labels).toEqual(["추천순", "높은 도수순", "낮은 도수순"]);
  });

  it("옵션 변경 시 onChange(newValue) 호출", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SortSelector value="recommended" onChange={onChange} />);

    await user.selectOptions(screen.getByLabelText("정렬 선택"), "highAlcohol");

    expect(onChange).toHaveBeenCalledWith("highAlcohol");
  });
});
