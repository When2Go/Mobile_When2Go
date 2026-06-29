import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, Pressable, Text } from 'react-native';

import * as LiveActivity from '@/modules/liveActivity';
import type {
  LiveActivityAttributes,
  LiveActivityContentState,
} from '@/modules/liveActivity';
import {
  localProgress,
  minutesUntilBoarding,
  shouldEndActivity,
} from '@/utils/liveActivity/contentState';

// 백엔드 APNs 전송 전, 잠금화면 카드·Dynamic Island 렌더링을 손으로 켜보기 위한 __DEV__ 전용 트리거.
// JS-only 라 재빌드 없이 Metro 리로드로 동작한다. 백엔드 연동 후 제거 대상.

const MOCK_ATTRS: LiveActivityAttributes = {
  destination: '강남역',
  transitName: '수인분당선',
  transitStation: '인하대역 승강장',
  boardingStationName: '인하대역',
  arrivalTimeText: '오후 2:05',
};

// 테스트 동안 남은 시간이 줄며 종료까지 가도록 짧게 잡은 탑승 윈도우(초).
const TEST_WINDOW_SEC = 180;
const TICK_MS = 5_000;

function nowEpoch(): number {
  return Math.floor(Date.now() / 1000);
}

function baseState(boardingEpoch: number, now: number): LiveActivityContentState {
  return {
    transitMinutes: minutesUntilBoarding(boardingEpoch, now),
    transitTimeText: '오후 1:27',
    progress: 0,
    llmMessage: '지금 나가면 딱 맞아요!',
    llmSub: '도보 12분 → 인하대역',
    boardingEpoch,
  };
}

export default function LiveActivityDevTrigger() {
  const [running, setRunning] = useState(false);
  const departRef = useRef(0);
  const boardingRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTicking = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  useEffect(() => stopTicking, []);

  if (!__DEV__ || Platform.OS !== 'ios') return null;

  // 왜 안 뜨는지 실기기에서 바로 알 수 있게, 단계별 상태를 Alert 로 노출한다.
  const start = async () => {
    if (!LiveActivity.isSupported) {
      Alert.alert(
        'DEV: 네이티브 모듈 미연결',
        'When2GoLiveActivity 모듈이 빌드에 없습니다. 위젯 타겟/로컬 모듈이 포함되도록 prebuild 후 재빌드가 필요합니다.',
      );
      return;
    }
    if (!LiveActivity.areActivitiesEnabled()) {
      Alert.alert(
        'DEV: Live Activity 꺼짐',
        '설정 → 지금 나가? → 실시간 활동(Live Activities) 을 켜주세요. (또는 설정 → Face ID/잠금화면 → 실시간 활동)',
      );
      return;
    }

    const now = nowEpoch();
    departRef.current = now;
    boardingRef.current = now + TEST_WINDOW_SEC;

    try {
      const id = await LiveActivity.start(MOCK_ATTRS, baseState(boardingRef.current, now));
      setRunning(true);
      Alert.alert('DEV: 시작됨', `activityId: ${id ?? 'null'}\n기기를 잠그면 잠금화면 카드를 확인하세요.`);

      stopTicking();
      tickRef.current = setInterval(() => {
        const tickNow = nowEpoch();
        const boarding = boardingRef.current;
        if (shouldEndActivity(boarding, tickNow)) {
          void LiveActivity.end(true);
          stopTicking();
          setRunning(false);
          return;
        }
        void LiveActivity.update({
          ...baseState(boarding, tickNow),
          progress: localProgress(departRef.current, boarding, tickNow),
        });
      }, TICK_MS);
    } catch (err) {
      Alert.alert('DEV: start 실패', String(err));
    }
  };

  const stop = async () => {
    stopTicking();
    await LiveActivity.end(false);
    setRunning(false);
  };

  return (
    <Pressable
      onPress={() => void (running ? stop() : start())}
      className="absolute bottom-28 right-4 rounded-full bg-primary px-4 py-3 shadow-lg"
    >
      <Text className="text-xs font-bold text-white">
        {running ? '🔴 위젯 끄기 (DEV)' : '⚡️ 위젯 켜기 (DEV)'}
      </Text>
    </Pressable>
  );
}
