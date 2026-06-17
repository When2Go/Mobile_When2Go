export interface KakaoPlaceDocument {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url: string;
  category_name: string;
  category_group_name: string;
  distance: string;
}

export interface KakaoSearchMeta {
  total_count: number;
  pageable_count: number;
  is_end: boolean;
}

export interface KakaoSearchResponse {
  meta: KakaoSearchMeta;
  documents: KakaoPlaceDocument[];
}

export interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}
