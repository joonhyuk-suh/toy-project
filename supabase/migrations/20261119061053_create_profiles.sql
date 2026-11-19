-- Profiles: one row per auth user, owner-only access.
-- Pattern: https://supabase.com/docs/guides/auth/managing-user-data

create table public.profiles (
  id uuid not null primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.profiles.email is 'Copied from auth.users once at sign-up; not kept in sync.';

alter table public.profiles enable row level security;

-- Least privilege: the owner can read the row and edit only display_name.
-- Rows are created by the auth trigger below, never by clients.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant all on public.profiles to service_role;

create policy "Owners can read their profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Owners can update their profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Create the profile when an auth user is created.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- The database moves updated_at forward on every update; created_at stays fixed.
create function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.created_at := old.created_at;
  return new;
end;
$$;

revoke execute on function public.set_profile_updated_at() from public, anon, authenticated;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute procedure public.set_profile_updated_at();
