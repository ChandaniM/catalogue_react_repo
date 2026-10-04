-- Admin content, normalized product links, sales records, and reporting.
-- Run after 001_create_shop_schema.sql.

create table if not exists slides (
  id uuid primary key default uuid_generate_v4(),
  title text not null default '',
  subtitle text not null default '',
  image_url text not null,
  button_text text,
  button_url text,
  secondary_button_text text,
  secondary_button_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_slides_active_order on slides(is_active, sort_order);

create table if not exists sales (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete restrict,
  customer_id uuid references customers(id) on delete set null,
  customer_name text,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  amount numeric(12,2) not null check (amount >= 0),
  payment_method text not null default 'cash',
  status text not null default 'paid' check (status in ('paid', 'pending', 'cancelled')),
  notes text,
  inventory_applied boolean not null default false,
  sold_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_sales_sold_at on sales(sold_at desc);
create index if not exists idx_sales_product_id on sales(product_id);

create table if not exists product_tags (
  product_id uuid not null references products(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, tag_id)
);

create table if not exists product_occasions (
  product_id uuid not null references products(id) on delete cascade,
  occasion_id uuid not null references occasions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, occasion_id)
);

create index if not exists idx_product_tags_tag_id on product_tags(tag_id);
create index if not exists idx_product_occasions_occasion_id on product_occasions(occasion_id);

create or replace view analytics_overview as
select
  coalesce(sum(case when s.status = 'paid' then s.amount else 0 end), 0)::numeric(12,2) as revenue,
  coalesce(sum(case when s.status = 'paid' then s.quantity else 0 end), 0)::bigint as units_sold,
  count(*) filter (where s.status = 'paid')::bigint as completed_sales,
  count(distinct s.product_id) filter (where s.status = 'paid')::bigint as products_sold,
  count(*) filter (where s.status = 'pending')::bigint as pending_sales,
  (select count(*) from products where is_active) as active_products,
  (select count(*) from products where is_active and quantity <= 5) as low_stock_products
from sales s;

alter table slides enable row level security;
alter table sales enable row level security;
alter table product_tags enable row level security;
alter table product_occasions enable row level security;

drop policy if exists "Allow public read access on slides" on slides;
drop policy if exists "Allow all operations on slides" on slides;
drop policy if exists "Allow public read access on sales" on sales;
drop policy if exists "Allow all operations on sales" on sales;
drop policy if exists "Allow public read access on product_tags" on product_tags;
drop policy if exists "Allow all operations on product_tags" on product_tags;
drop policy if exists "Allow public read access on product_occasions" on product_occasions;
drop policy if exists "Allow all operations on product_occasions" on product_occasions;

create policy "Allow public read access on slides"
  on slides for select using (true);
create policy "Allow all operations on slides"
  on slides for all using (true) with check (true);

create policy "Allow public read access on sales"
  on sales for select using (true);
create policy "Allow all operations on sales"
  on sales for all using (true) with check (true);

create policy "Allow public read access on product_tags"
  on product_tags for select using (true);
create policy "Allow all operations on product_tags"
  on product_tags for all using (true) with check (true);

create policy "Allow public read access on product_occasions"
  on product_occasions for select using (true);
create policy "Allow all operations on product_occasions"
  on product_occasions for all using (true) with check (true);

create or replace trigger update_slides_updated_at
before update on slides
for each row execute function update_updated_at_column();

create or replace trigger update_sales_updated_at
before update on sales
for each row execute function update_updated_at_column();
