CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    price_1_month INTEGER NOT NULL,
    price_3_months INTEGER NOT NULL,
    price_6_months INTEGER NOT NULL,
    currency VARCHAR(50) NOT NULL
);

INSERT INTO categories
(name, price_1_month, price_3_months, price_6_months, currency)
VALUES
('AM', 499, 999, 1499, 'PLN'),
('A1', 699, 1499, 2499, 'PLN'),
('A2', 699, 1499, 2499, 'PLN'),
('A', 1799, 2699, 3999, 'PLN'),
('B1', 699, 1499, 2499, 'PLN'),
('B', 999, 1999, 3499, 'PLN'),
('C', 2299, 3999, 5999, 'PLN'),
('D', 2299, 3999, 5999, 'PLN');
