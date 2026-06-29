import type {
  LiveActivityAttributes,
  LiveActivityContentState,
} from '../../../modules/when2go-live-activity';

/** 출발 10분 전 백엔드 FCM data 메시지를 식별하는 type 값. */
export const LIVE_ACTIVITY_MESSAGE_TYPE = 'DEPARTURE_LIVE_ACTIVITY';

const SECONDS_PER_MINUTE = 60;

/** parseLiveActivityPayload 결과 — 네이티브로 그대로 넘길 수 있는 형태. */
export interface LiveActivityPayload {
  attributes: LiveActivityAttributes;
  state: LiveActivityContentState;
  /** 카드가 시작된 기준 시각 epoch(초). 로컬 progress 계산용. */
  departEpoch: number;
}

type RawData = Record<string, string | undefined> | undefined | null;

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(Math.max(value, 0), 1);
}

/** FCM data 메시지가 출발 타이밍 Live Activity 트리거인지. */
export function isLiveActivityMessage(data: RawData): boolean {
  return data?.type === LIVE_ACTIVITY_MESSAGE_TYPE;
}

/**
 * 문자열뿐인 FCM data 를 검증·파싱한다.
 * 필수 필드가 없거나 숫자 필드가 숫자가 아니면 null 을 돌려준다(시작하지 않음).
 */
export function parseLiveActivityPayload(data: RawData): LiveActivityPayload | null {
  if (!data) return null;

  const {
    destination,
    transitName,
    transitStation,
    boardingStationName,
    arrivalTimeText,
    transitTimeText,
    llmMessage,
    llmSub,
    transitMinutes,
    progress,
    boardingEpoch,
    departEpoch,
  } = data;

  const requiredText = [
    destination,
    transitName,
    transitStation,
    boardingStationName,
    arrivalTimeText,
    transitTimeText,
    llmMessage,
    llmSub,
  ];
  if (requiredText.some((field) => field == null || field === '')) return null;

  const minutes = Number(transitMinutes);
  const progressValue = Number(progress);
  const boarding = Number(boardingEpoch);
  if (
    !Number.isFinite(minutes) ||
    !Number.isFinite(progressValue) ||
    !Number.isFinite(boarding)
  ) {
    return null;
  }

  const depart = Number(departEpoch);
  const resolvedDepart = Number.isFinite(depart)
    ? depart
    : boarding - minutes * SECONDS_PER_MINUTE;

  return {
    attributes: {
      destination: destination!,
      transitName: transitName!,
      transitStation: transitStation!,
      boardingStationName: boardingStationName!,
      arrivalTimeText: arrivalTimeText!,
    },
    state: {
      transitMinutes: Math.max(Math.round(minutes), 0),
      transitTimeText: transitTimeText!,
      progress: clamp01(progressValue),
      llmMessage: llmMessage!,
      llmSub: llmSub!,
      boardingEpoch: boarding,
    },
    departEpoch: resolvedDepart,
  };
}

/** 탑승까지 남은 분(올림, 0 미만 금지). */
export function minutesUntilBoarding(boardingEpoch: number, nowEpoch: number): number {
  const remaining = boardingEpoch - nowEpoch;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / SECONDS_PER_MINUTE);
}

/** 출발~탑승 구간에서 현재 진행도(0~1). 구간이 0 이하면 1 로 본다. */
export function localProgress(
  departEpoch: number,
  boardingEpoch: number,
  nowEpoch: number,
): number {
  const span = boardingEpoch - departEpoch;
  if (span <= 0) return 1;
  return clamp01((nowEpoch - departEpoch) / span);
}

/** 첫 대중교통 탑승 시각에 도달하면 Activity 를 종료해야 한다. */
export function shouldEndActivity(boardingEpoch: number, nowEpoch: number): boolean {
  return nowEpoch >= boardingEpoch;
}
