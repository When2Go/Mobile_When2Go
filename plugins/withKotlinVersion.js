const { withProjectBuildGradle } = require('@expo/config-plugins');

// play-services-ads 25.4.0 이 Kotlin 2.3.0 메타데이터로 컴파일됨 →
// 빌드 환경(2.1.x)과 버전 불일치. kotlinVersion / kspVersion 을 올려 해소.
const KOTLIN_VERSION = '2.3.0';
// ksp 버전 체계가 2.x.y-a.b.c → 단순 2.x.y 로 변경됨. Kotlin 2.3.0 과 동일 major.minor.
const KSP_VERSION = '2.3.0';

const withKotlinVersion = (config) =>
  withProjectBuildGradle(config, (config) => {
    let { contents } = config.modResults;

    // 이미 kotlinVersion ext 가 있으면 버전만 교체, 없으면 buildscript 앞에 삽입.
    if (contents.includes('kotlinVersion')) {
      contents = contents
        .replace(/kotlinVersion\s*=\s*["'][^"']+["']/g, `kotlinVersion = "${KOTLIN_VERSION}"`)
        .replace(/kspVersion\s*=\s*["'][^"']+["']/g, `kspVersion = "${KSP_VERSION}"`);
    } else {
      const ext = [
        'ext {',
        `    kotlinVersion = "${KOTLIN_VERSION}"`,
        `    kspVersion = "${KSP_VERSION}"`,
        '}',
        '',
      ].join('\n');
      contents = contents.replace(/^(buildscript\s*\{)/m, `${ext}$1`);
    }

    config.modResults.contents = contents;
    return config;
  });

module.exports = withKotlinVersion;
