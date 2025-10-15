-- Migration: add sample products for new categories (Solar Street Lights, CCTV, Solar Gadgets)
-- NOTE: Run this against your Supabase database (psql or supabase migration tool)

INSERT INTO products (name, description, price, image, category, specifications, features, rating, in_stock, featured, created_at)
VALUES
('Solar Street Light Model S100', 'All-in-one solar street light with integrated battery and PIR sensor, suitable for outdoor public lighting.', 95000, 'https://example.com/images/street-light-s100.jpg', 'street-lights', '{"power": "100W", "battery": "40Ah", "ip_rating": "IP65"}', '{"Long runtime","Smart dusk-to-dawn","PIR motion sensor"}', 4.5, true, false, now()),
('4K CCTV Dome Camera Pro', 'Weatherproof 4K dome CCTV camera with night vision and remote access via mobile app.', 45000, 'https://example.com/images/cctv-4k-dome.jpg', 'cctv', '{"resolution": "4K", "night_vision": "Yes", "warranty": "2 years"}', '{"Remote viewing","Night vision","Motion alerts"}', 4.6, true, false, now()),
('Portable Solar Charger X20', 'Compact portable solar charger for phones and small gadgets. Includes built-in powerbank and USB-C output.', 12000, 'https://example.com/images/solar-charger-x20.jpg', 'gadgets', '{"capacity": "10000mAh", "output": "USB-C 18W", "weight": "220g"}', '{"Fast charging","Compact design","Durable"}', 4.2, true, true, now());

-- End of migration
