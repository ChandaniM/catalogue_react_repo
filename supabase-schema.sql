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

-- Insert some sample data (optional - remove if you don't want dummy data)
INSERT INTO products (name, description, image_url, cost_price, selling_price, quantity) VALUES
  ('Handcrafted Candle Set', 'Set of 3 premium soy candles with calming lavender, vanilla, and rose scents. Perfect for cozy evenings.', 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=400&h=400&fit=crop', 450, 699, 15),
  ('Personalized Photo Frame', 'Elegant wooden frame with custom engraving. A timeless gift to cherish memories forever.', 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=400&h=400&fit=crop', 320, 549, 25),
  ('Luxury Gift Hamper', 'Curated collection of gourmet chocolates, artisan cookies, and premium tea in a beautiful basket.', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop', 850, 1299, 8),
  ('Crystal Jewelry Box', 'Stunning vintage-style jewelry box with velvet interior. Perfect for storing precious accessories.', 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=400&fit=crop', 580, 899, 12),
  ('Succulent Plant Set', 'Beautiful mini succulents in decorative ceramic pots. Low maintenance, perfect for home or office.', 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=400&fit=crop', 280, 449, 30),
  ('Silk Scarf Collection', 'Luxurious hand-painted silk scarves with unique floral patterns. A statement accessory.', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=400&fit=crop', 720, 1099, 18);

-- Done! Your products table is ready.
