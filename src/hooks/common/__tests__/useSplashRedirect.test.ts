import { renderHook, act } from '@testing-library/react-native';

import { useSplashRedirect } from '@/hooks/common/useSplashRedirect';
import { SPLASH_DURATION_MS } from '@/constants/splash';

describe('useSplashRedirect', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('지정한 시간이 지나면 onComplete를 1회 호출한다', () => {
    const onComplete = jest.fn();
    renderHook(() => useSplashRedirect(onComplete, 1500));

    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('durationMs를 생략하면 기본값(SPLASH_DURATION_MS)을 사용한다', () => {
    const onComplete = jest.fn();
    renderHook(() => useSplashRedirect(onComplete));

    act(() => {
      jest.advanceTimersByTime(SPLASH_DURATION_MS - 1);
    });
    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('대기 시간 직전에는 onComplete를 호출하지 않는다', () => {
    const onComplete = jest.fn();
    renderHook(() => useSplashRedirect(onComplete, 1500));

    act(() => {
      jest.advanceTimersByTime(1499);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('skip()을 호출하면 즉시 onComplete를 호출하고, 이후 타이머가 만료돼도 추가 호출하지 않는다', () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useSplashRedirect(onComplete, 1500));

    act(() => {
      result.current.skip();
    });
    expect(onComplete).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('skip()을 여러 번 호출해도 onComplete는 1회만 실행된다', () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useSplashRedirect(onComplete, 1500));

    act(() => {
      result.current.skip();
      result.current.skip();
      result.current.skip();
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('언마운트 후 타이머가 만료돼도 onComplete를 호출하지 않는다', () => {
    const onComplete = jest.fn();
    const { unmount } = renderHook(() => useSplashRedirect(onComplete, 1500));

    unmount();

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });
});
