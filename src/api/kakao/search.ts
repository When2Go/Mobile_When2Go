import axios from 'axios';

import { normalizeAxiosError } from '@/api/interceptors/error';
import type { KakaoSearchResponse, Place } from './types';

const KAKAO_BASE_URL = 'https://dapi.kakao.com/v2/local';
const REQUEST_TIMEOUT_MS = 10_000;
const SEARCH_SIZE = 15;
// 카카오 콘솔에 등록된 허용 도메인 — 키 도용 방지용 Referer 화이트리스트
const KAKAO_ALLOWED_REFERER = 'https://when2go.qzz.io';

function resolveKakaoKey(): string {
  const key = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;
  if (!key) {
    throw new Error(
      'EXPO_PUBLIC_KAKAO_REST_API_KEY 가 비어있다. .env 에 채우고 `npx expo start --clear` 로 재시작해라.',
    );
  }
  return key;
}

const kakaoApi = axios.create({
  baseURL: KAKAO_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Authorization: `KakaoAK ${resolveKakaoKey()}`,
    Referer: KAKAO_ALLOWED_REFERER,
  },
});

kakaoApi.interceptors.response.use((r) => r, normalizeAxiosError);

export async function searchPlaces(query: string): Promise<Place[]> {
  const response = await kakaoApi.get<KakaoSearchResponse>('/search/keyword.json', {
    params: { query, size: SEARCH_SIZE },
  });

  return response.data.documents.map((doc) => ({
    id: doc.id,
    name: doc.place_name,
    address: doc.road_address_name || doc.address_name,
    lat: Number(doc.y), // y = 위도(latitude)
    lng: Number(doc.x), // x = 경도(longitude)
  }));
}
