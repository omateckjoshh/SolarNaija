/*
  # Create products table for SolarNaija e-commerce

  1. New Tables
    - `products`
      - `id` (int8, primary key, auto-increment)
      - `name` (text, product name)
      - `description` (text, product description)
      - `price` (numeric, product price in naira)
      - `image` (text, product image URL)
      - `category` (text, product category)
      - `specifications` (jsonb, product specifications)
      - `features` (text[], product features array)
      - `rating` (numeric, default 5, product rating)
      - `in_stock` (boolean, default true, stock status)
      - `featured` (boolean, default false, featured product)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `products` table
    - Add policies for public read access
    - Add policies for authenticated admin write access
*/

CREATE TABLE IF NOT EXISTS products (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price > 0),
  image text NOT NULL,
  category text NOT NULL,
  specifications jsonb DEFAULT '{}',
  features text[] DEFAULT '{}',
  rating numeric DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  in_stock boolean DEFAULT true,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Allow public read access to products"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- Policy for authenticated users to insert products
CREATE POLICY "Allow authenticated users to insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for authenticated users to update products
CREATE POLICY "Allow authenticated users to update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy for authenticated users to delete products
CREATE POLICY "Allow authenticated users to delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();