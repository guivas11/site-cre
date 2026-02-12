                                                                                                                                create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  username text unique,
  display_name text,
  avatar_url text,
  banner_url text,
  favorite_track text,
  favorite_track_image text,
  bio text,
  experience text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.victories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  category text,
  track text,
  position text,
  date date,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.lap_times (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  track text not null,
  time text not null,
  created_at timestamptz default now(),
  unique (user_id, track)
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'preferred_username',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.victories enable row level security;
alter table public.lap_times enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
on public.profiles for select
using (true);

drop policy if exists "Users can insert their profile" on public.profiles;
create policy "Users can insert their profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id);

drop policy if exists "Victories are viewable by everyone" on public.victories;
create policy "Victories are viewable by everyone"
on public.victories for select
using (true);

drop policy if exists "Users can insert own victories" on public.victories;
create policy "Users can insert own victories"
on public.victories for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own victories" on public.victories;
create policy "Users can update own victories"
on public.victories for update
using (auth.uid() = user_id);

drop policy if exists "Users can delete own victories" on public.victories;
create policy "Users can delete own victories"
on public.victories for delete
using (auth.uid() = user_id);

drop policy if exists "Lap times are viewable by everyone" on public.lap_times;
create policy "Lap times are viewable by everyone"
on public.lap_times for select
using (true);

drop policy if exists "Users can insert own lap times" on public.lap_times;
create policy "Users can insert own lap times"
on public.lap_times for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own lap times" on public.lap_times;
create policy "Users can update own lap times"
on public.lap_times for update
using (auth.uid() = user_id);

drop policy if exists "Users can delete own lap times" on public.lap_times;
create policy "Users can delete own lap times"
on public.lap_times for delete
using (auth.uid() = user_id);

-- Post likes
create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

alter table public.post_likes enable row level security;

drop policy if exists "post_likes_select" on public.post_likes;
create policy "post_likes_select" on public.post_likes
  for select
  using (true);

drop policy if exists "post_likes_insert" on public.post_likes;
create policy "post_likes_insert" on public.post_likes
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "post_likes_delete" on public.post_likes;
create policy "post_likes_delete" on public.post_likes
  for delete
  using (auth.uid() = user_id);

-- Race clips
create table if not exists public.race_clips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  description text,
  clip_url text,
  youtube_url text,
  created_at timestamptz not null default now()
);

alter table public.race_clips enable row level security;

drop policy if exists "race_clips_select" on public.race_clips;
create policy "race_clips_select" on public.race_clips
  for select
  using (true);

drop policy if exists "race_clips_insert" on public.race_clips;
create policy "race_clips_insert" on public.race_clips
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "race_clips_delete" on public.race_clips;
create policy "race_clips_delete" on public.race_clips
  for delete
  using (auth.uid() = user_id);

-- Clip extra fields
alter table public.race_clips
  add column if not exists category text,
  add column if not exists track text,
  add column if not exists lap_time text;


-- Roles and moderation helpers
alter table public.profiles
  add column if not exists is_admin boolean not null default false,
  add column if not exists is_banned boolean not null default false,
  add column if not exists ban_reason text,
  add column if not exists banned_at timestamptz;

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1
    from public.profiles p
    where p.id = uid
      and p.is_admin = true
  );
$$;

create or replace function public.is_banned(uid uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1
    from public.profiles p
    where p.id = uid
      and p.is_banned = true
  );
$$;

-- Posts moderation columns
do $$
begin
  if to_regclass('public.posts') is not null then
    alter table public.posts
      add column if not exists is_hidden boolean not null default false,
      add column if not exists hidden_reason text,
      add column if not exists moderated_by uuid references auth.users on delete set null,
      add column if not exists moderated_at timestamptz;

    alter table public.posts enable row level security;

    drop policy if exists "posts_select_visible_or_admin" on public.posts;
    create policy "posts_select_visible_or_admin" on public.posts
      for select
      using (is_hidden = false or public.is_admin(auth.uid()));

    drop policy if exists "posts_insert_author_or_admin" on public.posts;
    create policy "posts_insert_author_or_admin" on public.posts
      for insert
      with check (
        (
          created_by = auth.uid()
          and public.is_banned(auth.uid()) = false
        ) or public.is_admin(auth.uid())
      );

    drop policy if exists "posts_update_author_or_admin" on public.posts;
    create policy "posts_update_author_or_admin" on public.posts
      for update
      using (
        created_by = auth.uid() or public.is_admin(auth.uid())
      );

    drop policy if exists "posts_delete_author_or_admin" on public.posts;
    create policy "posts_delete_author_or_admin" on public.posts
      for delete
      using (
        created_by = auth.uid() or public.is_admin(auth.uid())
      );
  end if;
