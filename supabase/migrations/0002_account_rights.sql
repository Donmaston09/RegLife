-- Self-service erasure (UK GDPR Art 17). Created by Anthony Onoja, Ph.D., University of Surrey.
-- Deleting the auth user cascades to profile, progress, scenario runs, memberships
-- and any cohorts the person owns (their learners' own data is kept).
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from anon, public;
grant execute on function public.delete_my_account() to authenticated;
