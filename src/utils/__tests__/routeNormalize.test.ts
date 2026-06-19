import type { RouteCandidate } from '@/api/route/types';
import { normalizeCandidates, normalizeRoute } from '../routeNormalize';

const WALK_STEP = {
  travelMode: 'WALK' as const,
  distanceMeters: 128,
  staticDuration: '129s',
};

const TRANSIT_STEP = {
  travelMode: 'TRANSIT' as const,
  distanceMeters: 4997,
  staticDuration: '924s',
  transitDetails: {
    stopDetails: {
      departureStop: { name: '주안역환승정류장' },
      arrivalStop: { name: '인하대역' },
      departureTime: '2026-05-22T04:13:11Z',
      arrivalTime: '2026-05-22T04:28:35Z',
    },
    transitLine: {
      nameShort: '511',
      vehicle: { type: 'BUS' },
    },
    stopCount: 14,
  },
};

function makeRoute(overrides: Partial<RouteCandidate> = {}): RouteCandidate {
  return {
    distanceMeters: 5209,
    duration: '1800s',
    staticDuration: '1800s',
    legs: [{ steps: [WALK_STEP, TRANSIT_STEP, WALK_STEP] }],
    routeLabels: ['DEFAULT_ROUTE'],
    localizedValues: { duration: { text: '30분' } },
    ...overrides,
  };
}

const ARRIVAL_TIME = '2026-05-22 14:30';
const BUFFER_MIN = 0;

describe('normalizeRoute', () => {
  // 정상
  it('durationLabel은 localizedValues.duration.text에서 추출', () => {
    const item = normalizeRoute(makeRoute(), 0, 'optimal', ARRIVAL_TIME, BUFFER_MIN);
    expect(item.durationLabel).toBe('30분');
  });

  it('durationSeconds는 duration("1800s")을 초로 파싱', () => {
    const item = normalizeRoute(makeRoute(), 0, 'optimal', ARRIVAL_TIME, BUFFER_MIN);
    expect(item.durationSeconds).toBe(1800);
  });

  it('duration 파싱 불가 시 durationSeconds는 0', () => {
    const item = normalizeRoute(makeRoute({ duration: 'NaNs' }), 0, 'optimal', ARRIVAL_TIME, BUFFER_MIN);
    expect(item.durationSeconds).toBe(0);
  });

  it('TRANSIT step에서 승/하차 역명 추출', () => {
    const item = normalizeRoute(makeRoute(), 0, 'optimal', ARRIVAL_TIME, BUFFER_MIN);
    expect(item.steps).toEqual(['주안역환승정류장', '인하대역']);
  });

  it('BUS vehicle → icon: bus', () => {
    const item = normalizeRoute(makeRoute(), 0, 'optimal', ARRIVAL_TIME, BUFFER_MIN);
    expect(item.icon).toBe('bus');
  });

  // 출발·도착 시각 계산
  it('departureTime은 arrivalTime - duration - bufferMin', () => {
    // 14:30 - 1800s(30분) - 0 = 14:00
    const item = normalizeRoute(makeRoute(), 0, 'optimal', ARRIVAL_TIME, BUFFER_MIN);
    expect(item.departureTime).toBe('오후 2:00');
  });

  it('arrivalTime은 arrivalTime - bufferMin', () => {
    // 14:30 - 0 = 14:30
    const item = normalizeRoute(makeRoute(), 0, 'optimal', ARRIVAL_TIME, BUFFER_MIN);
    expect(item.arrivalTime).toBe('오후 2:30');
  });

  it('버퍼가 있으면 출발·도착 모두 앞당겨진다', () => {
    // 14:30 - 1800s(30분) - 10분 = 13:50 출발, 14:30 - 10분 = 14:20 도착
    const item = normalizeRoute(makeRoute(), 0, 'optimal', ARRIVAL_TIME, 10);
    expect(item.departureTime).toBe('오후 1:50');
    expect(item.arrivalTime).toBe('오후 2:20');
  });

  it('badge 파라미터를 그대로 반환한다', () => {
    expect(normalizeRoute(makeRoute(), 0, 'optimal', ARRIVAL_TIME, BUFFER_MIN).badge).toBe('optimal');
    expect(normalizeRoute(makeRoute(), 1, 'min_transfer', ARRIVAL_TIME, BUFFER_MIN).badge).toBe('min_transfer');
    expect(normalizeRoute(makeRoute(), 2, null, ARRIVAL_TIME, BUFFER_MIN).badge).toBeNull();
  });

  // 경계: TRANSIT step 없음
  it('TRANSIT step이 없으면 steps 빈 배열, transferCount 0', () => {
    const walkOnly = makeRoute({ legs: [{ steps: [WALK_STEP] }] });
    const item = normalizeRoute(walkOnly, 0, 'optimal', ARRIVAL_TIME, BUFFER_MIN);
    expect(item.steps).toEqual([]);
    expect(item.transferCount).toBe(0);
  });

  it('SUBWAY vehicle → icon: train', () => {
    const subwayStep = {
      ...TRANSIT_STEP,
      transitDetails: { ...TRANSIT_STEP.transitDetails, transitLine: { vehicle: { type: 'SUBWAY' } } },
    };
    const item = normalizeRoute(makeRoute({ legs: [{ steps: [subwayStep] }] }), 0, 'optimal', ARRIVAL_TIME, BUFFER_MIN);
    expect(item.icon).toBe('train');
  });

  it('TRANSIT step 2개 → transferCount 1', () => {
    const route = makeRoute({
      legs: [{ steps: [WALK_STEP, TRANSIT_STEP, WALK_STEP, TRANSIT_STEP, WALK_STEP] }],
    });
    const item = normalizeRoute(route, 0, 'optimal', ARRIVAL_TIME, BUFFER_MIN);
    expect(item.transferCount).toBe(1);
  });
});

