import SwiftUI
import WidgetKit

/// When2Go 위젯 익스텐션 진입점.
/// 현재는 Live Activity(잠금화면·Dynamic Island) 하나만 포함한다.
/// 홈 화면 정적 위젯은 별도 이슈에서 추가한다.
@main
struct When2GoWidgetBundle: WidgetBundle {
  var body: some Widget {
    When2GoLiveActivity()
  }
}
