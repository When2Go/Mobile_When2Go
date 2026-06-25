import { isAdsEnabled, resolveBannerUnitId, TEST_BANNER_UNIT_ID } from '../ads';

describe('isAdsEnabled', () => {
  test("EXPO_PUBLIC_ADS_ENABLED 가 'true' 면 true 를 반환한다", () => {
    expect(isAdsEnabled({ EXPO_PUBLIC_ADS_ENABLED: 'true' })).toBe(true);
  });

  test("'false' 면 false 를 반환한다", () => {
    expect(isAdsEnabled({ EXPO_PUBLIC_ADS_ENABLED: 'false' })).toBe(false);
  });

  test('미설정(undefined)이면 기본값 false 를 반환한다', () => {
    expect(isAdsEnabled({})).toBe(false);
  });

  test("정확히 'true' 만 허용한다 (대문자 'TRUE' 는 false)", () => {
    expect(isAdsEnabled({ EXPO_PUBLIC_ADS_ENABLED: 'TRUE' })).toBe(false);
    expect(isAdsEnabled({ EXPO_PUBLIC_ADS_ENABLED: '1' })).toBe(false);
  });
});

describe('resolveBannerUnitId', () => {
  const env = {
    EXPO_PUBLIC_ADMOB_IOS_CONTENT_BANNER_ID: 'ios-content',
    EXPO_PUBLIC_ADMOB_ANDROID_CONTENT_BANNER_ID: 'android-content',
    EXPO_PUBLIC_ADMOB_IOS_SPLASH_BANNER_ID: 'ios-splash',
    EXPO_PUBLIC_ADMOB_ANDROID_SPLASH_BANNER_ID: 'android-splash',
  };

  test('banner 슬롯은 플랫폼별 content 배너 단위 ID 로 매핑된다', () => {
    expect(resolveBannerUnitId('banner', 'ios', env)).toBe('ios-content');
    expect(resolveBannerUnitId('banner', 'android', env)).toBe('android-content');
  });

  test('splash 슬롯은 플랫폼별 splash 배너 단위 ID 로 매핑된다', () => {
    expect(resolveBannerUnitId('splash', 'ios', env)).toBe('ios-splash');
    expect(resolveBannerUnitId('splash', 'android', env)).toBe('android-splash');
  });

  test('해당 env 가 미설정이면 테스트 배너 단위 ID 로 fallback 한다', () => {
    expect(resolveBannerUnitId('banner', 'ios', {})).toBe(TEST_BANNER_UNIT_ID);
    expect(resolveBannerUnitId('splash', 'android', {})).toBe(TEST_BANNER_UNIT_ID);
  });

  test('env 값이 빈 문자열이어도 테스트 배너 단위 ID 로 fallback 한다', () => {
    expect(
      resolveBannerUnitId('banner', 'android', {
        EXPO_PUBLIC_ADMOB_ANDROID_CONTENT_BANNER_ID: '',
      }),
    ).toBe(TEST_BANNER_UNIT_ID);
  });
});
