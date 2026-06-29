const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

// Android Foreground Service(F-W02) 위젯을 위한 권한·Service·Receiver 를 AndroidManifest 에 주입한다.
// android/ 디렉토리는 prebuild 로 매번 재생성되므로 매니페스트 직접 수정 대신 config plugin 으로 처리한다.
// 네이티브 구현은 modules/when2go-foreground-service/android/ 참조.

const SERVICE_NAME = 'kr.co.when2go.app.When2GoForegroundService';
const RECEIVER_NAME = 'kr.co.when2go.app.When2GoForegroundService$StopReceiver';
const STOP_ACTION = 'kr.co.when2go.app.FOREGROUND_SERVICE_STOP';

const PERMISSIONS = [
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.FOREGROUND_SERVICE_DATA_SYNC',
  'android.permission.POST_NOTIFICATIONS',
];

const withForegroundService = (config) =>
  withAndroidManifest(config, (config) => {
    const manifest = config.modResults;

    // 권한 추가(중복 방지).
    AndroidConfig.Permissions.ensurePermissions(manifest, PERMISSIONS);

    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);

    application.service = application.service ?? [];
    if (!application.service.some((s) => s.$['android:name'] === SERVICE_NAME)) {
      application.service.push({
        $: {
          'android:name': SERVICE_NAME,
          'android:foregroundServiceType': 'dataSync',
          'android:exported': 'false',
        },
      });
    }

    application.receiver = application.receiver ?? [];
    if (!application.receiver.some((r) => r.$['android:name'] === RECEIVER_NAME)) {
      application.receiver.push({
        $: {
          'android:name': RECEIVER_NAME,
          'android:exported': 'false',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': STOP_ACTION } }],
          },
        ],
      });
    }

    return config;
  });

module.exports = withForegroundService;
