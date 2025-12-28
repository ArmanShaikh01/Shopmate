-- ============================================================
-- KIRANA SHOP INVENTORY - SEED DATA
-- ============================================================
-- Comprehensive product catalog for a typical Indian Kirana shop
-- Execute this as a SHOPKEEPER user to populate inventory

-- ============================================================
-- GROCERIES & STAPLES
-- ============================================================

INSERT INTO products (name, description, price, stock_quantity, category, is_active) VALUES
-- Rice & Grains
('Basmati Rice (1kg)', 'Premium aged basmati rice', 120.00, 150, 'Groceries', true),
('Sona Masoori Rice (1kg)', 'Daily use rice', 65.00, 200, 'Groceries', true),
('Brown Rice (1kg)', 'Healthy brown rice', 95.00, 80, 'Groceries', true),
('Wheat Flour (1kg)', 'Whole wheat atta', 45.00, 300, 'Groceries', true),
('Maida/All Purpose Flour (1kg)', 'Refined wheat flour', 40.00, 150, 'Groceries', true),
('Besan/Gram Flour (500g)', 'Chickpea flour', 60.00, 100, 'Groceries', true),
('Rava/Sooji (500g)', 'Semolina', 35.00, 120, 'Groceries', true),
('Poha (500g)', 'Flattened rice', 30.00, 90, 'Groceries', true),

-- Pulses & Dals
('Toor Dal (1kg)', 'Yellow pigeon peas', 140.00, 180, 'Groceries', true),
('Moong Dal (1kg)', 'Green gram split', 130.00, 150, 'Groceries', true),
('Masoor Dal (1kg)', 'Red lentils', 110.00, 140, 'Groceries', true),
('Chana Dal (1kg)', 'Bengal gram split', 100.00, 120, 'Groceries', true),
('Urad Dal (1kg)', 'Black gram split', 125.00, 110, 'Groceries', true),
('Rajma (500g)', 'Red kidney beans', 90.00, 80, 'Groceries', true),
('Kabuli Chana (500g)', 'White chickpeas', 75.00, 85, 'Groceries', true),
('Kala Chana (500g)', 'Black chickpeas', 65.00, 70, 'Groceries', true),

-- Cooking Oils
('Sunflower Oil (1L)', 'Refined sunflower oil', 145.00, 100, 'Cooking Oils', true),
('Mustard Oil (1L)', 'Kachi ghani mustard oil', 180.00, 80, 'Cooking Oils', true),
('Groundnut Oil (1L)', 'Cold pressed peanut oil', 200.00, 60, 'Cooking Oils', true),
('Olive Oil (500ml)', 'Extra virgin olive oil', 450.00, 40, 'Cooking Oils', true),
('Coconut Oil (500ml)', 'Pure coconut oil', 160.00, 70, 'Cooking Oils', true),
('Ghee (500ml)', 'Pure cow ghee', 320.00, 90, 'Dairy', true);

-- ============================================================
-- SPICES & CONDIMENTS
-- ============================================================

INSERT INTO products (name, description, price, stock_quantity, category, is_active) VALUES
('Turmeric Powder (100g)', 'Pure haldi powder', 40.00, 150, 'Spices', true),
('Red Chilli Powder (100g)', 'Hot chilli powder', 45.00, 140, 'Spices', true),
('Coriander Powder (100g)', 'Dhania powder', 35.00, 130, 'Spices', true),
('Cumin Powder (100g)', 'Jeera powder', 50.00, 120, 'Spices', true),
('Garam Masala (50g)', 'Blend of spices', 60.00, 110, 'Spices', true),
('Black Pepper (50g)', 'Whole black pepper', 80.00, 100, 'Spices', true),
('Mustard Seeds (100g)', 'Rai/Sarson', 30.00, 95, 'Spices', true),
('Cumin Seeds (100g)', 'Jeera', 55.00, 100, 'Spices', true),
('Coriander Seeds (100g)', 'Sabut dhania', 40.00, 90, 'Spices', true),
('Fennel Seeds (100g)', 'Saunf', 45.00, 85, 'Spices', true),
('Cardamom (50g)', 'Elaichi', 200.00, 50, 'Spices', true),
('Cinnamon Sticks (50g)', 'Dalchini', 90.00, 60, 'Spices', true),
('Bay Leaves (10g)', 'Tej patta', 25.00, 80, 'Spices', true),
('Cloves (50g)', 'Laung', 120.00, 55, 'Spices', true),
('Salt (1kg)', 'Iodized salt', 20.00, 250, 'Groceries', true),
('Sugar (1kg)', 'White refined sugar', 45.00, 200, 'Groceries', true),
('Jaggery (500g)', 'Gud/Natural sweetener', 60.00, 100, 'Groceries', true);

