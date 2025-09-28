/*
  # Insert sample solar products

  This migration adds sample products for each category to demonstrate the platform.
*/

INSERT INTO products (name, description, price, image, category, specifications, features, rating, featured) VALUES

-- Inverters
('AIMS Power 2000W Pure Sine Wave Inverter', 'High-quality pure sine wave inverter perfect for home and office use. Converts 12V DC to 230V AC power with excellent efficiency.', 185000, 'https://images.pexels.com/photos/9875453/pexels-photo-9875453.jpeg?auto=compress&cs=tinysrgb&w=800', 'inverters', '{"power": "2000W", "voltage": "12V DC to 230V AC", "waveform": "Pure Sine Wave", "efficiency": "90%", "warranty": "2 years"}', '{"Pure sine wave output", "Built-in cooling fan", "Overload protection", "Low voltage shutdown", "LED status indicators"}', 5, true),

('Luminous Cruze 1050VA Inverter', 'Reliable square wave inverter with intelligent battery management. Ideal for basic home applications and small businesses.', 89000, 'https://images.pexels.com/photos/9875453/pexels-photo-9875453.jpeg?auto=compress&cs=tinysrgb&w=800', 'inverters', '{"power": "1050VA", "voltage": "12V", "type": "Square Wave", "backup_time": "3-8 hours", "warranty": "2 years"}', '{"Intelligent battery management", "Overload protection", "Short circuit protection", "Auto reset", "Maintenance-free operation"}', 4, false),

('Felicity Solar 3KVA Hybrid Inverter', 'Advanced hybrid inverter with built-in solar charge controller. Perfect for residential and commercial solar installations.', 320000, 'https://images.pexels.com/photos/9875453/pexels-photo-9875453.jpeg?auto=compress&cs=tinysrgb&w=800', 'inverters', '{"power": "3KVA", "voltage": "24V", "type": "Hybrid", "solar_controller": "60A PWM", "warranty": "3 years"}', '{"Built-in solar charge controller", "LCD display", "WiFi monitoring", "Multiple operation modes", "Grid-tie capability"}', 5, true),

-- Batteries
('Trojan T-105 6V Deep Cycle Battery', 'Premium flooded lead-acid battery designed for deep discharge applications. Excellent for solar energy storage systems.', 95000, 'https://images.pexels.com/photos/9875456/pexels-photo-9875456.jpeg?auto=compress&cs=tinysrgb&w=800', 'batteries', '{"voltage": "6V", "capacity": "225Ah", "type": "Deep Cycle Lead Acid", "cycles": "1500+", "warranty": "18 months"}', '{"Deep discharge capability", "Long cycle life", "Maintenance-free", "Vibration resistant", "Temperature compensation"}', 5, true),

('Luminous LPTT12150H Tubular Battery', 'High-performance tubular battery with advanced technology. Designed for inverter and UPS applications with extended life.', 65000, 'https://images.pexels.com/photos/9875456/pexels-photo-9875456.jpeg?auto=compress&cs=tinysrgb&w=800', 'batteries', '{"voltage": "12V", "capacity": "150Ah", "type": "Tubular", "life": "5-7 years", "warranty": "3 years"}', '{"Tubular technology", "High backup capacity", "Low maintenance", "Superior performance", "Corrosion resistant"}', 4, false),

('Tesla Powerwall 13.5kWh Lithium Battery', 'State-of-the-art lithium-ion battery storage system with integrated inverter. Perfect for residential energy storage.', 2800000, 'https://images.pexels.com/photos/9875456/pexels-photo-9875456.jpeg?auto=compress&cs=tinysrgb&w=800', 'batteries', '{"voltage": "400V", "capacity": "13.5kWh", "type": "Lithium-ion", "cycles": "6000+", "warranty": "10 years"}', '{"Integrated inverter", "Smart energy management", "Weather resistant", "Mobile app control", "Scalable system"}', 5, true),

-- Solar Panels
('Canadian Solar 450W Monocrystalline Panel', 'High-efficiency monocrystalline solar panel with excellent performance in low light conditions. Tier 1 manufacturer quality.', 85000, 'https://images.pexels.com/photos/9875447/pexels-photo-9875447.jpeg?auto=compress&cs=tinysrgb&w=800', 'panels', '{"power": "450W", "efficiency": "21.2%", "voltage": "45V", "current": "10A", "warranty": "25 years"}', '{"Tier 1 manufacturer", "Anti-reflective coating", "Corrosion resistant frame", "Positive power tolerance", "PID resistance"}', 5, true),

