# MeetwithTripathi

A clean anonymous WebRTC video calling web app built with React, Vite, TypeScript, Tailwind CSS, Supabase, Zustand, and Framer Motion.

## Features

- anonymous room creation and joining with a shared room code
- local and remote video streams
- real-time chat via Supabase Realtime
- mic and camera toggle controls
- lightweight, modern glassmorphism UI

## Setup

1. Copy `.env` from the root and set:

```env
VITE_SUPABASE_URL=<your supabase url>
VITE_SUPABASE_ANON_KEY=<your anon key>
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Open the app in your browser at `http://localhost:5173`.

## How to use

- Click **Create room** to generate a new anonymous room code.
- Share the room code with another user.
- The second user enters the code and clicks **Join room**.
- Both users should see each other’s camera feed and be able to chat live.

## Notes

- Supabase is used only for realtime signaling and chat.
- No login or authentication is required.
- The app uses Google STUN servers for WebRTC connection setup.
