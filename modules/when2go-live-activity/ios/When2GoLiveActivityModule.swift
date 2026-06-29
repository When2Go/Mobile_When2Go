import ActivityKit
import ExpoModulesCore

// 출발 10분 전 APNs 푸시로 Live Activity 를 시작하고, 첫 대중교통 탑승 시점에 종료하는
// RN ↔ ActivityKit 브리지. 실제 데이터 흐름은 src/hooks/widget/useLiveActivity.ts 참조.

/// JS 에서 넘어오는 Activity 정적 정보.
struct StartAttributesRecord: Record {
  @Field var destination: String = ""
  @Field var transitName: String = ""
  @Field var transitStation: String = ""
  @Field var boardingStationName: String = ""
  @Field var arrivalTimeText: String = ""
}

/// JS 에서 넘어오는 Activity 동적 상태.
struct ContentStateRecord: Record {
  @Field var transitMinutes: Int = 0
  @Field var transitTimeText: String = ""
  @Field var progress: Double = 0
  @Field var llmMessage: String = ""
  @Field var llmSub: String = ""
  @Field var boardingEpoch: Double = 0
}

public class When2GoLiveActivityModule: Module {
  /// 동시에 하나의 출발 타이밍 Activity 만 유지한다.
  private var currentActivity: Any?
  private var pushToStartObserver: Task<Void, Never>?
  private var pushTokenObserver: Task<Void, Never>?

  public func definition() -> ModuleDefinition {
    Name("When2GoLiveActivity")

    Events("onPushToStartToken", "onActivityPushToken", "onActivityEnd")

    // 디바이스가 Live Activity 를 켤 수 있는지 (설정에서 끈 경우 false).
    Function("areActivitiesEnabled") { () -> Bool in
      guard #available(iOS 16.2, *) else { return false }
      return ActivityAuthorizationInfo().areActivitiesEnabled
    }

    Function("isRunning") { () -> Bool in
      guard #available(iOS 16.2, *) else { return false }
      return !Activity<When2GoActivityAttributes>.activities.isEmpty
    }

    // 로컬에서 즉시 Activity 시작(포그라운드 폴백). 보통은 APNs push-to-start 가 시작한다.
    AsyncFunction("start") { (attributes: StartAttributesRecord, state: ContentStateRecord) -> String? in
      guard #available(iOS 16.2, *) else {
        throw LiveActivityUnavailableException()
      }
      guard ActivityAuthorizationInfo().areActivitiesEnabled else {
        throw LiveActivityDisabledException()
      }

      // 이미 떠 있는 같은 타입 Activity 가 있으면 모두 갱신만 한다(중복 카드 방지).
      // currentActivity 참조는 앱 재시작·JS 리로드 후 nil 이 될 수 있어 실제 목록을 본다.
      let existing = Activity<When2GoActivityAttributes>.activities
      if let first = existing.first {
        let content = ActivityContent(state: state.toState(), staleDate: state.staleDate())
        for activity in existing {
          await activity.update(content)
        }
        self.currentActivity = first
        return first.id
      }

      let attrs = attributes.toAttributes()
      let content = ActivityContent(state: state.toState(), staleDate: state.staleDate())

      do {
        let activity = try Activity.request(
          attributes: attrs,
          content: content,
          pushType: .token
        )
        self.currentActivity = activity
        self.observePushToken(for: activity)
        return activity.id
      } catch {
        throw LiveActivityStartException(error.localizedDescription)
      }
    }

    AsyncFunction("update") { (state: ContentStateRecord) in
      guard #available(iOS 16.2, *) else { return }
      let content = ActivityContent(state: state.toState(), staleDate: state.staleDate())
      for activity in Activity<When2GoActivityAttributes>.activities {
        await activity.update(content)
      }
    }

    // 위젯 끄기(F-W06) / 첫 대중교통 탑승 시점 종료.
    // 떠 있는 모든 같은 타입 Activity 를 종료해 참조 유실·중복 카드 상황에서도 확실히 정리한다.
    AsyncFunction("end") { (showFinalState: Bool) in
      guard #available(iOS 16.2, *) else { return }
      let policy: ActivityUIDismissalPolicy = showFinalState ? .default : .immediate
      for activity in Activity<When2GoActivityAttributes>.activities {
        await activity.end(nil, dismissalPolicy: policy)
      }
      self.currentActivity = nil
      self.sendEvent("onActivityEnd", [:])
    }

    // push-to-start 토큰 구독 시작 (iOS 17.2+). 백엔드가 이 토큰으로 앱이 꺼져 있어도 Activity 를 시작한다.
    Function("registerForPushToStartToken") {
      guard #available(iOS 17.2, *) else { return }
      self.observePushToStartToken()
    }

    OnDestroy {
      self.pushToStartObserver?.cancel()
      self.pushTokenObserver?.cancel()
    }
  }

  @available(iOS 17.2, *)
  private func observePushToStartToken() {
    pushToStartObserver?.cancel()
    pushToStartObserver = Task {
      for await tokenData in Activity<When2GoActivityAttributes>.pushToStartTokenUpdates {
        let token = tokenData.map { String(format: "%02x", $0) }.joined()
        self.sendEvent("onPushToStartToken", ["token": token])
      }
    }
  }

  @available(iOS 16.2, *)
  private func observePushToken(for activity: Activity<When2GoActivityAttributes>) {
    pushTokenObserver?.cancel()
    pushTokenObserver = Task {
      for await tokenData in activity.pushTokenUpdates {
        let token = tokenData.map { String(format: "%02x", $0) }.joined()
        self.sendEvent("onActivityPushToken", ["token": token, "activityId": activity.id])
      }
    }
  }
}

// MARK: - Record → ActivityKit 변환

@available(iOS 16.2, *)
private extension StartAttributesRecord {
  func toAttributes() -> When2GoActivityAttributes {
    When2GoActivityAttributes(
      destination: destination,
      transitName: transitName,
      transitStation: transitStation,
      boardingStationName: boardingStationName,
      arrivalTimeText: arrivalTimeText
    )
  }
}

@available(iOS 16.2, *)
private extension ContentStateRecord {
  func toState() -> When2GoActivityAttributes.ContentState {
    When2GoActivityAttributes.ContentState(
      transitMinutes: transitMinutes,
      transitTimeText: transitTimeText,
      progress: progress,
      llmMessage: llmMessage,
      llmSub: llmSub,
      boardingEpoch: boardingEpoch
    )
  }

  /// 탑승 시각을 stale 기준으로 사용 — 이 시점 이후 카드가 흐려진다.
  func staleDate() -> Date? {
    boardingEpoch > 0 ? Date(timeIntervalSince1970: boardingEpoch) : nil
  }
}

// MARK: - 예외

private class LiveActivityUnavailableException: Exception {
  override var reason: String { "Live Activity 는 iOS 16.2 이상에서만 지원됩니다." }
}

private class LiveActivityDisabledException: Exception {
  override var reason: String { "설정에서 Live Activity 가 꺼져 있습니다." }
}

private class LiveActivityStartException: GenericException<String> {
  override var reason: String { "Live Activity 시작 실패: \(param)" }
}
