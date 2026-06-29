package kr.co.when2go.app

import android.app.NotificationManager
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper

/**
 * 출발 타이밍 위젯(F-W02)을 Ongoing Notification 으로 띄우는 Foreground Service.
 * - 15초마다 boardingEpoch 도달 여부를 확인해 도달 시 stopSelf().
 * - 현재 상태는 companion object 로 보관하며 update 시 갱신한다.
 * - 실제 데이터 흐름은 src/hooks/widget/useForegroundService.ts 참조.
 */
class When2GoForegroundService : Service() {
  private val handler = Handler(Looper.getMainLooper())
  private val tickRunnable = object : Runnable {
    override fun run() {
      val state = currentState ?: return
      if (System.currentTimeMillis() / 1000 >= state.boardingEpoch) {
        stopSelf()
        return
      }
      handler.postDelayed(this, TICK_INTERVAL_MS)
    }
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val attrs = currentAttributes
    val state = currentState
    if (attrs == null || state == null) {
      stopSelf()
      return START_NOT_STICKY
    }

    NotificationHelper.createNotificationChannel(this)
    val notification = NotificationHelper.buildNotification(this, attrs, state)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      startForeground(
        NotificationHelper.NOTIFICATION_ID,
        notification,
        ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC,
      )
    } else {
      startForeground(NotificationHelper.NOTIFICATION_ID, notification)
    }

    handler.removeCallbacks(tickRunnable)
    handler.postDelayed(tickRunnable, TICK_INTERVAL_MS)

    return START_STICKY
  }

  override fun onDestroy() {
    handler.removeCallbacks(tickRunnable)
    getSystemService(NotificationManager::class.java)
      ?.cancel(NotificationHelper.NOTIFICATION_ID)
    currentAttributes = null
    currentState = null
    super.onDestroy()
  }

  /** "위젯 끄기" 액션 → Service 중단. */
  class StopReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
      context.stopService(Intent(context, When2GoForegroundService::class.java))
    }
  }

  companion object {
    const val ACTION_STOP = "kr.co.when2go.app.FOREGROUND_SERVICE_STOP"
    private const val TICK_INTERVAL_MS = 15_000L

    /** 동시에 하나의 위젯만 유지하므로 정적 상태로 보관한다. */
    @Volatile
    var currentAttributes: ForegroundServiceData.Attributes? = null

    @Volatile
    var currentState: ForegroundServiceData.State? = null
  }
}
