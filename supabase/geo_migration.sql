-- ═══════════════════════════════════════════════════════════
-- KALION MAX — User-Geo Migration
-- Erfasst beim ersten Login Land + Stadt aus Vercel-Headers.
-- ═══════════════════════════════════════════════════════════

alter table profiles
  add column if not exists country text,        -- ISO 3166-1 alpha-2 (DE, US, FR, …)
  add column if not exists country_name text,
  add column if not exists city text,
  add column if not exists region text;

create index if not exists profiles_country_idx
  on profiles (country);

-- ── RPC: User-Geo setzen (wird vom /api/geo/me-Endpoint aufgerufen) ──
create or replace function public.set_user_geo(
  p_country text,
  p_country_name text,
  p_city text,
  p_region text
)
returns void
language sql
security definer
set search_path = public
as $$
  update profiles
  set country = p_country,
      country_name = p_country_name,
      city = p_city,
      region = p_region
  where id = auth.uid()
    and (country is null or country = '');
$$;

grant execute on function public.set_user_geo(text, text, text, text) to authenticated;

-- ── RPC: Aggregierte Länder-Stats — ÖFFENTLICH (anonymized) ──
create or replace function public.get_country_stats()
returns table (country text, country_name text, user_count int)
language sql
security definer
set search_path = public
stable
as $$
  select
    country,
    country_name,
    count(*)::int as user_count
  from profiles
  where country is not null and country <> ''
  group by country, country_name
  order by count(*) desc;
$$;

grant execute on function public.get_country_stats() to anon, authenticated;

-- ═══════════════════════════════════════════════════════════
-- FERTIG.
-- ═══════════════════════════════════════════════════════════
