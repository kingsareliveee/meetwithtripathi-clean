-- 🎥 ANONYMOUS MEETING SYSTEM - NO LOGIN REQUIRED
-- Add support for anonymous video calls without authentication

-- Step 1: Add columns to meetings table for anonymous support
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;

-- Step 2: Allow NULL host_id for anonymous meetings
ALTER TABLE meetings ALTER COLUMN host_id DROP NOT NULL;

-- Step 3: Create anonymous_participants table (separate from authenticated participants)
CREATE TABLE IF NOT EXISTS anonymous_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  anonymous_user_id VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  UNIQUE(meeting_id, anonymous_user_id)
);

-- Create indexes for anonymous_participants
CREATE INDEX IF NOT EXISTS idx_anonymous_participants_meeting_id ON anonymous_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_participants_user_id ON anonymous_participants(anonymous_user_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_participants_joined_at ON anonymous_participants(joined_at DESC);

-- Step 4: Enable RLS on anonymous_participants
ALTER TABLE anonymous_participants ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read and insert anonymous participants
CREATE POLICY anonymous_participants_select ON anonymous_participants
  FOR SELECT USING (true);

CREATE POLICY anonymous_participants_insert ON anonymous_participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY anonymous_participants_update ON anonymous_participants
  FOR UPDATE USING (true);

-- Step 5: Create view for active anonymous meetings
CREATE OR REPLACE VIEW active_anonymous_meetings AS
SELECT
  m.id,
  m.room_code,
  m.title,
  m.is_anonymous,
  m.created_at,
  COUNT(DISTINCT ap.id) as participant_count
FROM meetings m
LEFT JOIN anonymous_participants ap ON m.id = ap.meeting_id AND ap.left_at IS NULL
WHERE m.ended_at IS NULL AND m.is_anonymous = true
GROUP BY m.id, m.room_code, m.title, m.is_anonymous, m.created_at;

-- Step 6: Update RLS on meetings to allow anonymous access
DROP POLICY IF EXISTS "meetings_select_all" ON meetings;
DROP POLICY IF EXISTS "meetings_insert_own" ON meetings;

CREATE POLICY meetings_select_all ON meetings
  FOR SELECT USING (is_anonymous = true OR auth.uid() IS NOT NULL);

CREATE POLICY meetings_insert_anon ON meetings
  FOR INSERT WITH CHECK (is_anonymous = true OR auth.uid() = host_id);

CREATE POLICY meetings_insert_authenticated ON meetings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);

-- Step 7: Grant permissions to anon role
GRANT SELECT, INSERT ON meetings TO anon;
GRANT SELECT, INSERT, UPDATE ON anonymous_participants TO anon;
GRANT SELECT ON active_anonymous_meetings TO anon;

-- Add comments
COMMENT ON TABLE anonymous_participants IS 'Participants in anonymous video calls - no authentication required';
COMMENT ON VIEW active_anonymous_meetings IS 'Currently active anonymous video meetings with participant counts';
