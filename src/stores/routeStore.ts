import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { STORAGE_KEYS } from '@/constants/storageKeys';
import type { RouteFormData, RouteItem } from '@/types/routes.types';

const ID_PREFIX = 'route-';

interface PersistedState {
  routes: RouteItem[];
  _seq: number;
}

interface RouteState extends PersistedState {
  /** 최초 1회 AsyncStorage 로드 여부 가드. */
  _isHydrated: boolean;
  hydrate: () => void;
  addRoute: (form: RouteFormData) => void;
  updateRoute: (id: string, form: RouteFormData) => void;
  removeRoute: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

function saveToStorage({ routes, _seq }: PersistedState) {
  AsyncStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify({ routes, _seq })).catch((e) => {
    if (__DEV__) console.warn('[routeStore] persist error', e);
  });
}

export const useRouteStore = create<RouteState>((set, get) => ({
  routes: [],
  _seq: 0,
  _isHydrated: false,

  hydrate: () => {
    if (get()._isHydrated) return;
    set({ _isHydrated: true });
    AsyncStorage.getItem(STORAGE_KEYS.ROUTES)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        set({
          routes: Array.isArray(parsed.routes) ? parsed.routes : [],
          _seq: typeof parsed._seq === 'number' ? parsed._seq : 0,
        });
      })
      .catch((e) => {
        if (__DEV__) console.warn('[routeStore] hydration error', e);
      });
  },

  addRoute: (form) =>
    set((s) => {
      const _seq = s._seq + 1;
      const newRoute: RouteItem = { ...form, id: `${ID_PREFIX}${_seq}` };
      const routes = [...s.routes, newRoute];
      saveToStorage({ routes, _seq });
      return { routes, _seq };
    }),

  updateRoute: (id, form) =>
    set((s) => {
      // 폼에 없는 필드(isFavorite 등)는 기존 값을 보존한다.
      const routes = s.routes.map((r) => (r.id === id ? { ...r, ...form, id } : r));
      saveToStorage({ routes, _seq: s._seq });
      return { routes };
    }),

  removeRoute: (id) =>
    set((s) => {
      const routes = s.routes.filter((r) => r.id !== id);
      saveToStorage({ routes, _seq: s._seq });
      return { routes };
    }),

  toggleFavorite: (id) =>
    set((s) => {
      const routes = s.routes.map((r) =>
        r.id === id ? { ...r, isFavorite: !r.isFavorite } : r,
      );
      saveToStorage({ routes, _seq: s._seq });
      return { routes };
    }),
}));
