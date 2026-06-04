import { api } from '@/api/axios';
import type { ApiFailure } from '@/types/api.types';
import type { RouteCandidate, RouteSearchEnvelope, RouteSearchRequest } from './types';

const ROUTE_SEARCH_URL = '/api/routes/search';

export async function searchRoutes(req: RouteSearchRequest): Promise<RouteCandidate[]> {
  const { data: envelope } = await api.post<RouteSearchEnvelope>(ROUTE_SEARCH_URL, req);
  if (!envelope.success) {
    const failure: ApiFailure = {
      ok: false,
      reason: 'UNKNOWN',
      ...(envelope.message ? { message: envelope.message } : {}),
    };
    return Promise.reject(failure);
  }
  return envelope.data.routes;
}
