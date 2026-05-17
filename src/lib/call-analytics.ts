import { supabase } from "@/integrations/supabase/client";

/**
 * 🎥 PREMIUM CALL ANALYTICS SERVICE
 * Track complete call quality, performance metrics & participant engagement
 */

export interface CallAnalyticsData {
  meetingId: string;
  participantId: string;
  videoBitrate?: number;
  videoFps?: number;
  audioQuality?: "poor" | "fair" | "good" | "excellent";
  networkLatency?: number;
  packetLoss?: number;
  isMutedVideo?: boolean;
  isMutedAudio?: boolean;
  screenShareDuration?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  overallQualityScore?: number;
}

/**
 * Log call analytics to database
 */
export async function logCallAnalytics(data: CallAnalyticsData) {
  const { error } = await supabase.from("call_analytics").insert({
    meeting_id: data.meetingId,
    participant_id: data.participantId,
    video_bitrate_kbps: data.videoBitrate,
    video_fps: data.videoFps,
    network_latency_ms: data.networkLatency,
    packet_loss_percentage: data.packetLoss,
    is_muted_video: data.isMutedVideo,
    is_muted_audio: data.isMutedAudio,
    screen_share_duration_seconds: data.screenShareDuration,
    cpu_usage_percentage: data.cpuUsage,
    memory_usage_mb: data.memoryUsage,
    overall_call_quality_score: data.overallQualityScore,
    session_id: `session_${Date.now()}`,
  });

  if (error) {
    console.error("❌ Analytics logging failed:", error);
    throw error;
  }
}

/**
 * Get call statistics for a meeting
 */
export async function getMeetingCallStats(meetingId: string) {
  const { data, error } = await supabase
    .from("call_quality_statistics")
    .select("*")
    .eq("meeting_id", meetingId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("❌ Failed to fetch stats:", error);
    throw error;
  }

  return data;
}

/**
 * Get all analytics for a participant
 */
export async function getParticipantAnalytics(participantId: string) {
  const { data, error } = await supabase
    .from("call_analytics")
    .select("*")
    .eq("participant_id", participantId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Failed to fetch participant analytics:", error);
    throw error;
  }

  return data;
}

/**
 * Update call metrics in real-time
 */
export async function updateCallMetrics(
  analyticsId: string,
  metrics: Partial<CallAnalyticsData>
) {
  const { error } = await supabase
    .from("call_analytics")
    .update({
      video_bitrate_kbps: metrics.videoBitrate,
      video_fps: metrics.videoFps,
      network_latency_ms: metrics.networkLatency,
      packet_loss_percentage: metrics.packetLoss,
      cpu_usage_percentage: metrics.cpuUsage,
      memory_usage_mb: metrics.memoryUsage,
      overall_call_quality_score: metrics.overallQualityScore,
    })
    .eq("id", analyticsId);

  if (error) {
    console.error("❌ Metrics update failed:", error);
    throw error;
  }
}

/**
 * Calculate quality score based on metrics (0-100)
 */
export function calculateQualityScore(
  videoBitrate: number,
  videoFps: number,
  latency: number,
  packetLoss: number
): number {
  let score = 100;

  // Video bitrate scoring
  if (videoBitrate < 500) score -= 30;
  else if (videoBitrate < 1000) score -= 15;

  // FPS scoring
  if (videoFps < 24) score -= 25;
  else if (videoFps < 30) score -= 10;

  // Latency scoring
  if (latency > 300) score -= 30;
  else if (latency > 150) score -= 15;

  // Packet loss scoring
  if (packetLoss > 5) score -= 30;
  else if (packetLoss > 2) score -= 15;

  return Math.max(0, Math.min(100, score));
}

/**
 * Get quality status emoji
 */
export function getQualityStatusEmoji(score: number): string {
  if (score >= 80) return "🟢";
  if (score >= 60) return "🟡";
  if (score >= 40) return "🟠";
  return "🔴";
}
