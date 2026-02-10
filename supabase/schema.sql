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

