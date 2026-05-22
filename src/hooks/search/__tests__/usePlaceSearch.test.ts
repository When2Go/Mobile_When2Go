import { act, renderHook } from '@testing-library/react-native';

import { usePlaceSearch } from '../usePlaceSearch';

jest.mock('@/api/kakao/search');

import { searchPlaces } from '@/api/kakao/search';

const mockSearchPlaces = searchPlaces as jest.MockedFunction<typeof searchPlaces>;

const MOCK_PLACES = [
  { id: '1', name: '강남역', address: '서울 강남구', lat: 37.498, lng: 127.028 },
  { id: '2', name: '강남구청', address: '서울 강남구 학동로', lat: 37.517, lng: 127.047 },
];

describe('usePlaceSearch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockSearchPlaces.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('정상: query가 있으면 300ms 후 searchPlaces 호출 → places 반환', () => {
    it('300ms 전에는 API를 호출하지 않는다', () => {
      mockSearchPlaces.mockResolvedValue(MOCK_PLACES);

      renderHook(() => usePlaceSearch('강남'));

      expect(mockSearchPlaces).not.toHaveBeenCalled();
    });

    it('300ms 후 searchPlaces를 호출하고 places를 반환한다', async () => {
      mockSearchPlaces.mockResolvedValue(MOCK_PLACES);

      const { result } = renderHook(() => usePlaceSearch('강남'));

      await act(async () => {
        jest.advanceTimersByTime(300);
        await Promise.resolve();
      });

      expect(mockSearchPlaces).toHaveBeenCalledWith('강남');
      expect(result.current.places).toEqual(MOCK_PLACES);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('경계: 빈 쿼리는 API 호출 안 하고 places = []', () => {
    it.each([[''], ['  ']])('query="%s" 이면 searchPlaces를 호출하지 않는다', async (emptyQuery) => {
      const { result } = renderHook(() => usePlaceSearch(emptyQuery));

      await act(async () => {
        jest.advanceTimersByTime(300);
        await Promise.resolve();
      });

      expect(mockSearchPlaces).not.toHaveBeenCalled();
      expect(result.current.places).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('분기: query 변경 시 이전 타이머 취소 (연속 입력 → 마지막 것만 호출)', () => {
    it('query가 빠르게 변경되면 마지막 query로만 호출된다', async () => {
      mockSearchPlaces.mockResolvedValue(MOCK_PLACES);

      const { rerender } = renderHook(({ q }: { q: string }) => usePlaceSearch(q), {
        initialProps: { q: '강' },
      });

      jest.advanceTimersByTime(100);

      rerender({ q: '강남' });

      jest.advanceTimersByTime(100);

      rerender({ q: '강남역' });

      await act(async () => {
        jest.advanceTimersByTime(300);
        await Promise.resolve();
      });

      expect(mockSearchPlaces).toHaveBeenCalledTimes(1);
      expect(mockSearchPlaces).toHaveBeenCalledWith('강남역');
    });
  });

  describe('에러: searchPlaces reject 시 error 세팅, places = []', () => {
    it('searchPlaces가 reject되면 error 메시지를 세팅하고 places를 비운다', async () => {
      mockSearchPlaces.mockRejectedValue(new Error('network error'));

      const { result } = renderHook(() => usePlaceSearch('강남'));

      await act(async () => {
        jest.advanceTimersByTime(300);
        await Promise.resolve();
      });

      expect(result.current.error).toBe('검색 중 오류가 발생했습니다.');
      expect(result.current.places).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
