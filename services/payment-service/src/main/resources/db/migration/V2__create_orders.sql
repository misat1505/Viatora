CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,

    category_id BIGINT NOT NULL,

    user_id VARCHAR(255) NOT NULL,

    duration_months INT NOT NULL,

    price INTEGER NOT NULL,

    status VARCHAR(50) NOT NULL,

    payment_provider_id VARCHAR(255),

    created_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_orders_category
        FOREIGN KEY(category_id)
        REFERENCES categories(id)
);