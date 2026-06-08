-- Uphar Gift Shop - Supabase Database Schema
-- Run this in your Supabase SQL Editor (SQL Editor > New Query)

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  selling_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If you already have the table, add the tags column with:
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read products (for catalogue page)
CREATE POLICY "Allow public read access" ON products
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can insert/update/delete (for admin)
-- For now, we'll allow all operations since we're using simple password auth
CREATE POLICY "Allow all operations" ON products
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the function on update
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Done! Your products table is ready.
-- ============================================
-- ADMIN USERS TABLE
-- ============================================

-- Create admin_users table for authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- NO public read policy! Use RPC function instead for security.

-- Enable crypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Secure RPC function for admin login (bcrypt comparison)
CREATE OR REPLACE FUNCTION verify_admin_login(input_email TEXT, input_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = input_email 
    AND password = crypt(input_password, password)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Done! Admin users table is ready.
-- Add admin user: INSERT INTO admin_users (email, password) 
-- VALUES ('admin@uphargifts.com', crypt('YourPassword', gen_salt('bf')));

-- ============================================
-- CATEGORIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cover_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations on categories" ON categories
  FOR ALL USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TAGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on tags" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations on tags" ON tags
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- PRODUCT CATEGORY RELATIONSHIP
-- ============================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Migrate existing products without a category into a default "General" category
INSERT INTO categories (name, slug)
SELECT 'General', 'general'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'general');

UPDATE products
SET category_id = (SELECT id FROM categories WHERE slug = 'general' LIMIT 1)
WHERE category_id IS NULL;