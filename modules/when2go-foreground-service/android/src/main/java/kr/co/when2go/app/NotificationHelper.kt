package kr.co.when2go.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.widget.RemoteViews

/** 출발 타이밍 위젯(F-W02~F-W06)을 Ongoing Notification 으로 그리는 헬퍼. */
object NotificationHelper {
  const val CHANNEL_ID = "when2go_foreground"
  const val NOTIFICATION_ID = 10001

  private const val CHANNEL_NAME = "출발 타이밍 위젯"
  private const val CHANNEL_DESC = "잠금화면/알림 영역에 출발 타이밍을 표시합니다."

  /** Android 8.0+ 알림 채널 생성(중요도 HIGH — 잠금화면 노출·헤드업). */
  fun createNotificationChannel(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = context.getSystemService(NotificationManager::class.java) ?: return
    if (manager.getNotificationChannel(CHANNEL_ID) != null) return

    val channel = NotificationChannel(
      CHANNEL_ID,
      CHANNEL_NAME,
      NotificationManager.IMPORTANCE_HIGH,
    ).apply {
      description = CHANNEL_DESC
      setShowBadge(false)
    }
    manager.createNotificationChannel(channel)
  }

  /** RemoteViews 커스텀 레이아웃으로 Ongoing Notification 을 빌드한다. */
  fun buildNotification(
    context: Context,
    attrs: ForegroundServiceData.Attributes,
    state: ForegroundServiceData.State,
  ): Notification {
    val remoteViews = buildRemoteViews(context, attrs, state)

    return Notification.Builder(context, CHANNEL_ID).apply {
      setSmallIcon(android.R.drawable.ic_dialog_info)
      setCustomContentView(remoteViews)
      setCustomBigContentView(remoteViews)
      setOngoing(true)
      setOnlyAlertOnce(true)
      style = Notification.DecoratedCustomViewStyle()
      addAction(buildStopAction(context))
    }.build()
  }

  private fun buildRemoteViews(
    context: Context,
    attrs: ForegroundServiceData.Attributes,
    state: ForegroundServiceData.State,
  ): RemoteViews {
    val layoutId = context.resources.getIdentifier(
      "notification_widget",
      "layout",
      context.packageName,
    )
    val views = RemoteViews(context.packageName, layoutId)

    views.setTextViewText(idOf(context, "widget_arrival_time"), attrs.arrivalTimeText)
    views.setTextViewText(idOf(context, "widget_llm_message"), state.llmMessage)
    views.setTextViewText(idOf(context, "widget_llm_sub"), state.llmSub)
    views.setTextViewText(idOf(context, "widget_boarding_station"), attrs.boardingStationName)
    views.setTextViewText(idOf(context, "widget_destination"), attrs.destination)
    views.setTextViewText(idOf(context, "widget_transit_name"), attrs.transitName)
    views.setTextViewText(idOf(context, "widget_transit_station"), attrs.transitStation)
    views.setTextViewText(
      idOf(context, "widget_transit_minutes"),
      "${state.transitMinutes}분",
    )
    views.setTextViewText(idOf(context, "widget_transit_time"), state.transitTimeText)

    val progressPercent = (state.progress.coerceIn(0.0, 1.0) * 100).toInt()
    views.setProgressBar(idOf(context, "widget_progress"), 100, progressPercent, false)

    return views
  }

  private fun idOf(context: Context, name: String): Int =
    context.resources.getIdentifier(name, "id", context.packageName)

  /** "위젯 끄기"(F-W06) 액션 — Service 에 stop 브로드캐스트를 보낸다. */
  private fun buildStopAction(context: Context): Notification.Action {
    val intent = Intent(context, When2GoForegroundService.StopReceiver::class.java).apply {
      action = When2GoForegroundService.ACTION_STOP
    }
    val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    } else {
      PendingIntent.FLAG_UPDATE_CURRENT
    }
    val pendingIntent = PendingIntent.getBroadcast(context, 0, intent, flags)
    return Notification.Action.Builder(
      android.R.drawable.ic_menu_close_clear_cancel,
      "위젯 끄기",
      pendingIntent,
    ).build()
  }

  /** 알림 갱신(상태만 다시 그림). */
  fun updateNotification(
    context: Context,
    attrs: ForegroundServiceData.Attributes,
    state: ForegroundServiceData.State,
  ) {
    val manager = context.getSystemService(NotificationManager::class.java) ?: return
    manager.notify(NOTIFICATION_ID, buildNotification(context, attrs, state))
  }
}
