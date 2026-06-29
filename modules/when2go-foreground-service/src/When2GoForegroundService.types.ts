/** Foreground Service 시작 시 고정되는 정적 정보. Kotlin attributes Map 과 1:1. */
export interface ForegroundServiceAttributes {
  /** 목적지 — "강남역". */
  destination: string;
  /** 대중교통 노선명 — "수인분당선". */
  transitName: string;
  /** 탑승 승강장 — "인하대역 승강장". */
  transitStation: string;
  /** 프로그레스 바 중간 라벨(탑승역) — "인하대역". */
  boardingStationName: string;
  /** 최종 도착 예정 시각 텍스트 — "오후 2:05". */
  arrivalTimeText: string;
}

/** 갱신되는 동적 상태. Kotlin state Map 과 1:1. */
export interface ForegroundServiceState {
  /** 첫 대중교통 탑승까지 남은 분. */
  transitMinutes: number;
  /** 탑승 시각 텍스트 — "오후 1:27". */
  transitTimeText: string;
  /** 캐릭터 프로그레스 바 진행도 (0.0 ~ 1.0). */
  progress: number;
  /** LLM 안내 메시지(F-W04). */
  llmMessage: string;
  /** LLM 보조 문구. */
  llmSub: string;
  /** 탑승 시각 epoch(초). 종료 기준. */
  boardingEpoch: number;
}

/** parseForegroundPayload 결과 — 네이티브로 그대로 넘길 수 있는 형태. */
export interface ForegroundServicePayload {
  attributes: ForegroundServiceAttributes;
  state: ForegroundServiceState;
  /** 위젯이 시작된 기준 시각 epoch(초). 로컬 progress 계산용. */
  departEpoch: number;
}
