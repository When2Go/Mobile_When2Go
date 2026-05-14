/**
 * Schedule 화면(예약 일정)에서 사용하는 도메인 타입.
 * mock 단계에서는 화면 전용으로만 쓰이며, 실제 Trip API 연동 시 재배치/확장 예정.
 */

export type ScheduleStatus = '예정' | '진행중' | '완료';

export interface ScheduleItem {
  id: number;
  /** 일정 제목 (예: "출근", "점심 약속") */
  title: string;
  /** 목적지 표시명 (예: "강남역 2호선") */
  destination: string;
  /** 도착 예정 시간 (사람이 읽는 형식: "오전 9:00") */
  arrivalTime: string;
  /** 출발 예정 시간 (사람이 읽는 형식: "오전 7:45") */
  departureTime: string;
  status: ScheduleStatus;
  /** 경로 요약 (예: "인하대역 → 오이도역 → 강남역") */
  route: string;
  /** 현재 진행 중인 카드 강조 여부 */
  isActive: boolean;
  /**
   * F-M06: 다단계 재계산이 일어났다면 마지막 갱신 시각("HH:MM").
   * 한 번도 재계산되지 않았으면 null.
   */
  updatedAt: string | null;
  /** 출발지 표시명 (상세 시트에서 사용) */
  from: string;
  /** 도착지 표시명 (상세 시트에서 사용) */
  to: string;
}