('JA Solar 330W Polycrystalline Panel', 'Cost-effective polycrystalline solar panel with reliable performance. Great value for money for residential installations.', 58000, 'https://images.pexels.com/photos/9875447/pexels-photo-9875447.jpeg?auto=compress&cs=tinysrgb&w=800', 'panels', '{"power": "330W", "efficiency": "17.1%", "voltage": "37.8V", "current": "8.7A", "warranty": "25 years"}', '{"Cost-effective solution", "Reliable performance", "Strong aluminum frame", "IP67 junction box", "Salt mist corrosion resistant"}', 4, false),

('SunPower Maxeon 400W Premium Panel', 'Premium solar panel with industry-leading efficiency and durability. Best-in-class performance and longest warranty.', 145000, 'https://images.pexels.com/photos/9875447/pexels-photo-9875447.jpeg?auto=compress&cs=tinysrgb&w=800', 'panels', '{"power": "400W", "efficiency": "22.6%", "voltage": "67.8V", "current": "5.9A", "warranty": "40 years"}', '{"Industry-leading efficiency", "Maxeon cell technology", "40-year warranty", "Extreme weather resilience", "Premium aesthetics"}', 5, true),

-- Charge Controllers
('Morningstar TriStar 60A MPPT Controller', 'Professional-grade MPPT charge controller with advanced features. Perfect for large solar installations and battery banks.', 185000, 'https://images.pexels.com/photos/9875450/pexels-photo-9875450.jpeg?auto=compress&cs=tinysrgb&w=800', 'controllers', '{"current": "60A", "voltage": "12/24/48V", "type": "MPPT", "efficiency": "98%", "warranty": "5 years"}', '{"TrakStar technology", "Advanced battery management", "Remote monitoring", "Lightning protection", "Temperature compensation"}', 5, true),

('Victron BlueSolar 30A PWM Controller', 'Reliable PWM charge controller with Bluetooth connectivity. Ideal for small to medium solar systems with smartphone monitoring.', 45000, 'https://images.pexels.com/photos/9875450/pexels-photo-9875450.jpeg?auto=compress&cs=tinysrgb&w=800', 'controllers', '{"current": "30A", "voltage": "12/24V", "type": "PWM", "bluetooth": "Yes", "warranty": "5 years"}', '{"Bluetooth monitoring", "Smartphone app", "Load output control", "Battery temperature sensor", "Programmable settings"}', 4, false),

-- Solar Kits
('Complete 5KW Solar Home System', 'Everything you need for a complete 5KW solar installation. Includes panels, inverter, batteries, and all mounting hardware.', 1850000, 'https://images.pexels.com/photos/9875445/pexels-photo-9875445.jpeg?auto=compress&cs=tinysrgb&w=800', 'kits', '{"power": "5KW", "panels": "12x 450W", "battery": "8x 200Ah", "inverter": "5KW Hybrid", "installation": "Professional"}', '{"Complete system", "Professional installation", "5-year warranty", "Monitoring system", "Grid-tie ready"}', 5, true),

('Basic 1KW Solar Starter Kit', 'Perfect starter kit for small homes or cabins. Easy to install with detailed instructions and all necessary components included.', 385000, 'https://images.pexels.com/photos/9875445/pexels-photo-9875445.jpeg?auto=compress&cs=tinysrgb&w=800', 'kits', '{"power": "1KW", "panels": "3x 330W", "battery": "2x 100Ah", "inverter": "1KW Pure Sine", "controller": "30A MPPT"}', '{"Easy installation", "Detailed manual", "All cables included", "Expandable system", "2-year warranty"}', 4, false),

-- Combos
('Inverter + Battery Power Combo', 'Perfect combination of 2KW inverter with compatible deep cycle batteries. Ready-to-use power solution for homes and offices.', 450000, 'https://images.pexels.com/photos/9875452/pexels-photo-9875452.jpeg?auto=compress&cs=tinysrgb&w=800', 'combos', '{"inverter": "2KW Pure Sine", "batteries": "4x 100Ah", "backup_time": "8-12 hours", "installation": "Free", "warranty": "2 years"}', '{"Pre-configured system", "Plug and play", "Free installation", "Extended warranty", "24/7 support"}', 5, true),

('Solar Panel + Controller Bundle', 'High-efficiency solar panels paired with advanced MPPT charge controller. Perfect for expanding existing systems or new installations.', 285000, 'https://images.pexels.com/photos/9875452/pexels-photo-9875452.jpeg?auto=compress&cs=tinysrgb&w=800', 'combos', '{"panels": "4x 330W", "controller": "40A MPPT", "power": "1320W", "voltage": "12/24V", "warranty": "25 years panels"}', '{"Matched components", "Optimized performance", "Professional grade", "Weather resistant", "Long warranty"}', 4, false);