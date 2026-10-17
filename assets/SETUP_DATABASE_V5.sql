-- SocoCup V5: eseguire una sola volta nel SQL Editor del proprio progetto Supabase.
-- Team membership assigned by admin, never by client. No service-role keys in site.
create table if not exists public.team_members (
 user_id uuid primary key references auth.users(id) on delete cascade,
 team_name text not null unique check (team_name in (
 'Berlusca Dortmund','STOKE AZZO','Palermo Saint-Rosalia','Hertavernello','Aston Birra','Lamin Kiadura','ipsiwich down','Vecio Lanificio Rossi United','palermo','Ciccio Kebab FC'))
);
create table if not exists public.social_posts (
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null references auth.users(id),
 team_name text not null,
 body text not null check (char_length(trim(body)) between 1 and 500),
 created_at timestamptz not null default now()
);
create table if not exists public.social_replies (
 id uuid primary key default gen_random_uuid(),
 post_id uuid not null references public.social_posts(id) on delete cascade,
 author_id uuid not null references auth.users(id),
 team_name text not null,
 body text not null check (char_length(trim(body)) between 1 and 250),
 created_at timestamptz not null default now()
);
create or replace function public.soco_assign_team() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 select tm.team_name into new.team_name from public.team_members tm where tm.user_id = auth.uid();
 if new.team_name is null or new.author_id is distinct from auth.uid() then raise exception 'Squadra non autorizzata'; end if;
 return new;
end; $$;
drop trigger if exists posts_team_guard on public.social_posts;
create trigger posts_team_guard before insert on public.social_posts for each row execute function public.soco_assign_team();
drop trigger if exists replies_team_guard on public.social_replies;
create trigger replies_team_guard before insert on public.social_replies for each row execute function public.soco_assign_team();
alter table public.team_members enable row level security;
alter table public.social_posts enable row level security;
alter table public.social_replies enable row level security;
drop policy if exists team_self_read on public.team_members;
create policy team_self_read on public.team_members for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists posts_read on public.social_posts;
create policy posts_read on public.social_posts for select to anon, authenticated using (true);
drop policy if exists posts_create on public.social_posts;
create policy posts_create on public.social_posts for insert to authenticated with check (author_id=(select auth.uid()) and exists(select 1 from public.team_members t where t.user_id=(select auth.uid())));
drop policy if exists replies_read on public.social_replies;
create policy replies_read on public.social_replies for select to anon, authenticated using (true);
drop policy if exists replies_create on public.social_replies;
create policy replies_create on public.social_replies for insert to authenticated with check (author_id=(select auth.uid()) and exists(select 1 from public.team_members t where t.user_id=(select auth.uid())));
-- Admin: create users in Supabase Authentication > Users.
-- Then assign a team manually using its auth.users UUID:
-- insert into public.team_members(user_id,team_name) values ('UUID_UTENTE','Palermo Saint-Rosalia');
