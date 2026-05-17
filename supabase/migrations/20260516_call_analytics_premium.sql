-- 🚀 TAGDI CALL ANALYTICS TABLE - Complete Meeting Intelligence System
CREATE TABLE IF NOT EXISTS call_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  
  -- 📊 CALL DURATION & TIMING
  call_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  call_ended_at TIMESTAMPTZ,
  actual_duration_seconds INT,
  
  -- 🎥 VIDEO QUALITY METRICS
  video_bitrate_kbps INT,
  video_fps INT,
  video_resolution VARCHAR(20),
  video_codec VARCHAR(50),
  video_packet_loss_percentage DECIMAL(5, 2),
  video_frames_sent BIGINT,
  video_frames_received BIGINT,
  video_frames_decoded BIGINT,
  video_freeze_count INT DEFAULT 0,
  
  -- 🎤 AUDIO QUALITY METRICS
  audio_bitrate_kbps INT,
  audio_sample_rate INT,
  audio_codec VARCHAR(50),
  audio_packet_loss_percentage DECIMAL(5, 2),
  audio_echo_cancellation_enabled BOOLEAN DEFAULT TRUE,
  audio_noise_suppression_enabled BOOLEAN DEFAULT TRUE,
  audio_jitter_ms DECIMAL(5, 2),
  audio_delay_ms INT,
  
  -- 📡 NETWORK QUALITY INDICATORS
  network_latency_ms INT,
  network_jitter_ms DECIMAL(5, 2),
  bandwidth_available_mbps DECIMAL(10, 2),
  bandwidth_used_mbps DECIMAL(10, 2),
  connection_type VARCHAR(20),
  signal_strength_percentage INT,
  packet_loss_percentage DECIMAL(5, 2),
  
  -- 👥 PARTICIPANT ENGAGEMENT
  is_muted_video BOOLEAN DEFAULT FALSE,
  is_muted_audio BOOLEAN DEFAULT FALSE,
  screen_share_duration_seconds INT,
  screen_share_count INT DEFAULT 0,
  screen_share_resolution VARCHAR(20),
  times_reconnected INT DEFAULT 0,
  
  -- ⚡ PERFORMANCE METRICS
  cpu_usage_percentage DECIMAL(5, 2),
  memory_usage_mb INT,
  thermal_throttling_detected BOOLEAN DEFAULT FALSE,
  device_battery_percentage INT,
  browser_version VARCHAR(100),
  os_name VARCHAR(50),
  os_version VARCHAR(50),
  
  -- 📹 RECORDING & TRANSCRIPTION
  was_recorded BOOLEAN DEFAULT FALSE,
  recording_quality VARCHAR(20),
  transcription_enabled BOOLEAN DEFAULT FALSE,
  transcription_language VARCHAR(10),
  caption_accuracy_percentage DECIMAL(5, 2),
  
  -- 💾 METADATA & LOGGING
  session_id VARCHAR(100) UNIQUE,
  client_version VARCHAR(20),
  platform VARCHAR(50),
  is_mobile BOOLEAN DEFAULT FALSE,
  app_crash_detected BOOLEAN DEFAULT FALSE,
  error_logs TEXT,
  
  -- 🎯 QUALITY SCORE (0-100)
  overall_call_quality_score INT,
  video_quality_score INT,
  audio_quality_score INT,
  network_quality_score INT,
  
  -- 📌 TIMESTAMPS
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 🔐 CONSTRAINTS & INDEXES
  CONSTRAINT valid_quality_scores CHECK (
    overall_call_quality_score >= 0 AND overall_call_quality_score <= 100 AND
    video_quality_score >= 0 AND video_quality_score <= 100 AND
    audio_quality_score >= 0 AND audio_quality_score <= 100 AND
    network_quality_score >= 0 AND network_quality_score <= 100
  ),
  CONSTRAINT valid_percentages CHECK (
    video_packet_loss_percentage >= 0 AND video_packet_loss_percentage <= 100 AND
    audio_packet_loss_percentage >= 0 AND audio_packet_loss_percentage <= 100 AND
    packet_loss_percentage >= 0 AND packet_loss_percentage <= 100
  )
);

-- ⚡ CREATE INDEXES FOR FAST QUERIES
CREATE INDEX idx_call_analytics_meeting_id ON call_analytics(meeting_id);
CREATE INDEX idx_call_analytics_participant_id ON call_analytics(participant_id);
CREATE INDEX idx_call_analytics_created_at ON call_analytics(created_at DESC);
CREATE INDEX idx_call_analytics_session_id ON call_analytics(session_id);
CREATE INDEX idx_call_analytics_quality_score ON call_analytics(overall_call_quality_score DESC);
CREATE INDEX idx_call_analytics_duration ON call_analytics(actual_duration_seconds DESC);

-- 📊 CREATE MATERIALIZED VIEW FOR CALL STATISTICS
CREATE MATERIALIZED VIEW call_quality_statistics AS
SELECT
  m.id as meeting_id,
  COUNT(DISTINCT ca.participant_id) as total_participants,
  AVG(ca.actual_duration_seconds) as avg_duration_seconds,
  AVG(ca.overall_call_quality_score) as avg_quality_score,
  AVG(ca.video_bitrate_kbps) as avg_video_bitrate,
  AVG(ca.audio_bitrate_kbps) as avg_audio_bitrate,
  MAX(ca.network_latency_ms) as max_latency_ms,
  AVG(ca.packet_loss_percentage) as avg_packet_loss,
  COUNT(CASE WHEN ca.times_reconnected > 0 THEN 1 END) as participants_with_issues,
  COUNT(CASE WHEN ca.was_recorded THEN 1 END) as was_recorded_flag,
  m.created_at as meeting_date
FROM call_analytics ca
JOIN meetings m ON ca.meeting_id = m.id
GROUP BY m.id, m.created_at;

CREATE INDEX idx_call_quality_statistics_meeting_id ON call_quality_statistics(meeting_id);

-- 🔔 CREATE FUNCTION FOR AUTO-UPDATE TIMESTAMP
CREATE OR REPLACE FUNCTION update_call_analytics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ⏱️ CREATE TRIGGER FOR AUTO-UPDATE
CREATE TRIGGER trg_call_analytics_update
BEFORE UPDATE ON call_analytics
FOR EACH ROW
EXECUTE FUNCTION update_call_analytics_timestamp();

-- 🎯 ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE call_analytics ENABLE ROW LEVEL SECURITY;

-- 🔐 RLS POLICY - Users can only see their own call analytics
CREATE POLICY call_analytics_user_policy ON call_analytics
  FOR SELECT USING (
    participant_id = auth.uid() OR
    meeting_id IN (SELECT id FROM meetings WHERE host_id = auth.uid())
  );

-- ✅ GRANT PERMISSIONS
GRANT SELECT, INSERT, UPDATE ON call_analytics TO authenticated;
GRANT SELECT ON call_quality_statistics TO authenticated;

-- 📝 COMMENT ON TABLE
COMMENT ON TABLE call_analytics IS 'Comprehensive call quality and performance analytics for video meetings - tracks video/audio quality, network metrics, participant engagement and system performance';
