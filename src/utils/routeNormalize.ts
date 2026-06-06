import type { RouteCandidate, RouteLeg } from '@/api/route/types';
import type { RouteBadgeId, RouteDisplayItem, TransitIcon } from '@/constants/result';
import { formatUTCToKoreanTime } from './timeFormat';

const FALLBACK_TIME = '--:--';

function assignBadges(candidates: RouteCandidate[]): (RouteBadgeId | null)[] {
  const badges: (RouteBadgeId | null)[] = new Array(candidates.length).fill(null);
  if (candidates.length === 0) return badges;

  const durations = candidates.map((c) => parseInt(c.duration));
  const minDurationIdx = durations.indexOf(Math.min(...durations));
  badges[minDurationIdx] = 'optimal';

  const transfers = candidates.map((c) => countTransfers(c.legs));
  let minTransferIdx = -1;
  let minTransferCount = Infinity;
  for (let i = 0; i < candidates.length; i++) {
    if (i === minDurationIdx) continue;
    if (transfers[i] < minTransferCount) {
      minTransferCount = transfers[i];
      minTransferIdx = i;
    }
  }
  if (minTransferIdx !== -1) badges[minTransferIdx] = 'min_transfer';

  return badges;
}

function extractTransitStops(legs: RouteLeg[]): string[] {
  const stops: string[] = [];
  for (const leg of legs) {
    for (const step of leg.steps) {
      if (step.travelMode !== 'TRANSIT') continue;
      const dept = step.transitDetails?.stopDetails?.departureStop?.name;
      const arr = step.transitDetails?.stopDetails?.arrivalStop?.name;
      if (dept && !stops.includes(dept)) stops.push(dept);
      if (arr && !stops.includes(arr)) stops.push(arr);
    }
  }
  return stops;
}

function countTransfers(legs: RouteLeg[]): number {
  const transitCount = legs
    .flatMap((l) => l.steps)
    .filter((s) => s.travelMode === 'TRANSIT').length;
  return Math.max(0, transitCount - 1);
}

function resolveIcon(legs: RouteLeg[]): TransitIcon {
  const firstTransit = legs
    .flatMap((l) => l.steps)
    .find((s) => s.travelMode === 'TRANSIT');
  return firstTransit?.transitDetails?.transitLine?.vehicle?.type === 'SUBWAY' ? 'train' : 'bus';
}

export function normalizeRoute(
  route: RouteCandidate,
  index: number,
  badge: RouteBadgeId | null,
): RouteDisplayItem {
  const { legs } = route;
  const allSteps = legs.flatMap((l) => l.steps);

  const firstTransit = allSteps.find((s) => s.travelMode === 'TRANSIT');
  const lastTransit = [...allSteps].reverse().find((s) => s.travelMode === 'TRANSIT');

  const deptTime = firstTransit?.transitDetails?.stopDetails?.departureTime;
  const arrTime = lastTransit?.transitDetails?.stopDetails?.arrivalTime;

  return {
    id: String(index),
    badge,
    departureTime: deptTime ? formatUTCToKoreanTime(deptTime) : FALLBACK_TIME,
    arrivalTime: arrTime ? formatUTCToKoreanTime(arrTime) : FALLBACK_TIME,
    durationLabel:
      route.localizedValues?.duration?.text ??
      route.localizedValues?.staticDuration?.text ??
      FALLBACK_TIME,
    steps: extractTransitStops(legs),
    transferCount: countTransfers(legs),
    fareLabel: '-',
    icon: resolveIcon(legs),
  };
}

export function normalizeCandidates(candidates: RouteCandidate[]): RouteDisplayItem[] {
  const badges = assignBadges(candidates);
  return candidates
    .map((c, i) => normalizeRoute(c, i, badges[i]))
    .filter((item) => item.badge !== null);
}