end $$;

-- Real-time comments for posts
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  display_name text,
  username text,
  avatar_url text,
  content text not null check (length(trim(content)) > 0 and length(content) <= 2000),
  is_hidden boolean not null default false,
  hidden_reason text,
  moderated_by uuid references auth.users on delete set null,
  moderated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_post_comments_post_created
  on public.post_comments (post_id, created_at desc);

drop trigger if exists post_comments_updated_at on public.post_comments;
create trigger post_comments_updated_at
before update on public.post_comments
for each row
execute function public.set_updated_at();

alter table public.post_comments enable row level security;

drop policy if exists "post_comments_select_visible_or_admin" on public.post_comments;
create policy "post_comments_select_visible_or_admin" on public.post_comments
  for select
  using (is_hidden = false or public.is_admin(auth.uid()));

drop policy if exists "post_comments_insert_own_not_banned" on public.post_comments;
create policy "post_comments_insert_own_not_banned" on public.post_comments
  for insert
  with check (
    auth.uid() = user_id
    and public.is_banned(auth.uid()) = false
  );

drop policy if exists "post_comments_update_own_or_admin" on public.post_comments;
create policy "post_comments_update_own_or_admin" on public.post_comments
  for update
  using (
    auth.uid() = user_id
    or public.is_admin(auth.uid())
  );

drop policy if exists "post_comments_delete_own_or_admin" on public.post_comments;
create policy "post_comments_delete_own_or_admin" on public.post_comments
  for delete
  using (
    auth.uid() = user_id
    or public.is_admin(auth.uid())
  );

-- Optional anti-abuse checks for user-generated content
alter table public.race_clips enable row level security;

drop policy if exists "race_clips_insert" on public.race_clips;
create policy "race_clips_insert" on public.race_clips
  for insert
  with check (
    auth.uid() = user_id
    and public.is_banned(auth.uid()) = false
  );

drop policy if exists "Users can insert own victories" on public.victories;
create policy "Users can insert own victories"
on public.victories for insert
with check (
  auth.uid() = user_id
  and public.is_banned(auth.uid()) = false
);

drop policy if exists "Users can insert own lap times" on public.lap_times;
create policy "Users can insert own lap times"
on public.lap_times for insert
with check (
  auth.uid() = user_id
  and public.is_banned(auth.uid()) = false
);

-- Setup center by track
create table if not exists public.track_setups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  track text not null,
  category text,
  lap_time text,
  title text not null,
  setup_notes text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_track_setups_track_created
  on public.track_setups (track, created_at desc);

alter table public.track_setups enable row level security;

drop policy if exists "track_setups_select_all" on public.track_setups;
create policy "track_setups_select_all" on public.track_setups
  for select
  using (true);

drop policy if exists "track_setups_insert_own_not_banned" on public.track_setups;
create policy "track_setups_insert_own_not_banned" on public.track_setups
  for insert
  with check (
    auth.uid() = user_id
    and public.is_banned(auth.uid()) = false
  );

drop policy if exists "track_setups_update_own_or_admin" on public.track_setups;
create policy "track_setups_update_own_or_admin" on public.track_setups
  for update
  using (
    auth.uid() = user_id
    or public.is_admin(auth.uid())
  );

drop policy if exists "track_setups_delete_own_or_admin" on public.track_setups;
create policy "track_setups_delete_own_or_admin" on public.track_setups
  for delete
  using (
    auth.uid() = user_id
    or public.is_admin(auth.uid())
  );

