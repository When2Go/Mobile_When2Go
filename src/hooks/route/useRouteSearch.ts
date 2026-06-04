import { useEffect, useState } from 'react';

import { searchRoutes } from '@/api/route';
import type { RouteSearchRequest } from '@/api/route/types';
import type { RouteDisplayItem } from '@/constants/result';
import type { ApiFailure } from '@/types/api.types';
import { normalizeRoute } from '@/utils/routeNormalize';

interface RouteSearchState {
  routes: RouteDisplayItem[];
  isLoading: boolean;
  error: ApiFailure | null;
}

const INITIAL_STATE: RouteSearchState = {
  routes: [],
  isLoading: false,
  error: null,
};

export function useRouteSearch(req: RouteSearchRequest | null): RouteSearchState {
  const [state, setState] = useState<RouteSearchState>(INITIAL_STATE);

  useEffect(() => {
    if (!req) return;

    let cancelled = false;
    setState({ routes: [], isLoading: true, error: null });

    searchRoutes(req)
      .then((candidates) => {
        if (cancelled) return;
        setState({
          routes: candidates.map((c, i) => normalizeRoute(c, i)),
          isLoading: false,
          error: null,
        });
      })
      .catch((err: ApiFailure) => {
        if (cancelled) return;
        setState({ routes: [], isLoading: false, error: err });
      });

    return () => {
      cancelled = true;
    };
  }, [req]);

  return state;
}
