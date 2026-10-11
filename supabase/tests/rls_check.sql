-- Local check of row level security against plain Postgres (stubs the Supabase auth schema).
-- Run from the project root against an EMPTY test database: psql -d reglife_test -f supabase/tests/rls_check.sql
\set ON_ERROR_STOP on
create role anon nologin; create role authenticated nologin;
create schema auth;
create table auth.users (id uuid primary key, raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to authenticated, anon;
\i supabase/migrations/0001_init.sql
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;
grant execute on all functions in schema public to authenticated;
-- users: E educator, A and B learners, C outsider
insert into auth.users(id, raw_user_meta_data) values
 ('00000000-0000-0000-0000-00000000000e','{"display_name":"Edu"}'),
 ('00000000-0000-0000-0000-00000000000a','{"display_name":"Ann"}'),
 ('00000000-0000-0000-0000-00000000000b','{"display_name":"Ben"}'),
 ('00000000-0000-0000-0000-00000000000c','{"display_name":"Cat"}');
set role authenticated;
-- educator creates cohort
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000e',false);
insert into cohorts(name, join_code, owner_id) values ('MSc', 'ABC234', '00000000-0000-0000-0000-00000000000e');
-- Ann: run before joining (should be hidden), join, run after
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
insert into scenario_runs(user_id, scenario_id, score, stats, completed_at) values ('00000000-0000-0000-0000-00000000000a','triagemate',40,'{"safety":40,"comp":40,"trust":40}', now() - interval '1 day');
select * from join_cohort('abc234');
insert into scenario_runs(user_id, scenario_id, score, stats) values ('00000000-0000-0000-0000-00000000000a','mindmate',80,'{"safety":80,"comp":80,"trust":80}');
update progress set visited = '{hq,lab}' where user_id = auth.uid();
-- Ann cannot read Ben's progress or the report
select count(*) as ann_sees_other_progress from progress where user_id <> auth.uid();
do $$ begin perform * from cohort_report((select id from cohorts limit 1)); raise exception 'LEAK: learner read report'; exception when others then if sqlerrm like 'LEAK%' then raise; end if; end $$;
select count(*) as ann_sees_cohort from cohorts;
-- Ann cannot insert a run for Ben
do $$ begin insert into scenario_runs(user_id, scenario_id, score, stats) values ('00000000-0000-0000-0000-00000000000b','x',1,'{}'); raise exception 'LEAK: insert for other'; exception when insufficient_privilege then null; end $$;
-- Cat (outsider) sees nothing
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000c',false);
select count(*) as cat_sees_cohorts from cohorts;
select count(*) as cat_sees_members from cohort_members;
-- educator report
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000e',false);
select display_name, visited, jsonb_array_length(runs) as runs_after_join from cohort_report((select id from cohorts limit 1));
select count(*) as edu_direct_progress_rows from progress where user_id <> auth.uid();