-- Penalty radar (admin managed, public readable)
create table if not exists public.race_penalties (
  id uuid primary key default gen_random_uuid(),
  pilot_name text not null,
  track text,
  category text,
  reason text not null,
  penalty_type text not null,
  status text not null default 'ativo',
  happened_at date not null default current_date,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_race_penalties_date
  on public.race_penalties (happened_at desc);

alter table public.race_penalties enable row level security;

drop policy if exists "race_penalties_select_all" on public.race_penalties;
create policy "race_penalties_select_all" on public.race_penalties
  for select
  using (true);

drop policy if exists "race_penalties_admin_insert" on public.race_penalties;
create policy "race_penalties_admin_insert" on public.race_penalties
  for insert
  with check (public.is_admin(auth.uid()));

drop policy if exists "race_penalties_admin_update" on public.race_penalties;
create policy "race_penalties_admin_update" on public.race_penalties
  for update
  using (public.is_admin(auth.uid()));

drop policy if exists "race_penalties_admin_delete" on public.race_penalties;
create policy "race_penalties_admin_delete" on public.race_penalties
  for delete
  using (public.is_admin(auth.uid()));

-- Setup center extras (car + version)
alter table public.track_setups
  add column if not exists car_name text,
  add column if not exists setup_version text;

-- Agenda events + registrations
create table if not exists public.agenda_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz,
  track text,
  category text,
  description text,
  link text,
  max_slots integer not null default 20 check (max_slots > 0),
  created_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now()
);

alter table public.agenda_events
  add column if not exists max_slots integer not null default 20;

create table if not exists public.agenda_event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.agenda_events on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create index if not exists idx_agenda_event_regs_event
  on public.agenda_event_registrations (event_id, created_at desc);

alter table public.agenda_events enable row level security;
alter table public.agenda_event_registrations enable row level security;

drop policy if exists "agenda_events_select_all" on public.agenda_events;
create policy "agenda_events_select_all" on public.agenda_events
  for select
  using (true);

drop policy if exists "agenda_events_admin_insert" on public.agenda_events;
create policy "agenda_events_admin_insert" on public.agenda_events
  for insert
  with check (public.is_admin(auth.uid()));

drop policy if exists "agenda_events_admin_update" on public.agenda_events;
create policy "agenda_events_admin_update" on public.agenda_events
  for update
  using (public.is_admin(auth.uid()));

drop policy if exists "agenda_events_admin_delete" on public.agenda_events;
create policy "agenda_events_admin_delete" on public.agenda_events
  for delete
  using (public.is_admin(auth.uid()));

drop policy if exists "agenda_event_regs_select_all" on public.agenda_event_registrations;
create policy "agenda_event_regs_select_all" on public.agenda_event_registrations
  for select
  using (true);

drop policy if exists "agenda_event_regs_insert_own_not_banned" on public.agenda_event_registrations;
create policy "agenda_event_regs_insert_own_not_banned" on public.agenda_event_registrations
  for insert
  with check (
    auth.uid() = user_id
    and public.is_banned(auth.uid()) = false
  );

drop policy if exists "agenda_event_regs_delete_own_or_admin" on public.agenda_event_registrations;
create policy "agenda_event_regs_delete_own_or_admin" on public.agenda_event_registrations
  for delete
  using (
    auth.uid() = user_id
    or public.is_admin(auth.uid())
  );

-- Support tickets
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  subject text not null,
  message text not null check (length(trim(message)) > 0 and length(message) <= 5000),
  category text,
  priority text,
  status text not null default 'aberto',
  contact_email text,
  contact_discord text,
  resolved_by uuid references auth.users on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_support_tickets_user_created
  on public.support_tickets (user_id, created_at desc);

create index if not exists idx_support_tickets_status_created
  on public.support_tickets (status, created_at desc);

drop trigger if exists support_tickets_updated_at on public.support_tickets;
create trigger support_tickets_updated_at
before update on public.support_tickets
for each row
execute function public.set_updated_at();

alter table public.support_tickets enable row level security;

drop policy if exists "support_tickets_select_own_or_admin" on public.support_tickets;
create policy "support_tickets_select_own_or_admin" on public.support_tickets
  for select
  using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "support_tickets_insert_own_not_banned" on public.support_tickets;
create policy "support_tickets_insert_own_not_banned" on public.support_tickets
  for insert
  with check (
    auth.uid() = user_id
    and public.is_banned(auth.uid()) = false
  );

drop policy if exists "support_tickets_update_admin_only" on public.support_tickets;
create policy "support_tickets_update_admin_only" on public.support_tickets
  for update
  using (public.is_admin(auth.uid()));

drop policy if exists "support_tickets_delete_own_or_admin" on public.support_tickets;
create policy "support_tickets_delete_own_or_admin" on public.support_tickets
  for delete
  using (auth.uid() = user_id or public.is_admin(auth.uid()));
