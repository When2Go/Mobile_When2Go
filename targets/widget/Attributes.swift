import ActivityKit
import Foundation

// ⚠️ 이 파일은 modules/when2go-live-activity/ios/When2GoActivityAttributes.swift 와
//    구조가 100% 동일해야 한다. ActivityKit 은 타입의 전체 이름 + Codable 구조로
//    메인 앱(Activity.request)과 위젯 익스텐션을 매칭한다. 한쪽만 바꾸면 위젯이 매칭에 실패한다.

/// 출발 타이밍 Live Activity 의 데이터 모델.
struct When2GoActivityAttributes: ActivityAttributes {
  public typealias ContentState = State

  /// Activity 수명 동안 갱신되는 동적 상태 (APNs/로컬 update 로 교체).
  public struct State: Codable, Hashable {
    /// 첫 대중교통 탑승까지 남은 분.
    var transitMinutes: Int
    /// 탑승 시각 표시 텍스트 ("오후 1:27").
    var transitTimeText: String
    /// 캐릭터 프로그레스 바 진행도 (0.0 ~ 1.0).
    var progress: Double
    /// LLM 안내 메시지 (F-W04) — "지금 나가면 딱 맞아요! 🚶‍♂️".
    var llmMessage: String
    /// LLM 보조 문구 — "도보 12분 → 인하대역".
    var llmSub: String
    /// 탑승 시각 epoch(초). 이 시점 이후로는 stale 처리되고 종료 대상이 된다.
    var boardingEpoch: Double
  }

  /// Activity 시작 시 고정되는 정적 정보.
  /// 목적지 (F-W05) — "강남역".
  var destination: String
  /// 대중교통 노선명 — "수인분당선".
  var transitName: String
  /// 탑승 승강장 — "인하대역 승강장".
  var transitStation: String
  /// 프로그레스 바 중간 라벨(탑승역) — "인하대역".
  var boardingStationName: String
  /// 최종 도착 예정 시각 텍스트 — "오후 2:05".
  var arrivalTimeText: String
}