-- ============================================================
-- PACKAGED FOODS & SNACKS
-- ============================================================

INSERT INTO products (name, description, price, stock_quantity, category, is_active) VALUES
-- Biscuits & Cookies
('Parle-G Biscuits', 'Classic glucose biscuits', 10.00, 300, 'Snacks', true),
('Good Day Butter Cookies', 'Butter cookies', 30.00, 200, 'Snacks', true),
('Oreo Cookies', 'Chocolate cream cookies', 40.00, 150, 'Snacks', true),
('Monaco Crackers', 'Salted crackers', 20.00, 180, 'Snacks', true),
('Marie Gold Biscuits', 'Tea-time biscuits', 25.00, 160, 'Snacks', true),

-- Namkeen & Chips
('Kurkure (90g)', 'Spicy corn puffs', 20.00, 200, 'Snacks', true),
('Lays Chips (52g)', 'Potato chips', 20.00, 250, 'Snacks', true),
('Haldirams Bhujia (200g)', 'Crispy snack', 50.00, 120, 'Snacks', true),
('Aloo Bhujia (200g)', 'Potato snack', 45.00, 110, 'Snacks', true),
('Banana Chips (100g)', 'Kerala style', 35.00, 90, 'Snacks', true),
('Roasted Peanuts (250g)', 'Salted peanuts', 50.00, 100, 'Snacks', true),

-- Instant Foods
('Maggi Noodles (70g)', 'Instant noodles', 14.00, 300, 'Instant Food', true),
('Top Ramen (75g)', 'Instant ramen', 15.00, 250, 'Instant Food', true),
('MTR Ready to Eat (300g)', 'Dal makhani', 110.00, 80, 'Instant Food', true),
('Knorr Soup (20g)', 'Instant soup', 20.00, 150, 'Instant Food', true);

-- ============================================================
-- BEVERAGES
-- ============================================================

INSERT INTO products (name, description, price, stock_quantity, category, is_active) VALUES
-- Tea & Coffee
('Tata Tea Gold (250g)', 'Premium tea leaves', 150.00, 120, 'Beverages', true),
('Red Label Tea (250g)', 'Popular tea', 140.00, 140, 'Beverages', true),
('Society Tea (250g)', 'Quality tea', 135.00, 100, 'Beverages', true),
('Nescafe Coffee (50g)', 'Instant coffee', 180.00, 90, 'Beverages', true),
('Bru Coffee (50g)', 'Instant coffee', 175.00, 95, 'Beverages', true),
('Green Tea Bags (25 bags)', 'Herbal green tea', 150.00, 70, 'Beverages', true),

-- Cold Beverages
('Coca Cola (750ml)', 'Soft drink', 40.00, 150, 'Beverages', true),
('Pepsi (750ml)', 'Soft drink', 40.00, 140, 'Beverages', true),
('Sprite (750ml)', 'Lemon soft drink', 40.00, 130, 'Beverages', true),
('Thumbs Up (750ml)', 'Cola', 40.00, 120, 'Beverages', true),
('Frooti (200ml)', 'Mango drink', 20.00, 200, 'Beverages', true),
('Real Juice (1L)', 'Fruit juice', 120.00, 80, 'Beverages', true),
('Amul Kool (200ml)', 'Flavored milk', 25.00, 100, 'Beverages', true),

