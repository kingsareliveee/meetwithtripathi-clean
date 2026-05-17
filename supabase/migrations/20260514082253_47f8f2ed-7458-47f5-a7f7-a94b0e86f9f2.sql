
-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles_select_all" on public.profiles for select to authenticated using (true);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- meetings
create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  room_code text not null unique,
  title text,
  host_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);
alter table public.meetings enable row level security;

create policy "meetings_select_all" on public.meetings for select to authenticated using (true);
create policy "meetings_insert_own" on public.meetings for insert to authenticated with check (auth.uid() = host_id);
create policy "meetings_update_host" on public.meetings for update to authenticated using (auth.uid() = host_id);
create policy "meetings_delete_host" on public.meetings for delete to authenticated using (auth.uid() = host_id);

create index meetings_room_code_idx on public.meetings(room_code);

-- participants
create table public.participants (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  unique (meeting_id, user_id)
);
alter table public.participants enable row level security;

create policy "participants_select_all" on public.participants for select to authenticated using (true);
create policy "participants_insert_self" on public.participants for insert to authenticated with check (auth.uid() = user_id);
create policy "participants_update_self" on public.participants for update to authenticated using (auth.uid() = user_id);
create policy "participants_delete_self" on public.participants for delete to authenticated using (auth.uid() = user_id);

create index participants_meeting_idx on public.participants(meeting_id);

-- Enable realtime for participants (for join/leave detection)
alter publication supabase_realtime add table public.participants;
