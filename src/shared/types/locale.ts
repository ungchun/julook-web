// iOS SupportedLocale 미러. 미니앱은 토스 사용자 언어를 따라간다.

export type SupportedLocale = "ko" | "en";

export const fromLanguageCode = (code: string | null | undefined): SupportedLocale =>
  code?.toLowerCase().startsWith("ko") ? "ko" : "en";
