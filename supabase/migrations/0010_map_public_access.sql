alter table event_maps
  add column require_site_password boolean not null default true;
