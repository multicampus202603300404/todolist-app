/**
 * ISO 날짜 문자열에서 YYYY-MM-DD 부분만 추출
 * "2026-03-31T15:00:00.000Z" → "2026-03-31"
 * "2026-03-31" → "2026-03-31"
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  return dateStr.slice(0, 10);
}
