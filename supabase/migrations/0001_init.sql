-- Event Map SaaS: initial schema + RLS
-- Tenancy model: organizations <- organization_members -> auth.users
-- event_maps belong to an organization; map_categories and pins belong to a map.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------
create table organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

create table organization_members (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  role            text not null default 'owner' check (role in ('owner', 'editor')),
  created_at      timestamptz not null default now(),
  unique (organization_id, user_id)
);

-- ---------------------------------------------------------------------------
-- event_maps
-- ---------------------------------------------------------------------------
create table event_maps (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references organizations(id) on delete cascade,
  slug              text not null unique,
  title             text not null,
  event_type        text not null default 'other'
                      check (event_type in ('matsuri', 'marche', 'frima', 'bousai', 'other')),
  description       text,
  center_lat        double precision not null,
  center_lng        double precision not null,
  default_zoom      smallint not null default 16,
  basemap           text not null default 'std' check (basemap in ('std', 'photo')),
  brand_color       text not null default '#c0472e',
  status            text not null default 'draft' check (status in ('draft', 'published')),
  event_date_start  date,
  event_date_end    date,
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index event_maps_organization_id_idx on event_maps (organization_id);
create index event_maps_status_idx on event_maps (status);

-- ---------------------------------------------------------------------------
-- map_categories
-- ---------------------------------------------------------------------------
create table map_categories (
  id          uuid primary key default gen_random_uuid(),
  map_id      uuid not null references event_maps(id) on delete cascade,
  label       text not null,
  color       text not null,
  icon        text,
  sort_order  int not null default 0
);

create index map_categories_map_id_idx on map_categories (map_id);

-- ---------------------------------------------------------------------------
-- pins
-- ---------------------------------------------------------------------------
create table pins (
  id            uuid primary key default gen_random_uuid(),
  map_id        uuid not null references event_maps(id) on delete cascade,
  category_id   uuid references map_categories(id) on delete set null,
  title         text not null,
  emoji         text not null default '📍',
  lat           double precision not null,
  lng           double precision not null,
  description   text,
  place_note    text,
  date          date,
  time_label    text,
  photo_url     text,
  status        text not null default 'active' check (status in ('active', 'cancelled', 'hidden')),
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index pins_map_id_idx on pins (map_id);
create index pins_category_id_idx on pins (category_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger event_maps_set_updated_at
  before update on event_maps
  for each row execute function set_updated_at();

create trigger pins_set_updated_at
  before update on pins
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- org auto-provisioning (SECURITY DEFINER avoids the RLS chicken-and-egg
-- problem when a brand-new user has no organization yet)
-- ---------------------------------------------------------------------------
create or replace function create_organization_for_user(org_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
begin
  insert into organizations (name) values (org_name) returning id into new_org_id;
  insert into organization_members (organization_id, user_id, role)
    values (new_org_id, auth.uid(), 'owner');
  return new_org_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table event_maps enable row level security;
alter table map_categories enable row level security;
alter table pins enable row level security;

-- organizations: readable only by members; no direct client insert (use the RPC above)
create policy organizations_select on organizations
  for select using (
    id in (select organization_id from organization_members where user_id = auth.uid())
  );

-- organization_members: a user can see their own memberships
create policy organization_members_select on organization_members
  for select using (user_id = auth.uid());

-- event_maps: visitors see published maps, owners see (and manage) their own
create policy event_maps_select on event_maps
  for select using (
    status = 'published'
    or organization_id in (select organization_id from organization_members where user_id = auth.uid())
  );

create policy event_maps_insert on event_maps
  for insert with check (
    organization_id in (select organization_id from organization_members where user_id = auth.uid())
  );

create policy event_maps_update on event_maps
  for update using (
    organization_id in (select organization_id from organization_members where user_id = auth.uid())
  );

create policy event_maps_delete on event_maps
  for delete using (
    organization_id in (select organization_id from organization_members where user_id = auth.uid())
  );

-- map_categories: follow the parent map's visibility/ownership
create policy map_categories_select on map_categories
  for select using (
    map_id in (
      select id from event_maps
      where status = 'published'
         or organization_id in (select organization_id from organization_members where user_id = auth.uid())
    )
  );

create policy map_categories_write on map_categories
  for all using (
    map_id in (
      select id from event_maps
      where organization_id in (select organization_id from organization_members where user_id = auth.uid())
    )
  ) with check (
    map_id in (
      select id from event_maps
      where organization_id in (select organization_id from organization_members where user_id = auth.uid())
    )
  );

-- pins: follow the parent map's visibility/ownership
create policy pins_select on pins
  for select using (
    map_id in (
      select id from event_maps
      where status = 'published'
         or organization_id in (select organization_id from organization_members where user_id = auth.uid())
    )
  );

create policy pins_write on pins
  for all using (
    map_id in (
      select id from event_maps
      where organization_id in (select organization_id from organization_members where user_id = auth.uid())
    )
  ) with check (
    map_id in (
      select id from event_maps
      where organization_id in (select organization_id from organization_members where user_id = auth.uid())
    )
  );
