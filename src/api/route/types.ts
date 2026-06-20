export interface RouteSearchRequest {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  arrivalTime: string; // HH:mm
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

interface LocalizedText {
  text: string;
}

interface TransitStop {
  name: string;
  location?: { latLng: LatLng };
}

export interface TransitDetails {
  stopDetails?: {
    departureStop?: TransitStop;
    arrivalStop?: TransitStop;
    departureTime?: string; // ISO-8601 UTC
    arrivalTime?: string;   // ISO-8601 UTC
  };
  headsign?: string;
  transitLine?: {
    name?: string;
    nameShort?: string;
    color?: string;
    textColor?: string;
    vehicle?: {
      name?: LocalizedText;
      type: string; // 'BUS' | 'SUBWAY' | ...
    };
  };
  stopCount?: number;
}

export interface RouteStep {
  travelMode: 'WALK' | 'TRANSIT';
  distanceMeters: number;
  staticDuration: string; // "Xs"
  localizedValues?: {
    distance?: LocalizedText;
    staticDuration?: LocalizedText;
  };
  navigationInstruction?: { instructions?: string };
  transitDetails?: TransitDetails;
}

export interface RouteLeg {
  distanceMeters?: number;
  duration?: string;
  staticDuration?: string;
  polyline?: { encodedPolyline: string };
  startLocation?: { latLng: LatLng };
  endLocation?: { latLng: LatLng };
  steps: RouteStep[];
  localizedValues?: {
    distance?: LocalizedText;
    duration?: LocalizedText;
    staticDuration?: LocalizedText;
  };
}

export interface RouteCandidate {
  distanceMeters: number;
  duration: string; // "Xs"
  staticDuration: string;
  legs: RouteLeg[];
  polyline?: { encodedPolyline: string };
  routeLabels?: string[];
  localizedValues?: {
    distance?: LocalizedText;
    duration?: LocalizedText;
    staticDuration?: LocalizedText;
  };
}

/** 이 엔드포인트만 code 필드를 추가로 포함한다 (공통 ApiEnvelope와 별개). */
export interface RouteSearchEnvelope {
  success: boolean;
  code: string;
  message: string;
  data: {
    routes: RouteCandidate[];
  };
}
