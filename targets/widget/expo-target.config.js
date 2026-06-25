/**
 * @bacons/apple-targets 위젯 익스텐션 타겟 선언.
 * prebuild 시 이 폴더의 Swift 파일들이 'When2GoWidget' 익스텐션 타겟으로 묶인다.
 *
 * App Group 값은 메인 앱(app.config.ts ios.entitlements)·로컬 모듈과 반드시 동일해야 한다.
 */
/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: 'widget',
  name: 'When2GoWidget',
  // 잠금화면/Dynamic Island Live Activity 만 제공. 홈 화면 위젯 갤러리에는 노출하지 않는다.
  deploymentTarget: '16.2',
  entitlements: {
    'com.apple.security.application-groups': ['group.kr.co.when2go.app'],
  },
  frameworks: ['SwiftUI', 'WidgetKit', 'ActivityKit'],
};
