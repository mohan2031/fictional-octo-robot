-- Gather & Grain Restaurant Platform
-- Schema draft only: NOT applied to Supabase yet.
-- Keep this database separate from Care Solt.
-- Public ordering writes should go through a validated server endpoint/Edge Function;
-- do not grant anon clients direct INSERT/UPDATE access to orders or order_items.

create extension if not exists pgcrypto;

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  name text not null,
  slug text not null unique,
  currency text not null default 'INR',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.restaurant_staff (
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'manager', 'staff', 'kitchen')),
  created_at timestamptz not null default now(),
  primary key (restaurant_id, user_id)
);

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (restaurant_id, name)
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid references public.menu_categories(id) on delete set null,
  name text not null,
  description text,
  image_url text,
  price_paise integer not null check (price_paise >= 0),
  is_available boolean not null default true,
  dietary_tag text check (dietary_tag in ('veg', 'non_veg', 'vegan', 'egg') or dietary_tag is null),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dining_tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  table_label text not null,
  qr_token uuid not null default gen_random_uuid() unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (restaurant_id, table_label)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete restrict,
  dining_table_id uuid references public.dining_tables(id) on delete set null,
  order_number bigint generated always as identity,
  customer_name text,
  customer_phone text,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'preparing', 'ready', 'served', 'cancelled')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'refunded')),
  subtotal_paise integer not null default 0 check (subtotal_paise >= 0),
  tax_paise integer not null default 0 check (tax_paise >= 0),
  total_paise integer not null default 0 check (total_paise >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, order_number)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  item_name_snapshot text not null,
  unit_price_paise integer not null check (unit_price_paise >= 0),
  quantity integer not null check (quantity between 1 and 99),
  line_total_paise integer not null check (line_total_paise >= 0),
  created_at timestamptz not null default now()
);

create index if not exists menu_items_restaurant_category_idx
  on public.menu_items (restaurant_id, category_id);
create index if not exists orders_restaurant_created_idx
  on public.orders (restaurant_id, created_at desc);
create index if not exists orders_restaurant_status_idx
  on public.orders (restaurant_id, status);
create index if not exists order_items_order_idx
  on public.order_items (order_id);

alter table public.restaurants enable row level security;
alter table public.restaurant_staff enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.dining_tables enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Staff access helper: membership is scoped to a specific restaurant.
create or replace function public.is_restaurant_staff(target_restaurant_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.restaurant_staff rs
    where rs.restaurant_id = target_restaurant_id
      and rs.user_id = (select auth.uid())
  );
$$;

-- Restaurant owners and assigned staff can read operational records.
create policy "restaurant members read restaurant"
  on public.restaurants for select to authenticated
  using (owner_user_id = (select auth.uid()) or public.is_restaurant_staff(id));

create policy "owner creates restaurant"
  on public.restaurants for insert to authenticated
  with check (owner_user_id = (select auth.uid()));

create policy "restaurant members read staff"
  on public.restaurant_staff for select to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_user_id = (select auth.uid())
    )
  );

create policy "owner manages staff"
  on public.restaurant_staff for all to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_user_id = (select auth.uid())
    )
  );

create policy "public reads active menu categories"
  on public.menu_categories for select to anon, authenticated
  using (
    is_active and exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.is_active
    )
  );

create policy "staff manages menu categories"
  on public.menu_categories for all to authenticated
  using (public.is_restaurant_staff(restaurant_id))
  with check (public.is_restaurant_staff(restaurant_id));

create policy "public reads available menu items"
  on public.menu_items for select to anon, authenticated
  using (
    is_available and exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.is_active
    )
  );

create policy "staff manages menu items"
  on public.menu_items for all to authenticated
  using (public.is_restaurant_staff(restaurant_id))
  with check (public.is_restaurant_staff(restaurant_id));

create policy "staff manages dining tables"
  on public.dining_tables for all to authenticated
  using (public.is_restaurant_staff(restaurant_id))
  with check (public.is_restaurant_staff(restaurant_id));

create policy "staff reads restaurant orders"
  on public.orders for select to authenticated
  using (public.is_restaurant_staff(restaurant_id));

create policy "staff updates restaurant orders"
  on public.orders for update to authenticated
  using (public.is_restaurant_staff(restaurant_id))
  with check (public.is_restaurant_staff(restaurant_id));

create policy "staff reads order items"
  on public.order_items for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and public.is_restaurant_staff(o.restaurant_id)
    )
  );

-- Intentionally no anon INSERT/UPDATE policies for orders or order_items.
-- Add a server-side validated order-creation function before enabling live QR orders.
