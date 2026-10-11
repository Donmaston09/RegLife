-- Trigger drills and work documents. Created by Anthony Onoja, Ph.D., University of Surrey.
alter table public.progress
  add column if not exists drills jsonb not null default '{}'::jsonb,
  add column if not exists docs jsonb not null default '[]'::jsonb;

-- report now includes drills and documents made since joining (return type changes, so drop first)
drop function if exists public.cohort_report(uuid);
create function public.cohort_report(cid uuid)
returns table (user_id uuid, display_name text, organisation text, joined_at timestamptz,
               visited text[], updated_at timestamptz, runs jsonb, drills jsonb, docs jsonb)
language plpgsql stable security definer set search_path = public as $$
begin
  if not exists (select 1 from cohorts where id = cid and owner_id = auth.uid()) then
    raise exception 'Only the cohort owner can view this report';
  end if;
  return query
    select m.user_id, p.display_name, p.organisation, m.joined_at,
           coalesce(g.visited, '{}'), g.updated_at,
           coalesce((select jsonb_agg(jsonb_build_object('scenario_id', r.scenario_id, 'score', r.score, 'stats', r.stats, 'completed_at', r.completed_at) order by r.completed_at)
                     from scenario_runs r where r.user_id = m.user_id and r.completed_at >= m.joined_at), '[]'::jsonb),
           coalesce((select jsonb_object_agg(e.key, e.value) from jsonb_each(coalesce(g.drills, '{}'::jsonb)) e where (e.value->>'at')::timestamptz >= m.joined_at), '{}'::jsonb),
           coalesce((select jsonb_agg(d) from jsonb_array_elements(coalesce(g.docs, '[]'::jsonb)) d where (d->>'at')::timestamptz >= m.joined_at), '[]'::jsonb)
    from cohort_members m
    join profiles p on p.id = m.user_id
    left join progress g on g.user_id = m.user_id
    where m.cohort_id = cid
    order by p.display_name;
end $$;
revoke all on function public.cohort_report(uuid) from anon, public;
grant execute on function public.cohort_report(uuid) to authenticated;
