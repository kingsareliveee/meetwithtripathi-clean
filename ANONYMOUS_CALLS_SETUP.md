# 🎥 ANONYMOUS VIDEO CALL SETUP - STEP BY STEP

## ⚡ Quick Fix Required

Your Supabase database needs the migration scripts applied to enable anonymous video calls. Here's exactly what to do:

---

## 🔧 STEP 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Click your project: **yyfqjjgqgcvzwhwfowzk**
3. Go to: **SQL Editor** (left sidebar)
4. Click: **New Query**

---

## 📝 STEP 2: Copy First Migration Script

**Copy the ENTIRE content** from this file:
```
supabase/migrations/20260516_anonymous_meetings.sql
```

Then:
1. Paste it into Supabase SQL Editor
2. Click **Run** (or press Ctrl+Enter)
3. Wait for "Success" message

---

## 📝 STEP 3: Copy Second Migration Script

**Copy the ENTIRE content** from this file:
```
supabase/migrations/20260516_call_analytics_premium.sql
```

Then:
1. Create a **New Query** in Supabase
2. Paste the content
3. Click **Run**
4. Wait for "Success" message

---

## ✅ STEP 4: Test It Works

1. Go to: http://localhost:8080/start
2. Click the **"Start Now"** button
3. You should see a room code like: **abcd-1234**
4. You'll be redirected to the video call page

---

## 🆘 If It Still Fails

Check these things:

### Error: "Failed to create meeting"
- ❌ Migration not applied
- ✅ Solution: Re-run the migration scripts in Supabase

### Error: "Column does not exist"
- ❌ Migrations ran but incomplete
- ✅ Solution: Check for error messages in Supabase, clear the error

### Error: "Permission denied"
- ❌ RLS policies not correct
- ✅ Solution: Go to Supabase > Authentication > Policies and check that `anonymous_participants` table allows anon access

---

## 📊 What These Migrations Do

### Migration 1: `20260516_anonymous_meetings.sql`
- ✅ Allows `host_id` to be NULL (for anonymous meetings)
- ✅ Creates `anonymous_participants` table
- ✅ Sets up RLS policies to allow anonymous access
- ✅ Creates views for statistics

### Migration 2: `20260516_call_analytics_premium.sql`
- ✅ Creates `call_analytics` table for tracking call quality
- ✅ Stores metrics: video bitrate, audio quality, network latency, etc.
- ✅ Creates materialized view for statistics

---

## 🎯 Features After Setup

✅ **Anonymous video calls** - No login needed!
✅ **Room codes** - Share code to invite friends
✅ **Call analytics** - Track quality metrics
✅ **Participant tracking** - See who's in the call
✅ **Multi-user** - Multiple people can join same room

---

## 🚀 Next Steps (AFTER migrations work)

1. Test creating a call: http://localhost:8080/start
2. Copy the room code
3. Open another browser tab/window
4. Go to: http://localhost:8080/start
5. Paste the room code and join!
6. Enjoy video calls! 🎥

---

## 💡 Pro Tips

- Room codes: `abcd-1234` format (lowercase letters, numbers)
- Display names: Auto-generated like "Happy Panda", "Cool Eagle"
- Change name: Click on your name during the call
- Copy code: Click the "Copy Code" button
- Share link: Click the "Share" button to send the full URL

---

**Let me know when the migrations are done and I'll help debug any issues!** 🆘
