import {
  FOREGROUND_SERVICE_MESSAGE_TYPE,
  isForegroundMessage,
  localProgress,
  minutesUntilBoarding,
  parseForegroundPayload,
  shouldEndService,
} from '../contentState';

// 출발 10분 전 백엔드 FCM data 메시지 한 건. FCM data 값은 항상 문자열.
const BOARDING_EPOCH = 1_700_000_000; // 탑승 시각
const DEPART_EPOCH = BOARDING_EPOCH - 600; // 10분 전 출발

const validData: Record<string, string> = {
  type: FOREGROUND_SERVICE_MESSAGE_TYPE,
  destination: '강남역',
  transitName: '수인분당선',
  transitStation: '인하대역 승강장',
  boardingStationName: '인하대역',
  arrivalTimeText: '오후 2:05',
  transitMinutes: '4',
  transitTimeText: '오후 1:27',
  progress: '0.42',
  llmMessage: '지금 나가면 딱 맞아요! 🚶‍♂️',
  llmSub: '도보 12분 → 인하대역',
  boardingEpoch: String(BOARDING_EPOCH),
  departEpoch: String(DEPART_EPOCH),
};

describe('isForegroundMessage', () => {
  it('정상: type 이 맞으면 true', () => {
    expect(isForegroundMessage(validData)).toBe(true);
  });

  it('분기: type 이 다르면 false', () => {
    expect(isForegroundMessage({ type: 'RESERVATION' })).toBe(false);
  });

  it('에러: data 가 없으면 false', () => {
    expect(isForegroundMessage(undefined)).toBe(false);
  });
});

describe('parseForegroundPayload', () => {
  it('정상: 문자열 data 를 타입 있는 payload 로 변환', () => {
    const payload = parseForegroundPayload(validData);
    expect(payload).not.toBeNull();
    expect(payload?.attributes).toEqual({
      destination: '강남역',
      transitName: '수인분당선',
      transitStation: '인하대역 승강장',
      boardingStationName: '인하대역',
      arrivalTimeText: '오후 2:05',
    });
    expect(payload?.state.transitMinutes).toBe(4);
    expect(payload?.state.progress).toBeCloseTo(0.42);
    expect(payload?.state.boardingEpoch).toBe(BOARDING_EPOCH);
    expect(payload?.departEpoch).toBe(DEPART_EPOCH);
  });

  it('경계: departEpoch 누락 시 boardingEpoch - transitMinutes 로 역산', () => {
    const withoutDepart: Partial<typeof validData> = { ...validData };
    delete withoutDepart.departEpoch;
    const payload = parseForegroundPayload(withoutDepart);
    expect(payload?.departEpoch).toBe(BOARDING_EPOCH - 4 * 60);
  });

  it('경계: progress 는 0~1 로 클램프', () => {
    expect(parseForegroundPayload({ ...validData, progress: '1.8' })?.state.progress).toBe(1);
    expect(parseForegroundPayload({ ...validData, progress: '-0.5' })?.state.progress).toBe(0);
  });

  it('에러: 필수 필드(destination) 누락 시 null', () => {
    const withoutDestination: Partial<typeof validData> = { ...validData };
    delete withoutDestination.destination;
    expect(parseForegroundPayload(withoutDestination)).toBeNull();
  });

  it('에러: 숫자 필드가 숫자가 아니면 null', () => {
    expect(parseForegroundPayload({ ...validData, boardingEpoch: 'soon' })).toBeNull();
  });

  it('에러: data 자체가 undefined 면 null', () => {
    expect(parseForegroundPayload(undefined)).toBeNull();
  });
});

describe('minutesUntilBoarding', () => {
  it('정상: 남은 시간을 올림한 분으로', () => {
    expect(minutesUntilBoarding(BOARDING_EPOCH, BOARDING_EPOCH - 200)).toBe(4); // 3.33분 → 4
  });

  it('경계: 탑승 시각 도달 시 0', () => {
    expect(minutesUntilBoarding(BOARDING_EPOCH, BOARDING_EPOCH)).toBe(0);
  });

  it('경계: 이미 지났으면 0 (음수 금지)', () => {
    expect(minutesUntilBoarding(BOARDING_EPOCH, BOARDING_EPOCH + 500)).toBe(0);
  });
});

describe('localProgress', () => {
  it('정상: 출발~탑승 사이 비율', () => {
    expect(localProgress(DEPART_EPOCH, BOARDING_EPOCH, DEPART_EPOCH + 300)).toBeCloseTo(0.5);
  });

  it('경계: 출발 전이면 0, 탑승 후면 1', () => {
    expect(localProgress(DEPART_EPOCH, BOARDING_EPOCH, DEPART_EPOCH - 10)).toBe(0);
    expect(localProgress(DEPART_EPOCH, BOARDING_EPOCH, BOARDING_EPOCH + 10)).toBe(1);
  });

  it('에러: 구간 길이가 0 이하면 1 로 처리(0 나눗셈 방지)', () => {
    expect(localProgress(BOARDING_EPOCH, BOARDING_EPOCH, BOARDING_EPOCH)).toBe(1);
  });
});

describe('shouldEndService', () => {
  it('정상: 탑승 시각 도달 시 종료', () => {
    expect(shouldEndService(BOARDING_EPOCH, BOARDING_EPOCH)).toBe(true);
    expect(shouldEndService(BOARDING_EPOCH, BOARDING_EPOCH + 1)).toBe(true);
  });

  it('분기: 아직 탑승 전이면 유지', () => {
    expect(shouldEndService(BOARDING_EPOCH, BOARDING_EPOCH - 1)).toBe(false);
  });
});
