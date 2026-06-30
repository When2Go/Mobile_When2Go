package kr.co.when2go.app

/** JS ↔ 네이티브로 오가는 위젯 데이터. Map<String, Any> 를 타입 있는 모델로 변환. */
object ForegroundServiceData {
  /** 위젯 시작 시 고정되는 정적 정보. */
  data class Attributes(
    val destination: String,
    val transitName: String,
    val transitStation: String,
    val boardingStationName: String,
    val arrivalTimeText: String,
  ) {
    companion object {
      fun fromMap(map: Map<String, Any?>) = Attributes(
        destination = map.str("destination"),
        transitName = map.str("transitName"),
        transitStation = map.str("transitStation"),
        boardingStationName = map.str("boardingStationName"),
        arrivalTimeText = map.str("arrivalTimeText"),
      )
    }
  }

  /** 갱신되는 동적 상태. */
  data class State(
    val transitMinutes: Int,
    val transitTimeText: String,
    val progress: Double,
    val llmMessage: String,
    val llmSub: String,
    val boardingEpoch: Long,
  ) {
    companion object {
      fun fromMap(map: Map<String, Any?>) = State(
        transitMinutes = map.int("transitMinutes"),
        transitTimeText = map.str("transitTimeText"),
        progress = map.dbl("progress"),
        llmMessage = map.str("llmMessage"),
        llmSub = map.str("llmSub"),
        boardingEpoch = map.long("boardingEpoch"),
      )
    }
  }

  private fun Map<String, Any?>.str(key: String): String = this[key]?.toString() ?: ""
  private fun Map<String, Any?>.int(key: String): Int =
    (this[key] as? Number)?.toInt() ?: this[key]?.toString()?.toDoubleOrNull()?.toInt() ?: 0
  private fun Map<String, Any?>.dbl(key: String): Double =
    (this[key] as? Number)?.toDouble() ?: this[key]?.toString()?.toDoubleOrNull() ?: 0.0
  private fun Map<String, Any?>.long(key: String): Long =
    (this[key] as? Number)?.toLong() ?: this[key]?.toString()?.toDoubleOrNull()?.toLong() ?: 0L
}
