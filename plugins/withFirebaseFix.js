const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// RNFBApp을 clang module로 취급하면 RNFBMessaging이 헤더를 비모듈 방식으로
// include할 때 'must be imported from module' 에러가 발생한다.
// DEFINES_MODULE = NO 로 모듈 경계를 제거하고,
// CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES 로 비모듈 include를 허용한다.
const RNFB_TARGETS = ['RNFBApp', 'RNFBMessaging'];

const withFirebaseFix = (config) =>
  withDangerousMod(config, [
    'ios',
    (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf8');

      if (!contents.includes('CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES')) {
        const targetNames = RNFB_TARGETS.map((t) => `'${t}'`).join(', ');
        const fix = [
          `  installer.pods_project.targets.each do |target|`,
          `    target.build_configurations.each do |config|`,
          `      config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'`,
          `      if [${targetNames}].include?(target.name)`,
          `        config.build_settings['DEFINES_MODULE'] = 'NO'`,
          `      end`,
          `    end`,
          `  end`,
        ].join('\n');

        contents = contents.replace(
          'post_install do |installer|',
          `post_install do |installer|\n${fix}`,
        );
        fs.writeFileSync(podfilePath, contents);
      }

      return config;
    },
  ]);

module.exports = withFirebaseFix;
