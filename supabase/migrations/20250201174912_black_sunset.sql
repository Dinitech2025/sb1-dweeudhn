/*
  # Add products, services, and reports management

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `stock` (integer)
      - `created_at` (timestamp)
      
    - `services`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `duration_minutes` (integer)
      - `created_at` (timestamp)
      
    - `expenses`
      - `id` (uuid, primary key)
      - `description` (text)
      - `amount` (numeric)
      - `date` (date)
      - `category` (text)
      - `created_at` (timestamp)
      
    - `sales`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, references customers)
      - `total_amount` (numeric)
      - `date` (date)
      - `status` (text)
      - `created_at` (timestamp)
      
    - `sale_items`
      - `id` (uuid, primary key)
      - `sale_id` (uuid, references sales)
      - `product_id` (uuid, references products, nullable)
      - `service_id` (uuid, references services, nullable)
      - `quantity` (integer)
      - `unit_price` (numeric)
      - `total_price` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage products"
  ON products FOR ALL
  TO authenticated
  USING (true);

-- Services table
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage services"
  ON services FOR ALL
  TO authenticated
  USING (true);

-- Expenses table
CREATE TABLE expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  date date NOT NULL DEFAULT CURRENT_DATE,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage expenses"
  ON expenses FOR ALL
  TO authenticated
  USING (true);

-- Sales table
CREATE TABLE sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage sales"
  ON sales FOR ALL
  TO authenticated
  USING (true);

-- Sale items table
CREATE TABLE sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  service_id uuid REFERENCES services(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  created_at timestamptz DEFAULT now(),
  CHECK (
    (product_id IS NOT NULL AND service_id IS NULL) OR
    (product_id IS NULL AND service_id IS NOT NULL)
  )
);

ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage sale items"
  ON sale_items FOR ALL
  TO authenticated
  USING (true);

-- Create views for reports
CREATE VIEW daily_sales_report AS
SELECT 
  date,
  COUNT(*) as total_sales,
  SUM(total_amount) as total_revenue,
  COUNT(DISTINCT customer_id) as unique_customers
FROM sales
WHERE status = 'completed'
GROUP BY date
ORDER BY date DESC;

CREATE VIEW monthly_sales_report AS
SELECT 
  DATE_TRUNC('month', date) as month,
  COUNT(*) as total_sales,
  SUM(total_amount) as total_revenue,
  COUNT(DISTINCT customer_id) as unique_customers
FROM sales
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC;

CREATE VIEW product_sales_report AS
SELECT 
  p.name as product_name,
  COUNT(si.id) as times_sold,
  SUM(si.quantity) as total_quantity,
  SUM(si.total_price) as total_revenue
FROM products p
LEFT JOIN sale_items si ON si.product_id = p.id
LEFT JOIN sales s ON si.sale_id = s.id AND s.status = 'completed'
GROUP BY p.id, p.name
ORDER BY total_revenue DESC NULLS LAST;

CREATE VIEW service_sales_report AS
SELECT 
  s.name as service_name,
  COUNT(si.id) as times_sold,
  SUM(si.quantity) as total_quantity,
  SUM(si.total_price) as total_revenue
FROM services s
LEFT JOIN sale_items si ON si.service_id = s.id
LEFT JOIN sales sa ON si.sale_id = sa.id AND sa.status = 'completed'
GROUP BY s.id, s.name
ORDER BY total_revenue DESC NULLS LAST;

-- Create functions for reports
CREATE OR REPLACE FUNCTION get_sales_report(
  start_date date,
  end_date date,
  report_type text -- 'daily', 'weekly', or 'monthly'
)
RETURNS TABLE (
  period text,
  total_sales bigint,
  total_revenue numeric,
  unique_customers bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN report_type = 'daily' THEN date::text
      WHEN report_type = 'weekly' THEN 'Week ' || DATE_PART('week', date)::text
      ELSE TO_CHAR(date, 'Month YYYY')
    END as period,
    COUNT(*) as total_sales,
    SUM(total_amount) as total_revenue,
    COUNT(DISTINCT customer_id) as unique_customers
  FROM sales
  WHERE 
    status = 'completed' AND
    date BETWEEN start_date AND end_date
  GROUP BY 
    CASE 
      WHEN report_type = 'daily' THEN date::text
      WHEN report_type = 'weekly' THEN DATE_PART('week', date)::text
      ELSE TO_CHAR(date, 'Month YYYY')
    END
  ORDER BY MIN(date) DESC;
END;
$$ LANGUAGE plpgsql;