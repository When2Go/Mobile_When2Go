import { api } from '@/api/axios';
import type { ApiFailure } from '@/types/api.types';
import type { RouteCandidate, RouteSearchEnvelope, RouteSearchRequest } from './types';

const ROUTE_SEARCH_URL = '/api/routes/search';

export async function searchRoutes(req: RouteSearchRequest): Promise<RouteCandidate[]> {
  console.log('[route] calling API...');
  try {
    const { data: envelope } = await api.post<RouteSearchEnvelope>(ROUTE_SEARCH_URL, req);
    console.log('[route] response:', JSON.stringify(envelope, null, 2));
    if (!envelope.success) {
      const failure: ApiFailure = {
        ok: false,
        reason: 'UNKNOWN',
        ...(envelope.message ? { message: envelope.message } : {}),
      };
      return Promise.reject(failure);
    }
    return envelope.data.routes;
  } catch (e) {
    console.log('[route] error:', JSON.stringify(e, null, 2));
    throw e;
  }
}
