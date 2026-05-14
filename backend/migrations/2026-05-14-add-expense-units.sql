ALTER TABLE expenses
  ADD COLUMN unit_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER project_name,
  ADD COLUMN units INT NOT NULL DEFAULT 1 AFTER unit_amount;

UPDATE expenses
SET unit_amount = amount,
    units = 1
WHERE unit_amount = 0.00;
