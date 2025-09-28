/*
  # Create orders and order_items tables

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `customer_name` (text, customer name)
      - `customer_email` (text, customer email)
      - `customer_phone` (text, customer phone)
      - `customer_address` (text, delivery address)
      - `total_amount` (numeric, total order amount)
      - `status` (text, order status)
      - `payment_reference` (text, paystack payment reference)
      - `created_at` (timestamptz, default now())

    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `product_id` (int8, foreign key to products)
      - `product_name` (text, product name snapshot)
      - `product_price` (numeric, product price snapshot)
      - `quantity` (int, quantity ordered)
      - `subtotal` (numeric, line item subtotal)

  2. Security
    - Enable RLS on both tables
    - Add appropriate policies
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text NOT NULL,
  total_amount numeric NOT NULL CHECK (total_amount > 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_reference text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id bigint REFERENCES products(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  product_price numeric NOT NULL,
  quantity int NOT NULL CHECK (quantity > 0),
  subtotal numeric NOT NULL CHECK (subtotal > 0)
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Allow authenticated users to read orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public to insert orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true);

-- Order items policies
CREATE POLICY "Allow authenticated users to read order_items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public to insert order_items"
  ON order_items
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update order_items"
  ON order_items
  FOR UPDATE
  TO authenticated
  USING (true);