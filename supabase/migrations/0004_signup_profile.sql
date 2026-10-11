-- Store the name and organisation given at sign-up. Created by Anthony Onoja, Ph.D., University of Surrey.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, organisation)
  values (new.id,
          left(coalesce(new.raw_user_meta_data->>'display_name', ''), 80),
          left(coalesce(new.raw_user_meta_data->>'organisation', ''), 120));
  insert into public.progress (user_id) values (new.id);
  return new;
end $$;
