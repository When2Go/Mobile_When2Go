import type { Period } from '@/constants/setup';

const KST_OFFSET_HOURS = 9;

/**
 * setup 화면의 오전/오후 + 12h 시각을 API 요청용 HH:mm(24h) 문자열로 변환한다.
 * 오전 12시 = 자정(00:mm), 오후 12시 = 정오(12:mm) 처리에 유의.
 */
export function toHHmm(period: Period, hour: number, minute: number): string {
  let h = hour;
  if (period === '오전' && hour === 12) h = 0;
  else if (period === '오후' && hour !== 12) h = hour + 12;
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Google Maps API가 반환하는 ISO-8601 UTC 시각을 한국 시간(KST, UTC+9) 표시 문자열로 변환한다.
 * 예: "2026-05-22T04:13:11Z" → "오후 1:13"
 */
export function formatUTCToKoreanTime(isoUtc: string): string {
  const date = new Date(isoUtc);
  const kstHours = (date.getUTCHours() + KST_OFFSET_HOURS) % 24;
  const minutes = date.getUTCMinutes();
  const period = kstHours < 12 ? '오전' : '오후';
  const displayHour = kstHours % 12 || 12;
  return `${period} ${displayHour}:${String(minutes).padStart(2, '0')}`;
}
