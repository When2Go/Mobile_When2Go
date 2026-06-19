import { useCallback, useEffect, useRef } from 'react';

import { SPLASH_DURATION_MS } from '@/constants/splash';

/**
 * 인앱 스플래시 화면용 타이머 훅.
 * 마운트 후 `durationMs`가 지나면 자동으로 `onComplete`를 1회 호출하고,
 * 사용자가 화면을 탭하는 등 즉시 이동이 필요하면 `skip()`으로 곧장 호출한다.
 * 자동/수동을 합쳐 `onComplete`는 최대 1회만 실행된다.
 *
 * 라우팅은 의도적으로 포함하지 않고 콜백 주입형으로 둔다(테스트 용이성).
 */
export function useSplashRedirect(
  onComplete: () => void,
  durationMs: number = SPLASH_DURATION_MS,
): { skip: () => void } {
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 매 렌더마다 최신 콜백을 참조하도록 갱신(타이머 재설정 없이).
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const complete = useCallback(() => {
    if (completedRef.current) {
      return;
    }
    completedRef.current = true;
    clearTimer();
    onCompleteRef.current();
  }, [clearTimer]);

  useEffect(() => {
    timerRef.current = setTimeout(complete, durationMs);
    return clearTimer;
  }, [complete, clearTimer, durationMs]);

  const skip = useCallback(() => {
    complete();
  }, [complete]);

  return { skip };
}
