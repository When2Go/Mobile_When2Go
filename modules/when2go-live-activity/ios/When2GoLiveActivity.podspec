Pod::Spec.new do |s|
  s.name           = 'When2GoLiveActivity'
  s.version        = '1.0.0'
  s.summary        = 'When2Go iOS Live Activity (ActivityKit) 네이티브 브리지'
  s.description    = 'RN → ActivityKit start/update/end + push token 로컬 Expo 모듈'
  s.author         = 'When2Go'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '15.1'
  }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C 호환
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
