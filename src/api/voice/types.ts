export interface TripParseResponse {
  startLocation: string | null;
  endLocation: string;
  /** "YYYY-MM-DD HH:mm" 형식 (공백 구분, 24h). null이면 음성에서 시간 미언급. */
  appointmentTime: string | null;
}
