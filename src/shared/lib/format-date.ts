// iOS L10n.Common.Format.dateYMD = "yyyy년 M월 d일" 미러.
// ISO 8601 문자열을 한국어 연·월·일 표기로 변환한다.
export function formatDateYMD(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}
