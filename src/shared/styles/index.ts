/*
 * 디자인 토큰의 TypeScript 미러.
 * tokens.css의 CSS Variables를 JS에서 타입 안전하게 참조해야 할 때 사용.
 * (대부분의 경우 .module.css에서 var(--token)으로 직접 참조)
 */

export const colors = {
  primary: "#ffc805",
  primary2: "#6868ff",
  w: "#ffffff",
  w85: "rgba(229, 229, 255, 0.85)",
  w50: "rgba(229, 229, 255, 0.5)",
  w25: "rgba(229, 229, 255, 0.25)",
  w10: "rgba(229, 229, 255, 0.1)",
  darkBase: "#151a1a",
  darkGray: "#202028",
  darkWindow: "rgba(21, 21, 26, 0.75)",
  goldenYellow: "#dfa100",
  ivory: "#ffe5a5",
  lilac: "#7676d3",
  warmRed: "#b14862",
  alert: "#ff1f70",
} as const;

export const fontSizes = {
  10: "10px",
  12: "12px",
  14: "14px",
  15: "15px",
  16: "16px",
  17: "17px",
  20: "20px",
  24: "24px",
  28: "28px",
} as const;

export const fontWeights = {
  regular: 400,
  bold: 700,
} as const;

export const spacing = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
} as const;

export const radius = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  pill: "9999px",
} as const;
