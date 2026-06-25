import ActivityKit
import SwiftUI
import WidgetKit

// MARK: - 공용 서브뷰

/// F-W04 — LLM 안내 메시지 박스.
private struct LLMMessageBox: View {
  let message: String
  let sub: String

  var body: some View {
    VStack(alignment: .leading, spacing: 2) {
      Text(message)
        .font(.system(size: 14, weight: .bold))
        .foregroundStyle(WidgetTheme.textPrimary)
      Text(sub)
        .font(.system(size: 12))
        .foregroundStyle(WidgetTheme.textOnAccent)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(.horizontal, 12)
    .padding(.vertical, 8)
    .background(
      RoundedRectangle(cornerRadius: WidgetMetric.innerRadius)
        .fill(WidgetTheme.accent.opacity(0.20))
        .overlay(
          RoundedRectangle(cornerRadius: WidgetMetric.innerRadius)
            .stroke(WidgetTheme.accent.opacity(0.20), lineWidth: 1)
        )
    )
  }
}

/// F-W05 — 대중교통 노선·승강장·남은 시간 배지.
private struct TransitBadge: View {
  let name: String
  let station: String
  let minutes: Int
  let timeText: String

  var body: some View {
    HStack {
      HStack(spacing: 8) {
        Image(systemName: "tram.fill")
          .font(.system(size: 14))
          .foregroundStyle(WidgetTheme.positive)
          .frame(width: 30, height: 30)
          .background(Circle().fill(WidgetTheme.positive.opacity(0.20)))
        VStack(alignment: .leading, spacing: 1) {
          Text(name)
            .font(.system(size: 12, weight: .bold))
            .foregroundStyle(WidgetTheme.textPrimary)
          Text(station)
            .font(.system(size: 10))
            .foregroundStyle(WidgetTheme.textSecondary)
        }
      }
      Spacer()
      VStack(alignment: .trailing, spacing: 1) {
        Text("\(minutes)분")
          .font(.system(size: 16, weight: .black))
          .foregroundStyle(WidgetTheme.positive)
        Text("\(timeText) 출발")
          .font(.system(size: 10))
          .foregroundStyle(WidgetTheme.textSecondary)
      }
    }
    .padding(.horizontal, 12)
    .padding(.vertical, 8)
    .background(
      RoundedRectangle(cornerRadius: WidgetMetric.innerRadius)
        .fill(Color.black.opacity(0.40))
        .overlay(
          RoundedRectangle(cornerRadius: WidgetMetric.innerRadius)
            .stroke(WidgetTheme.hairline, lineWidth: 1)
        )
    )
  }
}

// MARK: - 잠금화면 카드 (F-W01)

private struct LockScreenLiveActivityView: View {
  let context: ActivityViewContext<When2GoActivityAttributes>

  var body: some View {
    let attrs = context.attributes
    let state = context.state

    VStack(spacing: WidgetMetric.gap) {
      // 헤더
      HStack {
        HStack(spacing: 8) {
          Image(systemName: "bolt.fill")
            .font(.system(size: 13))
            .foregroundStyle(.white)
            .frame(width: 24, height: 24)
            .background(RoundedRectangle(cornerRadius: 7).fill(WidgetTheme.accent))
          Text("지금 나가?")
            .font(.system(size: 12, weight: .bold))
            .foregroundStyle(WidgetTheme.textPrimary)
        }
        Spacer()
        Text("도착 \(attrs.arrivalTimeText) 예정")
          .font(.system(size: 10))
          .foregroundStyle(WidgetTheme.textSecondary)
      }

      LLMMessageBox(message: state.llmMessage, sub: state.llmSub)

      CharacterProgressBar(
        progress: state.progress,
        boardingStationName: attrs.boardingStationName,
        destination: attrs.destination
      )
      .padding(.top, 6)

      TransitBadge(
        name: attrs.transitName,
        station: attrs.transitStation,
        minutes: state.transitMinutes,
        timeText: state.transitTimeText
      )
    }
    .padding(WidgetMetric.hPadding)
    .activityBackgroundTint(WidgetTheme.card)
    .activitySystemActionForegroundColor(WidgetTheme.textPrimary)
  }
}

// MARK: - ActivityConfiguration

struct When2GoLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: When2GoActivityAttributes.self) { context in
      LockScreenLiveActivityView(context: context)
    } dynamicIsland: { context in
      let attrs = context.attributes
      let state = context.state

      return DynamicIsland {
        // Expanded
        DynamicIslandExpandedRegion(.leading) {
          HStack(spacing: 8) {
            Image(systemName: "bolt.fill")
              .font(.system(size: 14))
              .foregroundStyle(.white)
              .frame(width: 28, height: 28)
              .background(RoundedRectangle(cornerRadius: 9).fill(WidgetTheme.accent))
            VStack(alignment: .leading, spacing: 1) {
              Text("지금 나가?")
                .font(.system(size: 12, weight: .black))
                .foregroundStyle(WidgetTheme.textPrimary)
              Text("\(attrs.destination) \(attrs.arrivalTimeText) 도착")
                .font(.system(size: 10))
                .foregroundStyle(WidgetTheme.textSecondary)
            }
          }
        }
        DynamicIslandExpandedRegion(.trailing) {
          VStack(alignment: .trailing, spacing: 1) {
            Text("\(state.transitMinutes)분")
              .font(.system(size: 20, weight: .black))
              .foregroundStyle(WidgetTheme.positive)
            Text("탑승까지")
              .font(.system(size: 10))
              .foregroundStyle(WidgetTheme.textSecondary)
          }
        }
        DynamicIslandExpandedRegion(.bottom) {
          VStack(spacing: 8) {
            CharacterProgressBar(
              progress: state.progress,
              boardingStationName: attrs.boardingStationName,
              destination: attrs.destination,
              showsLabels: false
            )
            Text(state.llmMessage)
              .font(.system(size: 11, weight: .semibold))
              .foregroundStyle(WidgetTheme.textOnAccent)
              .frame(maxWidth: .infinity, alignment: .leading)
            HStack {
              HStack(spacing: 6) {
                Image(systemName: "tram.fill")
                  .font(.system(size: 12))
                  .foregroundStyle(WidgetTheme.positive)
                Text(attrs.transitName)
                  .font(.system(size: 11, weight: .bold))
                  .foregroundStyle(WidgetTheme.textPrimary)
              }
              Spacer()
              Text(state.transitTimeText)
                .font(.system(size: 11, weight: .black))
                .foregroundStyle(WidgetTheme.positive)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(RoundedRectangle(cornerRadius: 10).fill(WidgetTheme.cardSoft))
          }
        }
      } compactLeading: {
        Image(systemName: "bolt.fill")
          .font(.system(size: 12))
          .foregroundStyle(WidgetTheme.accentSoft)
      } compactTrailing: {
        Text("\(state.transitMinutes)분")
          .font(.system(size: 13, weight: .black))
          .foregroundStyle(WidgetTheme.positive)
      } minimal: {
        Text("\(state.transitMinutes)")
          .font(.system(size: 12, weight: .black))
          .foregroundStyle(WidgetTheme.positive)
      }
      .widgetURL(URL(string: "when2go://trip"))
      .keylineTint(WidgetTheme.accent)
    }
  }
}
