-- GhostFeed initial schema

create table videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  niche text not null,
  script jsonb not null,
  config jsonb,
  status text not null default 'pending',
  output_url text,
  thumbnail_url text,
  created_at timestamptz default now(),
  completed_at timestamptz,
  error text
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free',
  videos_this_month int default 0,
  period_start timestamptz default now(),
  created_at timestamptz default now()
);

-- RLS policies
alter table videos enable row level security;
create policy "Users see own videos" on videos
  for select using (auth.uid() = user_id);
create policy "Users insert own videos" on videos
  for insert with check (auth.uid() = user_id);
create policy "Users update own videos" on videos
  for update using (auth.uid() = user_id);

alter table subscriptions enable row level security;
create policy "Users see own sub" on subscriptions
  for select using (auth.uid() = user_id);

-- Waitlist
create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

-- Platform connections (TikTok, YouTube OAuth tokens)
create table if not exists platform_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  platform text not null,
  platform_user_id text,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  updated_at timestamptz default now(),
  unique(user_id, platform)
);

alter table platform_connections enable row level security;
create policy "Users see own connections" on platform_connections
  for select using (auth.uid() = user_id);
create policy "Users manage own connections" on platform_connections
  for all using (auth.uid() = user_id);
