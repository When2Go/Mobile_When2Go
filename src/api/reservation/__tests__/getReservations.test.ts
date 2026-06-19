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
  id: 4,
  nickname: 'Roh',
  originName: '호구포역',
  destName: '인하대역',
  arrivalTime: '22:30:00',
  repeatDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY'],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getReservations', () => {
  test('정상 응답 — items 배열을 그대로 반환한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: { items: [ITEM] } } });
    const result = await getReservations();
    expect(result).toEqual([ITEM]);
  });

  test('items가 빈 배열 — 빈 배열을 반환한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: { items: [] } } });
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

  test('data.data.items가 없는 객체 — TypeError 없이 빈 배열을 반환한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: {} } });
    const result = await getReservations();
    expect(result).toEqual([]);
  });

  test('data.data.items가 배열이 아닌 값 — 빈 배열을 반환한다', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: { items: null } } });
    const result = await getReservations();
    expect(result).toEqual([]);
  });

  test('네트워크 에러 — 예외를 그대로 던진다', async () => {
    mockGet.mockRejectedValueOnce(new Error('network'));
    await expect(getReservations()).rejects.toThrow('network');
  });
});
