export interface Coords {
  lat: number;
  lng: number;
}

export interface RouteItem {
  id: string;
  name: string;
  from: string;
  to: string;
  frequency: string;
  /** 출발지 좌표. 검색으로 위치를 고르면 채워진다(직접 입력 시 없을 수 있음). */
  fromCoords?: Coords;
  /** 목적지 좌표. setup 진입 시 재검색 없이 재사용한다. */
  toCoords?: Coords;
  /** 홈 '자주 가는 곳' 노출 여부. 경로 목록의 별 버튼으로 토글한다. */
  isFavorite?: boolean;
}

export type RouteFormData = Omit<RouteItem, 'id'>;
