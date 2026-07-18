-- Pin sessions: multiple time-slotted programs within a single pin (e.g. a
-- stage with several performances throughout the day).

create table pin_sessions (
  id          uuid primary key default gen_random_uuid(),
  pin_id      uuid not null references pins(id) on delete cascade,
  title       text not null,
  start_time  time,
  end_time    time,
  description text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index pin_sessions_pin_id_idx on pin_sessions (pin_id);

alter table pin_sessions enable row level security;

-- follows the pins -> event_maps -> organization_members visibility/ownership
-- pattern already used by map_categories and pins.
create policy pin_sessions_select on pin_sessions
  for select using (
    pin_id in (
      select id from pins where map_id in (
        select id from event_maps
        where status = 'published'
           or organization_id in (select organization_id from organization_members where user_id = auth.uid())
      )
    )
  );

create policy pin_sessions_write on pin_sessions
  for all using (
    pin_id in (
      select id from pins where map_id in (
        select id from event_maps
        where organization_id in (select organization_id from organization_members where user_id = auth.uid())
      )
    )
  ) with check (
    pin_id in (
      select id from pins where map_id in (
        select id from event_maps
        where organization_id in (select organization_id from organization_members where user_id = auth.uid())
      )
    )
  );
