export type RepeatDay =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export type ApiRouteOption = 'DRIVE' | 'WALK' | 'BICYCLE' | 'TRANSIT';

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
