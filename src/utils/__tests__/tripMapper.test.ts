import {
  mergeTripListsToSchedules,
  tripDetailToSchedule,
  tripListItemToSchedule,
  tripStatusToKorean,
} from '../tripMapper';
import type { TripDetail, TripListItem } from '@/api/trip/types';

const baseListItem: TripListItem = {
  tripId: 7,
  originName: '현재 위치',
  destName: '강남역',
  arrivalTime: '2026-06-17T09:00:00+09:00',
  finalDepartureTime: '2026-06-17T07:45:00+09:00',
  status: 'SCHEDULED',
};

describe('tripStatusToKorean', () => {
  it('SCHEDULED → "진행중" (출발 시각 확정·알림 스케줄링 중)', () => {
    expect(tripStatusToKorean('SCHEDULED')).toBe('진행중');
  });

  it('PENDING → "예정"', () => {
    expect(tripStatusToKorean('PENDING')).toBe('예정');
  });

  it('COMPLETED → "완료"', () => {
    expect(tripStatusToKorean('COMPLETED')).toBe('완료');
  });
});

describe('tripListItemToSchedule', () => {
  // 정상
  it('목록 항목을 ScheduleItem으로 매핑한다', () => {
    const result = tripListItemToSchedule(baseListItem);
    expect(result).toEqual({
      id: 7,
      title: '강남역',
      destination: '강남역',
      arrivalTime: '오전 9:00',
      departureTime: '오전 7:45',
      status: '진행중',
      route: '현재 위치 → 강남역',
      isActive: true,
      updatedAt: null,
      from: '현재 위치',
      to: '강남역',
      date: '2026-06-17',
    });
  });

  // 분기: PENDING → 예정, isActive false
  it('PENDING은 "예정"이고 isActive는 false', () => {
    const result = tripListItemToSchedule({ ...baseListItem, status: 'PENDING' });
    expect(result.status).toBe('예정');
    expect(result.isActive).toBe(false);
  });

  // 분기: finalDepartureTime null → "-"
  it('finalDepartureTime이 null이면 departureTime은 "-"', () => {
    const result = tripListItemToSchedule({ ...baseListItem, finalDepartureTime: null });
    expect(result.departureTime).toBe('-');
  });

  // 분기: 상태 매핑
  it('COMPLETED 상태는 "완료"로 매핑된다', () => {
    const result = tripListItemToSchedule({ ...baseListItem, status: 'COMPLETED' });
    expect(result.status).toBe('완료');
  });
});

describe('mergeTripListsToSchedules', () => {
  // 정상: 여러 상태 목록을 합쳐 도착 시각 오름차순 정렬
  it('상태별 목록을 합쳐 도착 시각 오름차순으로 정렬한다', () => {
    const scheduled: TripListItem[] = [
      { ...baseListItem, tripId: 1, arrivalTime: '2026-06-17T18:00:00+09:00' },
    ];
    const completed: TripListItem[] = [
      { ...baseListItem, tripId: 2, arrivalTime: '2026-06-17T07:00:00+09:00', status: 'COMPLETED' },
    ];
    const result = mergeTripListsToSchedules([scheduled, completed]);
    expect(result.map((s) => s.id)).toEqual([2, 1]);
    expect(result[0].status).toBe('완료');
  });

  // 경계: 빈 목록들
  it('모두 빈 목록이면 빈 배열', () => {
    expect(mergeTripListsToSchedules([[], []])).toEqual([]);
  });
});

describe('tripDetailToSchedule', () => {
  const detail: TripDetail = {
    tripId: 7,
    originName: '현재 위치',
    destName: '강남역',
    originLat: 37.45,
    originLng: 126.65,
    destLat: 37.49,
    destLng: 127.02,
    arrivalTime: '2026-06-17T09:00:00+09:00',
    bufferMinutes: 10,
    finalDepartureTime: '2026-06-17T07:45:00+09:00',
    status: 'SCHEDULED',
    updatedAt: '2026-06-17T07:12:00+09:00',
  };

  it('상세 응답을 ScheduleItem으로 매핑하고 updatedAt(HH:mm)을 채운다', () => {
    const result = tripDetailToSchedule(detail);
    expect(result.id).toBe(7);
    expect(result.arrivalTime).toBe('오전 9:00');
    expect(result.departureTime).toBe('오전 7:45');
    expect(result.updatedAt).toBe('07:12');
    expect(result.date).toBe('2026-06-17');
  });

  it('finalDepartureTime이 null이면 departureTime은 "-"', () => {
    const result = tripDetailToSchedule({ ...detail, finalDepartureTime: null });
    expect(result.departureTime).toBe('-');
  });
});