describe('normalizeCandidates', () => {
  // 정상: duration 최솟값 → optimal
  it('duration이 가장 짧은 경로가 optimal 배지를 받는다', () => {
    const short = makeRoute({ duration: '600s', routeLabels: [] });
    const long = makeRoute({ duration: '1200s', routeLabels: [] });
    const result = normalizeCandidates([long, short], ARRIVAL_TIME, BUFFER_MIN);
    const optimalIdx = result.findIndex((r) => r.badge === 'optimal');
    expect(result[optimalIdx].durationLabel).toBe('30분'); // short route
  });

  // 정상: 환승 최솟값(optimal 제외) → min_transfer
  it('optimal 제외 후 환승 횟수가 가장 적은 경로가 min_transfer 배지를 받는다', () => {
    const oneTransit = makeRoute({
      duration: '2000s',
      routeLabels: [],
      legs: [{ steps: [TRANSIT_STEP] }],
    });
    const twoTransit = makeRoute({
      duration: '1000s',
      routeLabels: [],
      legs: [{ steps: [TRANSIT_STEP, TRANSIT_STEP] }],
    });
    const result = normalizeCandidates([twoTransit, oneTransit], ARRIVAL_TIME, BUFFER_MIN);
    expect(result.find((r) => r.badge === 'optimal')?.transferCount).toBe(1);
    expect(result.find((r) => r.badge === 'min_transfer')?.transferCount).toBe(0);
  });

  // 경계: 경로 1개 → optimal만
  it('경로가 1개면 optimal만 반환한다', () => {
    const result = normalizeCandidates([makeRoute()], ARRIVAL_TIME, BUFFER_MIN);
    expect(result).toHaveLength(1);
    expect(result[0].badge).toBe('optimal');
  });

  // null 필터
  it('badge가 null인 경로(3번째 이상)는 결과에서 제외된다', () => {
    const routes = [
      makeRoute({ duration: '1000s', routeLabels: [] }),
      makeRoute({ duration: '2000s', routeLabels: [] }),
      makeRoute({ duration: '3000s', routeLabels: [] }),
    ];
    const result = normalizeCandidates(routes, ARRIVAL_TIME, BUFFER_MIN);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.badge)).toEqual(['optimal', 'min_transfer']);
  });

  // 경계: 빈 배열
  it('빈 배열을 넘기면 빈 배열을 반환한다', () => {
    expect(normalizeCandidates([], ARRIVAL_TIME, BUFFER_MIN)).toEqual([]);
  });
});
