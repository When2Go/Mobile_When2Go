jest.mock('@/api/axios', () => ({
  api: { get: jest.fn() },
}));

// eslint-disable-next-line import/first -- jest.mock must execute before the SUT import
import { api } from '@/api/axios';
// eslint-disable-next-line import/first -- jest.mock must execute before the SUT import
import { getReservations } from '../index';
import type { ReservationListItem } from '../types';

const mockGet = api.get as jest.Mock;

const ITEM: ReservationListItem = {
  reservationId: 1,
  nickname: '집',
  originName: '서울역',
  destName: '강남역',
  arrivalTime: '09:00',
  repeatDays: ['MON', 'TUE'],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getReservations', () => {
  test('정상 배열 응답 — 아이템 목록을 그대로 반환한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [ITEM] } });
    const result = await getReservations();
    expect(result).toEqual([ITEM]);
  });

  test('빈 배열 응답 — 빈 배열을 반환한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [] } });
    const result = await getReservations();
    expect(result).toEqual([]);
  });

  test('data.data가 null — 빈 배열을 반환한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: null } });
    const result = await getReservations();
    expect(result).toEqual([]);
  });

  test('data.data가 undefined — 빈 배열을 반환한다', async () => {
    mockGet.mockResolvedValueOnce({ data: {} });
    const result = await getReservations();
    expect(result).toEqual([]);
  });

  test('data.data가 빈 객체({}) — TypeError 없이 빈 배열을 반환한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: {} } });
    const result = await getReservations();
    expect(result).toEqual([]);
  });

  test('data.data가 페이지네이션 객체 — TypeError 없이 빈 배열을 반환한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: { content: [ITEM], totalElements: 1 } } });
    const result = await getReservations();
    expect(result).toEqual([]);
  });

  test('네트워크 에러 — 예외를 그대로 던진다', async () => {
    mockGet.mockRejectedValueOnce(new Error('network'));
    await expect(getReservations()).rejects.toThrow('network');
  });
});
