ALTER TABLE expense_categories
  ADD COLUMN default_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER description;
