-- Final Supabase schema for Uphar Gift Shop
-- PostgreSQL / Supabase compatible

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ============================================
-- ADMIN USERS
-- ============================================
create table if not exists admin_users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  password text not null,
  created_at timestamptz not null default now()
);

alter table admin_users enable row level security;

create or replace function verify_admin_login(input_email text, input_password text)
returns boolean as $$
begin
  return exists (
    select 1
    from admin_users
    where email = input_email
      and password = crypt(input_password, password)
  );
end;
$$ language plpgsql security definer;

-- ============================================
-- CATEGORIES
-- ============================================
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  cover_image text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_categories_slug on categories(slug);

alter table categories enable row level security;

create policy "Allow public read access on categories"
  on categories for select
  using (true);

create policy "Allow all operations on categories"
  on categories for all
  using (true)
  with check (true);

-- ============================================
-- TAGS
-- ============================================
create table if not exists tags (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  created_at timestamptz not null default now()
);

alter table tags enable row level security;

create policy "Allow public read access on tags"
  on tags for select
  using (true);

create policy "Allow all operations on tags"
  on tags for all
  using (true)
  with check (true);

-- ============================================
-- OCCASIONS
-- ============================================
create table if not exists occasions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  icon text,
  icon_type text default 'emoji' check (icon_type in ('emoji', 'fa', 'image')),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_occasions_slug on occasions(slug);

alter table occasions enable row level security;

create policy "Allow public read access on occasions"
  on occasions for select
  using (true);

create policy "Allow all operations on occasions"
  on occasions for all
  using (true)
  with check (true);

-- ============================================
-- PRODUCTS
-- ============================================
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  image_url text,
  category_id uuid references categories(id) on delete set null,
  occasion_id uuid references occasions(id) on delete set null,
  cost_price numeric(12,2) not null default 0,
  selling_price numeric(12,2) not null default 0,
  quantity integer not null default 0,
  sold_quantity integer not null default 0,
  tags text[] not null default '{}',
  is_new_arrival boolean not null default false,
  is_deal boolean not null default false,
  is_preorder boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category_id on products(category_id);
create index if not exists idx_products_created_at on products(created_at desc);

alter table products enable row level security;

create policy "Allow public read access on products"
  on products for select
  using (true);

create policy "Allow all operations on products"
  on products for all
  using (true)
  with check (true);

-- ============================================
-- CUSTOMERS
-- ============================================
create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text,
  whatsapp text,
  email text,
  city text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table customers enable row level security;

create policy "Allow public read access on customers"
  on customers for select
  using (true);

create policy "Allow all operations on customers"
  on customers for all
  using (true)
  with check (true);

-- ============================================
-- ORDERS
-- ============================================
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,
  customer_id uuid references customers(id) on delete set null,
  total_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  final_amount numeric(12,2) not null default 0,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'partial', 'paid', 'failed', 'refunded')),
  order_status text not null default 'new'
    check (order_status in ('new', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled')),
  payment_method text not null default 'manual',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table orders enable row level security;

create policy "Allow public read access on orders"
  on orders for select
  using (true);

create policy "Allow all operations on orders"
  on orders for all
  using (true)
  with check (true);

-- ============================================
-- ORDER ITEMS
-- ============================================
create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null,
  cost_price numeric(12,2) not null,
  total_price numeric(12,2) not null,
  total_cost numeric(12,2) not null,
  profit_amount numeric(12,2) not null,
  created_at timestamptz not null default now()
);

alter table order_items enable row level security;

create policy "Allow public read access on order_items"
  on order_items for select
  using (true);

create policy "Allow all operations on order_items"
  on order_items for all
  using (true)
  with check (true);

-- ============================================
-- PAYMENTS
-- ============================================
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  amount numeric(12,2) not null,
  payment_method text not null default 'manual',
  transaction_reference text,
  payment_status text not null default 'paid'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  received_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

alter table payments enable row level security;

create policy "Allow public read access on payments"
  on payments for select
  using (true);

create policy "Allow all operations on payments"
  on payments for all
  using (true)
  with check (true);

-- ============================================
-- STOCK MOVEMENTS
-- ============================================
create table if not exists stock_movements (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  type text not null check (type in ('sale', 'stock_in', 'stock_adjustment', 'refund')),
  quantity_change integer not null,
  reason text,
  reference_type text,
  reference_id uuid,
  created_at timestamptz not null default now()
);

alter table stock_movements enable row level security;

create policy "Allow public read access on stock_movements"
  on stock_movements for select
  using (true);

create policy "Allow all operations on stock_movements"
  on stock_movements for all
  using (true)
  with check (true);

-- ============================================
-- UPDATE TIMESTAMP HELPER
-- ============================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger update_categories_updated_at
before update on categories
for each row execute function update_updated_at_column();

create or replace trigger update_occasions_updated_at
before update on occasions
for each row execute function update_updated_at_column();

create or replace trigger update_products_updated_at
before update on products
for each row execute function update_updated_at_column();

create or replace trigger update_customers_updated_at
before update on customers
for each row execute function update_updated_at_column();

create or replace trigger update_orders_updated_at
before update on orders
for each row execute function update_updated_at_column();

-- ============================================
-- STOCK AUTOMATION WHEN ORDER IS MARKED PAID
-- ============================================
create or replace function apply_paid_order_stock()
returns trigger as $$
declare
  item record;
begin
  if new.payment_status = 'paid' and old.payment_status is distinct from new.payment_status then
    for item in
      select product_id, quantity
      from order_items
      where order_id = new.id
    loop
      update products
      set quantity = quantity - item.quantity,
          sold_quantity = sold_quantity + item.quantity,
          updated_at = now()
      where id = item.product_id;

      insert into stock_movements (
        product_id,
        type,
        quantity_change,
        reason,
        reference_type,
        reference_id
      ) values (
        item.product_id,
        'sale',
        -item.quantity,
        'Order marked as paid',
        'order',
        new.id
      );
    end loop;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_apply_paid_order_stock on orders;
create trigger trg_apply_paid_order_stock
after update of payment_status on orders
for each row execute function apply_paid_order_stock();

-- ============================================
-- SAMPLE DATA EXAMPLES
-- ============================================
-- insert into categories (name, slug) values ('General', 'general');
-- insert into occasions (name, slug) values ('Birthday', 'birthday');
-- insert into products (name, description, image_url, category_id, cost_price, selling_price, quantity, tags)
-- values ('Keychain', 'Gift keychain', 'https://example.com/keychain.jpg', (select id from categories where slug = 'general'), 150, 250, 20, '{Keychain,Birthday}');

-- ============================================
-- REPORT QUERIES
-- ============================================
-- Total profit:
-- select sum(profit_amount) as total_profit
-- from order_items oi
-- join orders o on o.id = oi.order_id
-- where o.payment_status = 'paid';

-- Total sold units:
-- select sum(oi.quantity) as total_units_sold
-- from order_items oi
-- join orders o on o.id = oi.order_id
-- where o.payment_status = 'paid';

-- Product wise report:
-- select p.name,
--        sum(oi.quantity) as units_sold,
--        sum(oi.total_price) as revenue,
--        sum(oi.profit_amount) as profit
-- from products p
-- left join order_items oi on oi.product_id = p.id
-- left join orders o on o.id = oi.order_id
-- where o.payment_status = 'paid'
-- group by p.id, p.name
-- order by profit desc;
