-- RegLife database schema (Supabase / Postgres)
-- Created by Anthony Onoja, Ph.D., University of Surrey.
-- Run in the Supabase SQL editor, or with `supabase db push`.
-- Every table has row level security. Learners see only their own data.
-- A cohort owner (educator) can read progress of members of their cohorts through
-- the security-definer report function, never the tables directly.

create extension if not exists pgcrypto;

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  organisation text not null default '' check (char_length(organisation) <= 120),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "read own profile" on public.profiles for select using (id = auth.uid());
create policy "update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  insert into public.progress (user_id) values (new.id);
  return new;
end $$;

-- ---------- progress (one row per learner) ----------
create table public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  visited text[] not null default '{}',
  answers jsonb not null default '{}'::jsonb,
  changes text[] not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.progress enable row level security;
create policy "own progress select" on public.progress for select using (user_id = auth.uid());
create policy "own progress insert" on public.progress for insert with check (user_id = auth.uid());
create policy "own progress update" on public.progress for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- scenario runs ----------
create table public.scenario_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id text not null check (char_length(scenario_id) <= 40),
  score int not null check (score between 0 and 100),
  stats jsonb not null,
  choices int[] not null default '{}',
  completed_at timestamptz not null default now()
);
create index on public.scenario_runs (user_id, completed_at desc);
alter table public.scenario_runs enable row level security;
create policy "own runs select" on public.scenario_runs for select using (user_id = auth.uid());
create policy "own runs insert" on public.scenario_runs for insert with check (user_id = auth.uid());

-- ---------- cohorts ----------
create table public.cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  join_code text not null unique check (join_code ~ '^[A-Z0-9]{6}$'),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.cohorts enable row level security;

create table public.cohort_members (
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (cohort_id, user_id)
);
alter table public.cohort_members enable row level security;

-- helper functions avoid recursive policies
create or replace function public.is_cohort_member(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from cohort_members where cohort_id = cid and user_id = auth.uid())
$$;

create policy "owner manages cohort" on public.cohorts for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "members see cohort" on public.cohorts for select using (public.is_cohort_member(id));
create policy "see own memberships" on public.cohort_members for select using (user_id = auth.uid());
create policy "leave cohort" on public.cohort_members for delete using (user_id = auth.uid());
create policy "owner removes members" on public.cohort_members for delete
  using (exists (select 1 from cohorts c where c.id = cohort_id and c.owner_id = auth.uid()));

-- join by code (codes are not secret, but you need one to join)
create or replace function public.join_cohort(code text) returns table (id uuid, name text)
language plpgsql security definer set search_path = public as $$
declare c cohorts;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  select * into c from cohorts where join_code = upper(trim(code));
  if not found then raise exception 'No cohort has that code'; end if;
  insert into cohort_members (cohort_id, user_id) values (c.id, auth.uid()) on conflict do nothing;
  return query select c.id, c.name;
end $$;

-- educator report: only the cohort owner gets rows
create or replace function public.cohort_report(cid uuid)
returns table (user_id uuid, display_name text, organisation text, joined_at timestamptz,
               visited text[], updated_at timestamptz, runs jsonb)
language plpgsql stable security definer set search_path = public as $$
begin
  if not exists (select 1 from cohorts where id = cid and owner_id = auth.uid()) then
    raise exception 'Only the cohort owner can view this report';
  end if;
  return query
    select m.user_id, p.display_name, p.organisation, m.joined_at,
           coalesce(g.visited, '{}'), g.updated_at,
           coalesce((select jsonb_agg(jsonb_build_object('scenario_id', r.scenario_id, 'score', r.score, 'stats', r.stats, 'completed_at', r.completed_at) order by r.completed_at)
                     from scenario_runs r where r.user_id = m.user_id and r.completed_at >= m.joined_at), '[]'::jsonb)
    from cohort_members m
    join profiles p on p.id = m.user_id
    left join progress g on g.user_id = m.user_id
    where m.cohort_id = cid
    order by p.display_name;
end $$;

revoke all on function public.cohort_report(uuid) from anon;
revoke all on function public.join_cohort(text) from anon;
