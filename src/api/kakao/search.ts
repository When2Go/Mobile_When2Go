import axios from 'axios';

import type { KakaoSearchResponse, Place } from './types';

const KAKAO_BASE_URL = 'https://dapi.kakao.com/v2/local';
const REQUEST_TIMEOUT_MS = 10_000;
const SEARCH_SIZE = 15;

const kakaoApi = axios.create({
  baseURL: KAKAO_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Authorization: `KakaoAK ${process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY}`,
  },
});

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