-- Packaged Water
('Bisleri Water (1L)', 'Mineral water', 20.00, 300, 'Beverages', true),
('Kinley Water (1L)', 'Packaged water', 20.00, 280, 'Beverages', true);

-- ============================================================
-- DAIRY PRODUCTS
-- ============================================================

INSERT INTO products (name, description, price, stock_quantity, category, is_active) VALUES
('Amul Milk (500ml)', 'Full cream milk', 30.00, 150, 'Dairy', true),
('Amul Toned Milk (500ml)', 'Low fat milk', 25.00, 140, 'Dairy', true),
('Amul Butter (100g)', 'Table butter', 60.00, 100, 'Dairy', true),
('Amul Cheese Slices (200g)', 'Processed cheese', 140.00, 80, 'Dairy', true),
('Amul Fresh Cream (250ml)', 'Cooking cream', 90.00, 70, 'Dairy', true),
('Mother Dairy Dahi (400g)', 'Fresh curd', 35.00, 120, 'Dairy', true),
('Amul Paneer (200g)', 'Cottage cheese', 90.00, 60, 'Dairy', true),
('Nestle Milk Powder (400g)', 'Instant milk powder', 280.00, 50, 'Dairy', true);

-- ============================================================
-- PERSONAL CARE
-- ============================================================

INSERT INTO products (name, description, price, stock_quantity, category, is_active) VALUES
-- Bath & Body
('Lux Soap (125g)', 'Beauty soap', 40.00, 200, 'Personal Care', true),
('Dove Soap (125g)', 'Moisturizing soap', 60.00, 150, 'Personal Care', true),
('Lifebuoy Soap (125g)', 'Germ protection', 35.00, 180, 'Personal Care', true),
('Dettol Soap (125g)', 'Antiseptic soap', 45.00, 160, 'Personal Care', true),
('Clinic Plus Shampoo (180ml)', 'Hair shampoo', 85.00, 120, 'Personal Care', true),
('Head & Shoulders (180ml)', 'Anti-dandruff', 210.00, 90, 'Personal Care', true),
('Pantene Shampoo (180ml)', 'Hair care', 190.00, 85, 'Personal Care', true),

-- Oral Care
('Colgate Toothpaste (200g)', 'Dental care', 120.00, 150, 'Personal Care', true),
('Pepsodent (200g)', 'Germ protection', 100.00, 140, 'Personal Care', true),
('Sensodyne (150g)', 'Sensitive teeth', 220.00, 70, 'Personal Care', true),
('Colgate Toothbrush', 'Medium bristles', 45.00, 100, 'Personal Care', true),
('Oral-B Toothbrush', 'Soft bristles', 60.00, 80, 'Personal Care', true),
('Listerine Mouthwash (250ml)', 'Mouth rinse', 180.00, 60, 'Personal Care', true),

-- Hair Care
('Parachute Coconut Oil (200ml)', 'Hair oil', 85.00, 120, 'Personal Care', true),
('Dabur Amla Hair Oil (200ml)', 'Nourishing oil', 95.00, 110, 'Personal Care', true),
('Clinic Plus Oil (175ml)', 'Hair oil', 110.00, 90, 'Personal Care', true);

-- ============================================================
-- HOUSEHOLD ITEMS
-- ============================================================

