export type RepeatDay =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

/** GET /api/reservations 응답의 repeatDays는 3자 약어 포맷. */
export type RepeatDayShort = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export type ApiRouteOption = 'DRIVE' | 'WALK' | 'BICYCLE' | 'TRANSIT';

/** PUT /api/reservations/{id} 전용 routeOption (POST와 enum이 다름). */
export type PutRouteOption = 'OPTIMAL' | 'MIN_TRANSFER' | 'SUBWAY_FIRST' | 'BUS_ONLY';

export interface ReservationCreateRequest {
  nickname?: string;
  originName: string;
  originLat: number;
  originLng: number;
  destName: string;
  destLat: number;
  destLng: number;
  routeOption: ApiRouteOption;
  arrivalTime: string;
  repeatDays: RepeatDay[];
}

export interface ReservationCreateResponse {
  reservationId: number;
}

export interface ReservationListItem {
  id: number;
  nickname: string | null;
  originName: string;
  destName: string;
  arrivalTime: string;
  repeatDays: RepeatDay[];
}

export interface ReservationUpdateRequest {
  nickname?: string;
  originName: string;
  originLat: number;
  originLng: number;
  destName: string;
  destLat: number;
  destLng: number;
  routeOption: PutRouteOption;
  arrivalTime: string;
  repeatDays: RepeatDay[];
}
