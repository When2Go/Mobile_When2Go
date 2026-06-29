package kr.co.when2go.app

import android.content.Intent
import android.os.Build
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * RN ↔ Android Foreground Service 브리지.
 * 로컬에서 위젯을 start/update/stop 한다. 보통 FCM data 메시지가 start 를 트리거한다.
 * 실제 데이터 흐름은 src/hooks/widget/useForegroundService.ts 참조.
 */
class When2GoForegroundServiceModule : Module() {
  private val context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("When2GoForegroundService")

    Function("isRunning") {
      When2GoForegroundService.currentState != null
    }

    AsyncFunction("start") { attributes: Map<String, Any?>, state: Map<String, Any?> ->
      When2GoForegroundService.currentAttributes =
        ForegroundServiceData.Attributes.fromMap(attributes)
      When2GoForegroundService.currentState =
        ForegroundServiceData.State.fromMap(state)

      val intent = Intent(context, When2GoForegroundService::class.java)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
    }

    AsyncFunction("update") { state: Map<String, Any?> ->
      val attrs = When2GoForegroundService.currentAttributes ?: return@AsyncFunction
      val newState = ForegroundServiceData.State.fromMap(state)
      When2GoForegroundService.currentState = newState
      NotificationHelper.updateNotification(context, attrs, newState)
    }

    AsyncFunction("stop") {
      context.stopService(Intent(context, When2GoForegroundService::class.java))
    }
  }
}
