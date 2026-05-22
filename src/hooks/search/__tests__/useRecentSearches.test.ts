jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => {}),
    removeItem: jest.fn(async () => {}),
  },
}));

// eslint-disable-next-line import/first -- jest.mock must execute before the SUT import
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { STORAGE_KEYS } from '@/constants/storageKeys';
import type { Place } from '@/api/kakao/types';

// eslint-disable-next-line import/first -- jest.mock must execute before the SUT import
import { useRecentSearches } from '../useRecentSearches';

const mockGetItem = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
const mockSetItem = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;
const mockRemoveItem = AsyncStorage.removeItem as jest.MockedFunction<typeof AsyncStorage.removeItem>;

const makePlace = (id: string): Place => ({
  id,
  name: `장소${id}`,
  address: `서울시 ${id}구`,
  lat: 37.5 + Number(id) * 0.001,
  lng: 127.0 + Number(id) * 0.001,
});

describe('useRecentSearches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
  });

  // ─── 정상 ────────────────────────────────────────────────────────────────

  describe('정상', () => {
    it('addRecentPlace 호출 시 recentPlaces에 추가된다', async () => {
      const { result } = renderHook(() => useRecentSearches());

      const place = makePlace('1');

      await act(async () => {
        result.current.addRecentPlace(place);
      });

      expect(result.current.recentPlaces).toHaveLength(1);
      expect(result.current.recentPlaces[0]).toEqual(place);
    });

    it('AsyncStorage에 저장된 데이터가 있으면 초기 로드 시 recentPlaces에 반영된다', async () => {
      const stored = [makePlace('1'), makePlace('2')];
      mockGetItem.mockResolvedValue(JSON.stringify(stored));

      const { result } = renderHook(() => useRecentSearches());

      await waitFor(() => {
        expect(result.current.recentPlaces).toHaveLength(2);
      });

      expect(mockGetItem).toHaveBeenCalledWith(STORAGE_KEYS.RECENT_SEARCHES);
      expect(result.current.recentPlaces).toEqual(stored);
    });
  });

  // ─── 경계 ────────────────────────────────────────────────────────────────

  describe('경계', () => {
    it('addRecentPlace를 11번 호출하면 최대 10개만 유지된다 (처음 것이 제거됨)', async () => {
      const { result } = renderHook(() => useRecentSearches());

      // 1~10번 장소 순서대로 추가
      for (let i = 1; i <= 10; i++) {
        await act(async () => {
          result.current.addRecentPlace(makePlace(String(i)));
        });
      }

      expect(result.current.recentPlaces).toHaveLength(10);

      // 11번째 추가 → 가장 오래된 것(id='1')이 제거되어야 함
      const newPlace = makePlace('11');
      await act(async () => {
        result.current.addRecentPlace(newPlace);
      });

      expect(result.current.recentPlaces).toHaveLength(10);
      expect(result.current.recentPlaces[0]).toEqual(newPlace);
      expect(result.current.recentPlaces.find((p) => p.id === '1')).toBeUndefined();
    });
  });

  // ─── 분기 ────────────────────────────────────────────────────────────────

  describe('분기', () => {
    it('같은 id의 장소를 다시 추가하면 맨 앞으로 이동하고 중복이 제거된다', async () => {
      const { result } = renderHook(() => useRecentSearches());

      const placeA = makePlace('1');
      const placeB = makePlace('2');

      await act(async () => {
        result.current.addRecentPlace(placeA);
        result.current.addRecentPlace(placeB);
      });

      // 현재 순서: [B, A]
      expect(result.current.recentPlaces[0].id).toBe('2');

      // A를 다시 추가 → [A, B]
      await act(async () => {
        result.current.addRecentPlace(placeA);
      });

      expect(result.current.recentPlaces).toHaveLength(2);
      expect(result.current.recentPlaces[0].id).toBe('1');
      expect(result.current.recentPlaces[1].id).toBe('2');
    });

    it('removeRecentPlace(id) 호출 시 해당 id의 장소가 제거된다', async () => {
      const { result } = renderHook(() => useRecentSearches());

      const placeA = makePlace('1');
      const placeB = makePlace('2');

      await act(async () => {
        result.current.addRecentPlace(placeA);
        result.current.addRecentPlace(placeB);
      });

      await act(async () => {
        result.current.removeRecentPlace('1');
      });

      expect(result.current.recentPlaces).toHaveLength(1);
      expect(result.current.recentPlaces[0].id).toBe('2');
    });

    it('clearAll() 호출 시 recentPlaces가 빈 배열로 초기화된다', async () => {
      const { result } = renderHook(() => useRecentSearches());

      await act(async () => {
        result.current.addRecentPlace(makePlace('1'));
        result.current.addRecentPlace(makePlace('2'));
      });

      expect(result.current.recentPlaces).toHaveLength(2);

      await act(async () => {
        result.current.clearAll();
      });

      expect(result.current.recentPlaces).toHaveLength(0);
      expect(mockRemoveItem).toHaveBeenCalledWith(STORAGE_KEYS.RECENT_SEARCHES);
    });
  });

  // ─── 에러 ────────────────────────────────────────────────────────────────

  describe('에러', () => {
    it('AsyncStorage 초기 로드 실패해도 앱 크래시 없이 빈 배열을 유지한다', async () => {
      mockGetItem.mockRejectedValue(new Error('storage unavailable'));

      const { result } = renderHook(() => useRecentSearches());

      // getItem이 reject되더라도 훅이 정상적으로 마운트되어야 함
      await waitFor(() => {
        expect(mockGetItem).toHaveBeenCalledWith(STORAGE_KEYS.RECENT_SEARCHES);
      });

      expect(result.current.recentPlaces).toEqual([]);
    });
  });
});
