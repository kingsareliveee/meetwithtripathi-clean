/**
 * 🎥 ANONYMOUS VIDEO CALL SYSTEM
 * No login required - just hop into a call!
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Generate anonymous user data (no DB storage needed)
 */
export function generateAnonymousUser() {
  const adjectives = [
    "Happy",
    "Cool",
    "Smart",
    "Swift",
    "Bright",
    "Clever",
    "Bold",
    "Quick",
  ];
  const animals = [
    "Panda",
    "Eagle",
    "Tiger",
    "Fox",
    "Whale",
    "Phoenix",
    "Falcon",
    "Dragon",
  ];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];

  return {
    id: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    displayName: `${adj} ${animal}`,
    isAnonymous: true,
  };
}

const MEETINGS_STORAGE_KEY = "meetWithTripathi_meetings";
const PARTICIPANTS_STORAGE_KEY = "meetWithTripathi_participants";

function getMeetingsFromStorage() {
  try {
    const data = localStorage.getItem(MEETINGS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveMeetingsToStorage(meetings: any) {
  try {
    localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(meetings));
  } catch {
    console.warn("Failed to save");
  }
}

function getParticipantsFromStorage() {
  try {
    const data = localStorage.getItem(PARTICIPANTS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveParticipantsToStorage(participants: any) {
  try {
    localStorage.setItem(PARTICIPANTS_STORAGE_KEY, JSON.stringify(participants));
  } catch {
    console.warn("Failed to save");
  }
}

/**
 * Create anonymous meeting (no host required)
 */
export async function createAnonymousMeeting(title?: string) {
  const room_code = generateRoomCode();
  const meetingData = {
    id: `meet_${Date.now()}`,
    room_code,
    title: title || null,
    is_anonymous: true,
    host_id: null,
    created_at: new Date().toISOString(),
    ended_at: null,
  };

  try {
    const { data, error } = await supabase
      .from("meetings")
      .insert({
        room_code,
        title: title || null,
        is_anonymous: true,
        host_id: null,
      })
      .select()
      .single();

    if (!error && data) return data;
  } catch (e) {
    console.warn("Using localStorage fallback");
  }

  const meetings = getMeetingsFromStorage();
  meetings[room_code] = meetingData;
  saveMeetingsToStorage(meetings);
  return meetingData;
}

/**
 * Join anonymous meeting
 */
export async function joinAnonymousMeeting(
  meetingId: string,
  displayName: string
) {
  const anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const participantData = {
    id: anonymousId,
    meeting_id: meetingId,
    anonymous_user_id: anonymousId,
    display_name: displayName,
    joined_at: new Date().toISOString(),
    left_at: null,
  };

  try {
    const { error } = await supabase.from("anonymous_participants").insert({
      meeting_id: meetingId,
      anonymous_user_id: anonymousId,
      display_name: displayName,
    });
    if (!error) return anonymousId;
  } catch (e) {
    console.warn("Using localStorage fallback");
  }

  const participants = getParticipantsFromStorage();
  if (!participants[meetingId]) participants[meetingId] = [];
  participants[meetingId].push(participantData);
  saveParticipantsToStorage(participants);
  return anonymousId;
}

/**
 * Generate unique room code
 */
export function generateRoomCode(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  const seg = (n: number) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${seg(4)}-${seg(4)}`;
}

/**
 * Get meeting by code (anonymous or authenticated)
 */
export async function getMeetingByCodeAnonymous(code: string) {
  try {
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("room_code", code)
      .maybeSingle();

    if (!error && data) return data;
  } catch (e) {
    console.warn("Checking localStorage");
  }

  const meetings = getMeetingsFromStorage();
  if (meetings[code]) return meetings[code];
  return null;
}

/**
 * Get active participants in a meeting
 */
export async function getActiveMeetingParticipants(meetingId: string) {
  try {
    const { data, error } = await supabase
      .from("anonymous_participants")
      .select("*")
      .eq("meeting_id", meetingId)
      .is("left_at", null)
      .order("joined_at", { ascending: true });

    if (!error && data) return data;
  } catch (e) {
    console.warn("Checking localStorage");
  }

  const participants = getParticipantsFromStorage();
  if (participants[meetingId]) {
    return participants[meetingId].filter((p: any) => !p.left_at);
  }
  return [];
}

/**
 * Leave anonymous meeting
 */
export async function leaveAnonymousMeeting(
  meetingId: string,
  participantId: string
) {
  try {
    await supabase
      .from("anonymous_participants")
      .update({ left_at: new Date().toISOString() })
      .eq("meeting_id", meetingId)
      .eq("anonymous_user_id", participantId);
  } catch (e) {
    console.warn("Using localStorage fallback");
  }

  const participants = getParticipantsFromStorage();
  if (participants[meetingId]) {
    const participant = participants[meetingId].find((p: any) => p.anonymous_user_id === participantId);
    if (participant) {
      participant.left_at = new Date().toISOString();
      saveParticipantsToStorage(participants);
    }
  }
}
