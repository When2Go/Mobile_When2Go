import polyline from '@mapbox/polyline';

export interface Coord {
  latitude: number;
  longitude: number;
}

export function decodePolyline(encoded: string): Coord[] {
  if (!encoded) return [];
  return polyline.decode(encoded).map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
}
