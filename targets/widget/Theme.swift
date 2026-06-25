import SwiftUI

// 디자인 시안(../design/src/app/pages/LockWidget.tsx)의 다크 Live Activity 톤을 SwiftUI 로 옮긴 토큰.
// 잠금화면 위젯은 시안과 동일하게 어두운 카드로 통일한다(앱 본문 라이트모드 정책과 별개 — OS 위젯 영역).
enum WidgetTheme {
  // Brand
  static let accent = Color(red: 0.15, green: 0.39, blue: 0.92) // blue-600
  static let accentSoft = Color(red: 0.38, green: 0.49, blue: 0.96) // indigo-400
  static let positive = Color(red: 0.20, green: 0.83, blue: 0.60) // emerald-400

  // Surfaces
  static let card = Color(red: 0.11, green: 0.11, blue: 0.12) // zinc-900
  static let cardSoft = Color.white.opacity(0.10)
  static let hairline = Color.white.opacity(0.10)
  static let track = Color.white.opacity(0.15)

  // Text
  static let textPrimary = Color.white
  static let textSecondary = Color(red: 0.63, green: 0.66, blue: 0.71) // zinc-400
  static let textOnAccent = Color(red: 0.58, green: 0.72, blue: 0.99) // blue-300

  static let progressGradient = LinearGradient(
    colors: [accent, accentSoft],
    startPoint: .leading,
    endPoint: .trailing
  )
}

enum WidgetMetric {
  static let cardRadius: CGFloat = 22
  static let innerRadius: CGFloat = 12
  static let gap: CGFloat = 10
  static let hPadding: CGFloat = 14
}
