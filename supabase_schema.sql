-- Grow Smart - Supabase Database Schema
-- Paste this script into your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- to automatically provision your database structure.

-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

----------------------------------------------------
-- 1. MODULES (ZONES) TABLE
----------------------------------------------------
create table if not exists public.zones (
    id text primary key,
    name text not null,
    crop text not null,
    status text not null check (status in ('Healthy', 'Warning', 'Critical')),
    image text,
    ph numeric(3,2) not null default 6.2,
    ec numeric(3,2) not null default 1.8,
    temp numeric(4,2) not null default 24.5,
    humidity numeric(4,2) not null default 68.0,
    vpd numeric(3,2) not null default 0.95,
    growth_stage text not null check (growth_stage in ('Seedling', 'Vegetative', 'Flowering', 'Harvest')),
    
    -- Numerical arrays to store rolling history curves
    history_ph numeric[] not null default array[6.1, 6.3, 6.2, 6.0, 6.2, 6.1, 6.2, 6.3, 6.2],
    history_ec numeric[] not null default array[1.7, 1.8, 1.8, 1.7, 1.9, 1.8, 1.8, 1.8, 1.8],
    history_temp numeric[] not null default array[23.8, 24.1, 24.5, 24.8, 24.2, 24.5, 24.6, 24.4, 24.5],
    history_humidity numeric[] not null default array[65, 66, 68, 69, 67, 68, 68, 67, 68],
    
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for speedy lookups
create index if not exists idx_zones_status on public.zones(status);

----------------------------------------------------
-- 2. WEEKLY JOURNAL LOGS TABLE
----------------------------------------------------
create table if not exists public.journal_entries (
    id text primary key,
    week integer not null,
    date_range text not null,
    avg_ph numeric(3,2) not null,
    avg_ec numeric(3,2) not null,
    vpd numeric(3,2) not null,
    growth_stage text not null,
    notes text not null,
    insight text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for ordering journal logs chronologically
create index if not exists idx_journal_entries_week on public.journal_entries(week desc);

----------------------------------------------------
-- 3. ALERTS TABLE
----------------------------------------------------
create table if not exists public.alerts (
    id text primary key,
    type text not null,
    message text not null,
    zone text not null,
    active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for checking active alarms
create index if not exists idx_alerts_active on public.alerts(active) where active = true;

----------------------------------------------------
-- 4. DATABASE TRIGGERS (Auto-updates updated_at)
----------------------------------------------------
create or replace function public.handle_update_timestamp()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger trigger_zones_updated_at
    before update on public.zones
    for each row
    execute function public.handle_update_timestamp();

----------------------------------------------------
-- 5. ENABLE ROW-LEVEL SECURITY (RLS)
----------------------------------------------------
alter table public.zones enable row level security;
alter table public.journal_entries enable row level security;
alter table public.alerts enable row level security;

-- Create policies to allow public anonymous read & write 
-- (Perfect for prototype and client-side web dashboards)

create policy "Allow public read access to zones" on public.zones
    for select using (true);

create policy "Allow public insert/update access to zones" on public.zones
    for all using (true) with check (true);

create policy "Allow public read access to journal_entries" on public.journal_entries
    for select using (true);

create policy "Allow public write access to journal_entries" on public.journal_entries
    for all using (true) with check (true);

create policy "Allow public read access to alerts" on public.alerts
    for select using (true);

create policy "Allow public write access to alerts" on public.alerts
    for all using (true) with check (true);

----------------------------------------------------
-- 6. SEED INITIAL DATA
----------------------------------------------------
insert into public.zones (id, name, crop, status, image, ph, ec, temp, humidity, vpd, growth_stage, history_ph, history_ec, history_temp, history_humidity)
values 
('zone-1', 'Zone 1', 'Microgreens', 'Healthy', 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4lP5P_BYp68c1LpP3gnU6z3clwOR7dO2364KIGnOryeyGiYgp4LXr0DE0rOINOrhh67dP8-_o8vwCQCU81KpUIvZHyp9dwc6cuW1ef2ubRtjthhOXFlX-bHSLvPgqyGs7wEq6FTByuOv-kr8OqKLN_ZwGcbk5A7e9LvyRVbWp48EAhQzK8DBHHxwI2OWPmXSm9KhLyF-CedCF1U9eZa2OuDrmCISPH0L8CqHY5qXS566J36scXVFsxJRkNEG0DgHVkNVSauqsr5WV', 6.2, 1.8, 24.5, 68, 0.95, 'Vegetative', array[6.1, 6.3, 6.2, 6.0, 6.2, 6.1, 6.2, 6.3, 6.2], array[1.7, 1.8, 1.8, 1.7, 1.9, 1.8, 1.8, 1.8, 1.8], array[23.8, 24.1, 24.5, 24.8, 24.2, 24.5, 24.6, 24.4, 24.5], array[65, 66, 68, 69, 67, 68, 68, 67, 68]),
('zone-2', 'Zone 2', 'Vine Crops', 'Healthy', 'https://lh3.googleusercontent.com/aida-public/AB6AXuD24-e7Qc0IdG8tJYzvYLlHNMRglckSjxZgfG9siDezYWw8Evoj0d4uSdDZcs5blju85AG7tnFWjnBSgBHtBuEEfJz2ga8UlkCUsONnYO8jqVrMBKq9ZyRn6pvlYxfIWJyyvUMO_EiEf3fL5BdnEA0qi5JH-WI2GGYITn6Gp8qZftPhRGbSfJ3uOQitY0gKdfCbjd-s5Gbt1g4VW_r1g6Yf4nbVmNSJeRRxckrsviNz8VTh6ntp1jmm9TnvkF9HM5-b9PnlUpq8YhTu', 6.5, 2.2, 26.0, 60, 1.15, 'Flowering', array[6.4, 6.4, 6.5, 6.5, 6.6, 6.5, 6.4, 6.5, 6.5], array[2.1, 2.2, 2.2, 2.3, 2.2, 2.2, 2.1, 2.2, 2.2], array[25.5, 25.8, 26.0, 26.2, 25.9, 26.0, 26.1, 26.0, 26.0], array[58, 59, 60, 61, 60, 60, 60, 59, 60]),
('zone-4', 'Zone 4', 'Lettuce', 'Warning', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_RbrE67FmLXhslP9sRqf8pmGxsTZ-_nJqaSlEAlnd9OUbRprKR3szN7_cKgrsWOo-0IK05FeRIiW6XoDTwlg7cJIaSEpAEahVhlf8LibeyD1znTHFrczHkEq3X4Ng2KVMSJgfNm_6lAZ5Rk84WZkQlHzdohnLm_zkgIKG8Yen2NNzTjuQlF7NwZpt51uaRupQMGFeOYNyxBQpl7ys1PHgBQc3BynFoydytJB5goZZbS0pIma19Ez-YTYgHdeFCjMymsp7ojov32J5', 5.4, 1.5, 22.1, 72, 0.80, 'Seedling', array[5.9, 5.8, 5.7, 5.6, 5.4, 5.3, 5.4, 5.5, 5.4], array[1.6, 1.5, 1.5, 1.6, 1.5, 1.4, 1.5, 1.5, 1.5], array[22.0, 22.2, 22.1, 22.3, 22.0, 22.1, 22.2, 22.1, 22.1], array[70, 71, 72, 73, 72, 72, 73, 72, 72])
on conflict (id) do nothing;

insert into public.journal_entries (id, week, date_range, avg_ph, avg_ec, vpd, growth_stage, notes, insight)
values
('journal-4', 4, 'May 14 - May 20', 6.2, 1.8, 0.95, 'Vegetative', 'Growth rate is 12% above average. Foliage density is optimal. No sign of nutrient lock-out detected.', 'Growth rate is 12% above average. Foliage density is optimal. No sign of nutrient lock-out detected.'),
('journal-3', 3, 'May 07 - May 13', 6.1, 1.7, 0.92, 'Vegetative', 'Transitioned from seedling stage successfully. Root development looks fantastic under the multi-spectrum LEDs.', 'Root morphology shows highly optimized absorption rate. Biomass development is on track.'),
('journal-2', 2, 'Apr 30 - May 06', 6.3, 1.6, 0.88, 'Seedling', 'True leaves appeared. First nutrient dose introduced. EC targets slightly adjusted upwards.', 'Germination rate recorded at 98.4%. Standard deviation remains low.')
on conflict (id) do nothing;

insert into public.alerts (id, type, message, zone, active)
values
('alert-1', 'pH Imbalance', 'Urgent: pH imbalance detected in Zone 4 (Lettuce)', 'Zone 4', true)
on conflict (id) do nothing;
