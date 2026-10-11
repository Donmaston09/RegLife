-- "Report an error" submissions. Created by Anthony Onoja, Ph.D., University of Surrey.
-- Signed-in learners can submit reports. Nobody can read them through the app;
-- the project owner reads them in Supabase (Table Editor > content_reports).
create table public.content_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users(id) on delete set null,
  content_kind text not null check (char_length(content_kind) <= 30),
  content_id text not null check (char_length(content_id) <= 200),
  message text not null check (char_length(message) between 5 and 2000),
  source_url text check (source_url is null or char_length(source_url) <= 500),
  status text not null default 'new' check (status in ('new', 'accepted', 'rejected', 'fixed')),
  created_at timestamptz not null default now()
);
alter table public.content_reports enable row level security;
create policy "signed-in users can report" on public.content_reports
  for insert to authenticated with check (user_id = auth.uid());
