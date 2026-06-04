import type { RouteCandidate } from '@/api/route/types';
import { normalizeRoute } from '../routeNormalize';

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
  it('DEFAULT_ROUTE → badge: optimal', () => {
    const item = normalizeRoute(makeRoute(), 0);
    expect(item.badge).toBe('optimal');
  });

  it('durationLabel은 localizedValues.duration.text에서 추출', () => {
    const item = normalizeRoute(makeRoute(), 0);
    expect(item.durationLabel).toBe('24분');
  });

  it('TRANSIT step에서 승/하차 역명 추출', () => {
    const item = normalizeRoute(makeRoute(), 0);
    expect(item.steps).toEqual(['주안역환승정류장', '인하대역']);
  });

  it('BUS vehicle → icon: bus', () => {
    const item = normalizeRoute(makeRoute(), 0);
    expect(item.icon).toBe('bus');
  });

  it('departureTime / arrivalTime은 KST 포맷으로 변환', () => {
    const item = normalizeRoute(makeRoute(), 0);
    expect(item.departureTime).toBe('오후 1:13');
    expect(item.arrivalTime).toBe('오후 1:28');
  });

  // 경계: TRANSIT step 없음
  it('TRANSIT step이 없으면 steps 빈 배열, transferCount 0', () => {
    const walkOnly = makeRoute({
      legs: [{ steps: [WALK_STEP] }],
    });
    const item = normalizeRoute(walkOnly, 0);
    expect(item.steps).toEqual([]);
    expect(item.transferCount).toBe(0);
  });

  // 분기: routeLabels 없으면 인덱스로 badge 결정
  it('routeLabels 없고 index 1 → badge: min_transfer', () => {
    const item = normalizeRoute(makeRoute({ routeLabels: undefined }), 1);
    expect(item.badge).toBe('min_transfer');
  });

  it('routeLabels 없고 index 2 → badge: min_fare', () => {
    const item = normalizeRoute(makeRoute({ routeLabels: undefined }), 2);
    expect(item.badge).toBe('min_fare');
  });

  // 에러: transitDetails 없는 TRANSIT step
  it('transitDetails 없으면 departureTime/arrivalTime "--:--"', () => {
    const noDetails = makeRoute({
      legs: [
        {
          steps: [
            {
              travelMode: 'TRANSIT' as const,
              distanceMeters: 100,
              staticDuration: '60s',
            },
          ],
        },
      ],
    });
    const item = normalizeRoute(noDetails, 0);
    expect(item.departureTime).toBe('--:--');
    expect(item.arrivalTime).toBe('--:--');
  });

  // SUBWAY vehicle → icon: train
  it('SUBWAY vehicle → icon: train', () => {
    const subwayStep = {
      ...TRANSIT_STEP,
      transitDetails: {
        ...TRANSIT_STEP.transitDetails,
        transitLine: { vehicle: { type: 'SUBWAY' } },
      },
    };
    const item = normalizeRoute(makeRoute({ legs: [{ steps: [subwayStep] }] }), 0);
    expect(item.icon).toBe('train');
  });

  // transferCount: TRANSIT 2개 → 1회 환승
  it('TRANSIT step 2개 → transferCount 1', () => {
    const route = makeRoute({
      legs: [{ steps: [WALK_STEP, TRANSIT_STEP, WALK_STEP, TRANSIT_STEP, WALK_STEP] }],
    });
    const item = normalizeRoute(route, 0);
    expect(item.transferCount).toBe(1);
  });
});
