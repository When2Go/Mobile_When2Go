/**
 * Trip API 시각 변환 유틸.
 * - 화면(KST 로컬) ↔ 백엔드(ISO 8601) 사이 변환을 한곳에 모은다.
 * - 백엔드는 ISO 8601(오프셋 또는 Z 표기)로 시각을 주고받으며, 화면은 KST 기준 표시·필터.
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** ISO instant를 KST 벽시계(UTC 필드로 읽을 수 있는 Date)로 옮긴다. */
function toKstClock(iso: string): Date {
  return new Date(new Date(iso).getTime() + KST_OFFSET_MS);
}

/**
 * ISO 8601 시각을 KST 기준 한국어 표시("오전 9:00")로 변환한다.
 * 오프셋(+09:00)이든 Z든 같은 instant면 동일한 결과.
 */
export function isoToKoreanTime(iso: string): string {
  const kst = toKstClock(iso);
  const h = kst.getUTCHours();
  const m = kst.getUTCMinutes();
  const period = h < 12 ? '오전' : '오후';
  const displayHour = h % 12 || 12;
  return `${period} ${displayHour}:${pad2(m)}`;
}

/** ISO 8601 시각을 KST 기준 "HH:mm"으로 변환한다. */
export function isoToHHmmKST(iso: string): string {
  const kst = toKstClock(iso);
  return `${pad2(kst.getUTCHours())}:${pad2(kst.getUTCMinutes())}`;
}

/** ISO 8601 시각의 KST 기준 날짜 키("YYYY-MM-DD")를 반환한다. */
export function isoToDateKey(iso: string): string {
  const kst = toKstClock(iso);
  return `${kst.getUTCFullYear()}-${pad2(kst.getUTCMonth() + 1)}-${pad2(kst.getUTCDate())}`;
}

/** 로컬 Date를 GET 쿼리용 날짜 문자열("YYYY-MM-DD")로 변환한다. */
export function dateToParam(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}
