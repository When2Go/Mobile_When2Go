import polyline from '@mapbox/polyline';

export interface Coord {
  latitude: number;
  longitude: number;
}

export function decodePolyline(encoded: string): Coord[] {
  if (!encoded) return [];
  return polyline.decode(encoded).map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
}

/**
 * 폴리라인 좌표 배열에서 boarding 좌표와 가장 가까운 인덱스를 반환한다.
 * 도보→대중교통 경계점을 찾아 폴리라인을 점선/실선으로 분기할 때 사용한다.
 */
export function findBoardingIndex(coords: Coord[], boarding: Coord): number {
  if (coords.length === 0) return 0;
  let minDist = Infinity;
  let idx = 0;
  for (let i = 0; i < coords.length; i++) {
    const d =
      (coords[i].latitude - boarding.latitude) ** 2 +
      (coords[i].longitude - boarding.longitude) ** 2;
    if (d < minDist) {
      minDist = d;
      idx = i;
    }
  }
  return idx;
}
