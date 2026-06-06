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
    duration: '1438s',
    staticDuration: '1438s',
    legs: [{ steps: [WALK_STEP, TRANSIT_STEP, WALK_STEP] }],
    routeLabels: ['DEFAULT_ROUTE'],
    localizedValues: { duration: { text: '24분' } },
    ...overrides,
  };
}

describe('normalizeRoute', () => {
  // 정상
  it('durationLabel은 localizedValues.duration.text에서 추출', () => {
    const item = normalizeRoute(makeRoute(), 0, 'optimal');
    expect(item.durationLabel).toBe('24분');
  });

  it('TRANSIT step에서 승/하차 역명 추출', () => {
    const item = normalizeRoute(makeRoute(), 0, 'optimal');
    expect(item.steps).toEqual(['주안역환승정류장', '인하대역']);
  });

  it('BUS vehicle → icon: bus', () => {
    const item = normalizeRoute(makeRoute(), 0, 'optimal');
    expect(item.icon).toBe('bus');
  });

  it('departureTime / arrivalTime은 KST 포맷으로 변환', () => {
    const item = normalizeRoute(makeRoute(), 0, 'optimal');
    expect(item.departureTime).toBe('오후 1:13');
    expect(item.arrivalTime).toBe('오후 1:28');
  });

  it('badge 파라미터를 그대로 반환한다', () => {
    expect(normalizeRoute(makeRoute(), 0, 'optimal').badge).toBe('optimal');
    expect(normalizeRoute(makeRoute(), 1, 'min_transfer').badge).toBe('min_transfer');
    expect(normalizeRoute(makeRoute(), 2, null).badge).toBeNull();
  });

  // 경계: TRANSIT step 없음
  it('TRANSIT step이 없으면 steps 빈 배열, transferCount 0', () => {
    const walkOnly = makeRoute({ legs: [{ steps: [WALK_STEP] }] });
    const item = normalizeRoute(walkOnly, 0, 'optimal');
    expect(item.steps).toEqual([]);
    expect(item.transferCount).toBe(0);
  });

  // 에러: transitDetails 없는 TRANSIT step
  it('transitDetails 없으면 departureTime/arrivalTime "--:--"', () => {
    const noDetails = makeRoute({
      legs: [{ steps: [{ travelMode: 'TRANSIT' as const, distanceMeters: 100, staticDuration: '60s' }] }],
    });
    const item = normalizeRoute(noDetails, 0, 'optimal');
    expect(item.departureTime).toBe('--:--');
    expect(item.arrivalTime).toBe('--:--');
  });

  it('SUBWAY vehicle → icon: train', () => {
    const subwayStep = {
      ...TRANSIT_STEP,
      transitDetails: { ...TRANSIT_STEP.transitDetails, transitLine: { vehicle: { type: 'SUBWAY' } } },
    };
    const item = normalizeRoute(makeRoute({ legs: [{ steps: [subwayStep] }] }), 0, 'optimal');
    expect(item.icon).toBe('train');
  });

  it('TRANSIT step 2개 → transferCount 1', () => {
    const route = makeRoute({
      legs: [{ steps: [WALK_STEP, TRANSIT_STEP, WALK_STEP, TRANSIT_STEP, WALK_STEP] }],
    });
    const item = normalizeRoute(route, 0, 'optimal');
    expect(item.transferCount).toBe(1);
  });
});

describe('normalizeCandidates', () => {
  // 정상: duration 최솟값 → optimal
  it('duration이 가장 짧은 경로가 optimal 배지를 받는다', () => {
    const short = makeRoute({ duration: '600s', routeLabels: [] });
    const long = makeRoute({ duration: '1200s', routeLabels: [] });
    const result = normalizeCandidates([long, short]);
    const optimal = result.find((r) => r.badge === 'optimal');
    expect(optimal?.durationLabel).toBe('24분'); // short route의 localizedValues
  });

  // 정상: 환승 최솟값(optimal 제외) → min_transfer
  it('optimal 제외 후 환승 횟수가 가장 적은 경로가 min_transfer 배지를 받는다', () => {
    const oneTransit = makeRoute({
      duration: '2000s',
      routeLabels: [],
      legs: [{ steps: [TRANSIT_STEP] }],
    });
    const twoTransit = makeRoute({
      duration: '1000s', // optimal
      routeLabels: [],
      legs: [{ steps: [TRANSIT_STEP, TRANSIT_STEP] }],
    });
    const result = normalizeCandidates([twoTransit, oneTransit]);
    expect(result.find((r) => r.badge === 'optimal')?.transferCount).toBe(1); // twoTransit
    expect(result.find((r) => r.badge === 'min_transfer')?.transferCount).toBe(0); // oneTransit
  });

  // 경계: 경로 1개 → optimal만, min_transfer 없음
  it('경로가 1개면 optimal만 반환한다', () => {
    const result = normalizeCandidates([makeRoute()]);
    expect(result).toHaveLength(1);
    expect(result[0].badge).toBe('optimal');
  });

  // null 필터: 배지 없는 경로는 결과에서 제외
  it('badge가 null인 경로(3번째 이상)는 결과에서 제외된다', () => {
    const routes = [
      makeRoute({ duration: '1000s', routeLabels: [] }),
      makeRoute({ duration: '2000s', routeLabels: [] }),
      makeRoute({ duration: '3000s', routeLabels: [] }),
    ];
    const result = normalizeCandidates(routes);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.badge)).toEqual(['optimal', 'min_transfer']);
  });

  // 경계: 빈 배열
  it('빈 배열을 넘기면 빈 배열을 반환한다', () => {
    expect(normalizeCandidates([])).toEqual([]);
  });
});
