/**
 * 위젯 미리보기용 mock 데이터. 실제 위젯 익스텐션/실시간 데이터와는 무관한
 * 디자인 확인용 더미값이다. 디자인 시안(../design/.../LockWidget.tsx)의
 * WIDGET_DATA 를 그대로 옮겨왔다.
 */
export const WIDGET_MOCK = {
  destination: '강남역',
  transitName: '수인분당선',
  transitStation: '인하대역 승강장',
  transitMinutes: 4,
  transitTime: '오후 1:27',
  /** 0~1 진행도 (캐릭터 프로그레스 바). */
  progress: 0.42,
  llmMessage: '지금 나가면 딱 맞아요! 🚶',
  llmSub: '도보 12분 → 인하대역',
  arrivalTime: '오후 2:05',
  midStation: '인하대역',
  lockClock: '12:42',
  lockDate: '화요일, 4월 7일',
  notiTitle: '출발 1시간 전 - 강남역 약속',
  notiTime: '오후 1:05',
} as const;

export const RUNNER_EMOJI = '🏃';
