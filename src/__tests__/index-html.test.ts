import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// CSS 로드 이전(첫 페인트 시점)에도 다크 배경이 적용되어야 webview rubber-band
// overscroll 영역의 흰 색이 노출되지 않는다. 따라서 index.html 의 정적 마크업에
// 다음 두 가지를 요구한다:
//   1. <body style="background-color: #15151a"> — webview 첫 페인트 배경
//   2. <meta name="theme-color" content="#15151a"> — Safari 상단 + 일부 webview
//
// 색 값은 tokens.css:21 의 --color-dark-base (#15151a) 와 1:1. 단일 진실은
// iOS DesignSystem (Colors.darkbase = #15151A) → Web tokens 미러 → index.html
// 리터럴. 리터럴이 토큰과 일치하면 의도가 보존된다.

function readIndexHtml(): string {
  const filePath = resolve(__dirname, "../../index.html");
  return readFileSync(filePath, "utf-8");
}

const DARK_BASE = "#15151a";

describe("index.html — webview rubber-band 다크 배경 보장", () => {
  it("body 에 inline background-color: #15151a 가 적용되어 있다 (CSS 로드 이전 first paint 다크 보장)", () => {
    const html = readIndexHtml();

    // <body ... style="... background-color: #15151a ..."> 매치.
    // 공백/따옴표/세미콜론 변형 허용, 대소문자 무시.
    const bodyStyleMatch = html.match(
      /<body[^>]*\bstyle\s*=\s*["'][^"']*background-color\s*:\s*#15151a[^"']*["'][^>]*>/i,
    );

    expect(bodyStyleMatch).not.toBeNull();
  });

  it("<meta name=\"theme-color\" content=\"#15151a\" /> 가 head 에 존재한다 (Safari/webview 상단 영역)", () => {
    const html = readIndexHtml();

    // <meta name="theme-color" content="#15151a"> — 속성 순서/따옴표 무시.
    const themeColorMatch = html.match(
      /<meta[^>]*\bname\s*=\s*["']theme-color["'][^>]*\bcontent\s*=\s*["']#15151a["'][^>]*\/?>/i,
    );
    const themeColorMatchReversed = html.match(
      /<meta[^>]*\bcontent\s*=\s*["']#15151a["'][^>]*\bname\s*=\s*["']theme-color["'][^>]*\/?>/i,
    );

    expect(themeColorMatch ?? themeColorMatchReversed).not.toBeNull();
  });

  it("리터럴 색 값이 tokens.css 의 --color-dark-base 와 1:1 일치한다 (단일 진실 보존)", () => {
    const tokensPath = resolve(__dirname, "../shared/styles/tokens.css");
    const tokens = readFileSync(tokensPath, "utf-8");

    // --color-dark-base: #15151a; 매치 (공백 변형 허용).
    const tokenMatch = tokens.match(
      /--color-dark-base\s*:\s*(#[0-9a-fA-F]{3,8})/,
    );

    expect(tokenMatch).not.toBeNull();
    expect(tokenMatch![1].toLowerCase()).toBe(DARK_BASE);
  });
});
