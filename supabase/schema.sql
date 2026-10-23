-- ==============================================================================
-- Schema for Colegio San Agustin - Bacolod: "Dare to be" Event Evaluation
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Create evaluations table
create table if not exists public.event_evaluations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now() not null,
  event_name text default 'Dare to be' not null,
  school text default 'Colegio San Agustin - Bacolod' not null,
  attendee_name text,
  affiliated_school text default 'Colegio San Agustin - Bacolod',
  attendee_role text default 'Student',
  
  -- The 5 core evaluation criteria (Scale 1 to 5)
  -- 1. Rate the success of the event
  success_rating smallint check (success_rating between 1 and 5),
  success_feedback text,
  
  -- 2. Is the event well organized?
  organized_rating smallint check (organized_rating between 1 and 5),
  organized_feedback text,
  
  -- 3. Is the venue and facility satisfactory?
  venue_rating smallint check (venue_rating between 1 and 5),
  venue_feedback text,
  
  -- 4. Is the goal of the event achieved?
  goal_rating smallint check (goal_rating between 1 and 5),
  goal_feedback text,
  
  -- 5. Did the event start on time?
  punctuality_rating smallint check (punctuality_rating between 1 and 5),
  punctuality_feedback text,
  
  -- Overall & Summary
  average_score numeric(3, 2),
  general_comment text,
  metadata jsonb default '{}'::jsonb
);

-- 2. Enable Row Level Security (RLS)
alter table public.event_evaluations enable row level security;

-- 3. Policy: Allow anyone (anonymous students/attendees) to insert evaluations
drop policy if exists "Allow anonymous insert evaluations" on public.event_evaluations;
create policy "Allow anonymous insert evaluations"
  on public.event_evaluations
  for insert
  with check (true);

-- 4. Policy: Allow reading evaluations for public aggregation / analytics
drop policy if exists "Allow read evaluations" on public.event_evaluations;
create policy "Allow read evaluations"
  on public.event_evaluations
  for select
  using (true);

-- 5. Policy: Allow delete evaluations
drop policy if exists "Allow delete evaluations" on public.event_evaluations;
create policy "Allow delete evaluations"
  on public.event_evaluations
  for delete
  using (true);

-- 6. Helpful index for querying by event name and date
create index if not exists idx_event_evaluations_event_name on public.event_evaluations (event_name);
create index if not exists idx_event_evaluations_created_at on public.event_evaluations (created_at desc);
