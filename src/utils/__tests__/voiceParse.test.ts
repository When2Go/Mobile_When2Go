import { parseAppointmentTime } from '../voiceParse';

describe('parseAppointmentTime', () => {
  describe('정상: 오후 시간 파싱', () => {
    it('"2026-05-07 14:00" → period=오후, hour=2, minute=0', () => {
      const result = parseAppointmentTime('2026-05-07 14:00');
      expect(result.period).toBe('오후');
      expect(result.hour).toBe(2);
      expect(result.minute).toBe(0);
    });

    it('"2026-06-25 18:30" → period=오후, hour=6, minute=30', () => {
      const result = parseAppointmentTime('2026-06-25 18:30');
      expect(result.period).toBe('오후');
      expect(result.hour).toBe(6);
      expect(result.minute).toBe(30);
    });
  });

  describe('정상: 오전 시간 파싱', () => {
    it('"2026-06-25 09:30" → period=오전, hour=9, minute=30', () => {
      const result = parseAppointmentTime('2026-06-25 09:30');
      expect(result.period).toBe('오전');
      expect(result.hour).toBe(9);
      expect(result.minute).toBe(30);
    });

    it('"2026-01-01 06:05" → period=오전, hour=6, minute=5', () => {
      const result = parseAppointmentTime('2026-01-01 06:05');
      expect(result.period).toBe('오전');
      expect(result.hour).toBe(6);
      expect(result.minute).toBe(5);
    });
  });

  describe('경계: 정오(12:00)와 자정(00:00)', () => {
    it('"2026-01-01 12:00" (정오) → period=오후, hour=12', () => {
      const result = parseAppointmentTime('2026-01-01 12:00');
      expect(result.period).toBe('오후');
      expect(result.hour).toBe(12);
      expect(result.minute).toBe(0);
    });

    it('"2026-01-01 00:00" (자정) → period=오전, hour=12', () => {
      const result = parseAppointmentTime('2026-01-01 00:00');
      expect(result.period).toBe('오전');
      expect(result.hour).toBe(12);
      expect(result.minute).toBe(0);
    });

    it('"2026-01-01 23:59" → period=오후, hour=11, minute=59', () => {
      const result = parseAppointmentTime('2026-01-01 23:59');
      expect(result.period).toBe('오후');
      expect(result.hour).toBe(11);
      expect(result.minute).toBe(59);
    });
  });

  describe('정상: date 반환값 (year·month·day)', () => {
    it('"2026-05-07 14:00" → date가 2026-05-07인 Date 반환', () => {
      const { date } = parseAppointmentTime('2026-05-07 14:00');
      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(4); // 0-indexed
      expect(date.getDate()).toBe(7);
    });

    it('"2026-12-31 09:00" → date가 2026-12-31인 Date 반환', () => {
      const { date } = parseAppointmentTime('2026-12-31 09:00');
      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(11);
      expect(date.getDate()).toBe(31);
    });
  });
});
