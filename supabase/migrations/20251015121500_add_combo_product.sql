-- Migration: add a sample combo product

INSERT INTO products (name, description, price, image, category, specifications, features, rating, in_stock, featured, created_at)
VALUES
('Home Solar Combo Pack - 3kW', 'Complete 3kW home solar combo including panels, inverter, and battery — ideal for small homes.', 450000, 'https://example.com/images/combo-3kw.jpg', 'combos', '{"panels": "4 x 375W", "inverter": "3kW hybrid", "battery": "5kWh"}', '{"Complete kit","Professional warranty","Easy install"}', 4.7, true, true, now());

-- End of migration
