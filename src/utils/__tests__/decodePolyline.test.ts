import { decodePolyline } from '../route/decodePolyline';

// @mapbox/polyline encode([[38.5,-120.2],[40.7,-120.95],[43.252,-126.453]])
const MULTI_POINT_ENCODED = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';
const MULTI_POINT_COORDS = [
  { latitude: 38.5, longitude: -120.2 },
  { latitude: 40.7, longitude: -120.95 },
  { latitude: 43.252, longitude: -126.453 },
];

// @mapbox/polyline encode([[37.5665, 126.978]])
const SINGLE_POINT_ENCODED = 'sehdFok_fW';

describe('decodePolyline', () => {
  describe('정상 케이스', () => {
    it('복수 좌표 encodedPolyline을 { latitude, longitude }[] 로 변환한다', () => {
      const result = decodePolyline(MULTI_POINT_ENCODED);
      expect(result).toHaveLength(3);
      result.forEach((coord, i) => {
        expect(coord.latitude).toBeCloseTo(MULTI_POINT_COORDS[i].latitude, 3);
        expect(coord.longitude).toBeCloseTo(MULTI_POINT_COORDS[i].longitude, 3);
      });
    });
  });

  describe('경계 케이스', () => {
    it('빈 문자열 입력 시 빈 배열을 반환한다', () => {
      expect(decodePolyline('')).toEqual([]);
    });

    it('단일 좌표 polyline을 길이 1 배열로 반환한다', () => {
      const result = decodePolyline(SINGLE_POINT_ENCODED);
      expect(result).toHaveLength(1);
      expect(result[0].latitude).toBeCloseTo(37.5665, 3);
      expect(result[0].longitude).toBeCloseTo(126.978, 3);
    });
  });

  describe('분기 케이스', () => {
    it('반환 객체는 latitude·longitude 키만 가진다', () => {
      const result = decodePolyline(SINGLE_POINT_ENCODED);
      expect(Object.keys(result[0])).toEqual(['latitude', 'longitude']);
    });
  });

  describe('에러 케이스', () => {
    it('undefined 입력 시 빈 배열을 반환한다', () => {
      expect(decodePolyline(undefined as unknown as string)).toEqual([]);
    });

    it('null 입력 시 빈 배열을 반환한다', () => {
      expect(decodePolyline(null as unknown as string)).toEqual([]);
    });
  });
});
