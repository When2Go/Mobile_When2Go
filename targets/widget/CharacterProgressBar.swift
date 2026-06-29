import SwiftUI

/// F-W03 — 🏃 캐릭터가 진행도를 따라 이동하는 프로그레스 바.
/// 시안의 출발지 / 탑승역(emerald) / 목적지 3구간 라벨을 함께 그린다.
struct CharacterProgressBar: View {
  let progress: Double
  let boardingStationName: String
  let destination: String
  /// Dynamic Island expanded 등 좁은 영역에서는 라벨을 숨긴다.
  var showsLabels: Bool = true

  private var clamped: Double { min(max(progress, 0), 1) }

  var body: some View {
    VStack(spacing: showsLabels ? 14 : 0) {
      GeometryReader { geo in
        let width = geo.size.width
        ZStack(alignment: .leading) {
          Capsule().fill(WidgetTheme.track)
          Capsule()
            .fill(WidgetTheme.progressGradient)
            .frame(width: max(width * clamped, 4))
          Text("🏃")
            .font(.system(size: 15))
            // 🏃 이모지는 기본적으로 왼쪽을 보고 달린다. 진행도는 좌→우로 가므로
            // 좌우반전해 이동 방향(오른쪽)을 보도록 한다.
            .scaleEffect(x: -1, y: 1)
            .position(x: width * clamped, y: -8)
        }
      }
      .frame(height: 6)

      if showsLabels {
        HStack {
          progressLabel(systemImage: "house.fill", text: "출발지", tint: WidgetTheme.textSecondary)
          Spacer()
          progressLabel(systemImage: "tram.fill", text: boardingStationName, tint: WidgetTheme.positive)
          Spacer()
          progressLabel(systemImage: "flag.fill", text: destination, tint: WidgetTheme.textSecondary)
        }
      }
    }
  }

  private func progressLabel(systemImage: String, text: String, tint: Color) -> some View {
    VStack(spacing: 2) {
      Image(systemName: systemImage).font(.system(size: 9))
      Text(text).font(.system(size: 10, weight: .semibold))
    }
    .foregroundStyle(tint)
  }
}