INSERT INTO products (name, description, price, stock_quantity, category, is_active) VALUES
-- Cleaning Products
('Vim Bar (200g)', 'Dishwash bar', 20.00, 200, 'Household', true),
('Vim Liquid (500ml)', 'Dishwash liquid', 90.00, 120, 'Household', true),
('Surf Excel (1kg)', 'Detergent powder', 180.00, 100, 'Household', true),
('Ariel Detergent (1kg)', 'Washing powder', 200.00, 90, 'Household', true),
('Tide Detergent (1kg)', 'Laundry detergent', 190.00, 95, 'Household', true),
('Harpic Toilet Cleaner (500ml)', 'Bathroom cleaner', 110.00, 80, 'Household', true),
('Lizol Floor Cleaner (500ml)', 'Disinfectant', 120.00, 85, 'Household', true),
('Colin Glass Cleaner (500ml)', 'Glass & surface', 140.00, 70, 'Household', true),

-- Kitchen Essentials
('Scotch Brite Scrubber (3 pcs)', 'Cleaning scrub', 45.00, 150, 'Household', true),
('Garbage Bags (30 pcs)', 'Medium size', 80.00, 100, 'Household', true),
('Aluminium Foil (10m)', 'Kitchen foil', 60.00, 90, 'Household', true),
('Cling Film (30m)', 'Food wrap', 70.00, 75, 'Household', true),
('Tissue Paper Box (100 pulls)', 'Facial tissues', 50.00, 120, 'Household', true),
('Kitchen Towel (2 rolls)', 'Paper towels', 90.00, 85, 'Household', true),

-- Pest Control
('Good Knight Refill', 'Mosquito repellent', 35.00, 150, 'Household', true),
('All Out Refill', 'Liquid vaporizer', 40.00, 140, 'Household', true),
('Hit Spray (400ml)', 'Insect killer', 180.00, 80, 'Household', true),
('Mortein Coils (10 coils)', 'Mosquito coils', 50.00, 100, 'Household', true);

-- ============================================================
-- BABY CARE
-- ============================================================

INSERT INTO products (name, description, price, stock_quantity, category, is_active) VALUES
('Johnson Baby Soap (125g)', 'Gentle baby soap', 65.00, 100, 'Baby Care', true),
('Johnson Baby Oil (200ml)', 'Baby massage oil', 180.00, 80, 'Baby Care', true),
('Johnson Baby Powder (200g)', 'Baby talcum powder', 160.00, 90, 'Baby Care', true),
('Pampers Diapers (20 pcs)', 'Baby diapers medium', 550.00, 60, 'Baby Care', true),
('Huggies Wipes (80 pcs)', 'Baby wet wipes', 180.00, 70, 'Baby Care', true),
('Cerelac (300g)', 'Baby food', 240.00, 50, 'Baby Care', true);

-- ============================================================
-- STATIONERY & MISC
-- ============================================================

INSERT INTO products (name, description, price, stock_quantity, category, is_active) VALUES
('Classmate Notebook (172 pages)', 'Single ruled', 45.00, 150, 'Stationery', true),
('Cello Pen (Blue)', 'Ball point pen', 10.00, 300, 'Stationery', true),
('Apsara Pencil (Pack of 10)', 'Writing pencils', 50.00, 120, 'Stationery', true),
('Fevistick (15g)', 'Glue stick', 25.00, 100, 'Stationery', true),
('Natraj Sharpener', 'Pencil sharpener', 5.00, 200, 'Stationery', true),
('Candles (Pack of 5)', 'Wax candles', 30.00, 100, 'Household', true),
('Matchbox (10 boxes)', 'Safety matches', 30.00, 150, 'Household', true),
('AA Batteries (4 pcs)', 'Alkaline batteries', 80.00, 80, 'Electronics', true),
('AAA Batteries (4 pcs)', 'Small batteries', 70.00, 75, 'Electronics', true);

-- Verify total products inserted
SELECT 
  category,
  COUNT(*) as product_count,
  SUM(stock_quantity) as total_stock
FROM products
GROUP BY category
ORDER BY category;

-- Show summary
SELECT 
  COUNT(*) as total_products,
  SUM(stock_quantity) as total_items_in_stock,
  COUNT(DISTINCT category) as total_categories
FROM products;
