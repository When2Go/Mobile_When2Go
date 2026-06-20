import type { Period } from '@/constants/setup';

export interface ParsedAppointmentTime {
  date: Date;
  period: Period;
  hour: number;   // 1–12 (12h 표기)
  minute: number; // 0–59
}

/**
 * 음성 인식 API가 반환하는 `appointmentTime` ("YYYY-MM-DD HH:mm", 공백 구분 24h)을
 * setup 화면의 날짜·오전오후·시·분으로 변환한다.
 *
 * 예: "2026-05-07 14:00" → { date: Date(2026-05-07), period: '오후', hour: 2, minute: 0 }
 */
export function parseAppointmentTime(timeStr: string): ParsedAppointmentTime {
  const [datePart, timePart] = timeStr.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [h, m] = timePart.split(':').map(Number);

  const date = new Date(year, month - 1, day);
  const period: Period = h < 12 ? '오전' : '오후';
  const hour = h % 12 || 12; // 0 → 12, 12 → 12, 13 → 1, …

  return { date, period, hour, minute: m };
}
