CREATE TABLE subscriptions (
    id BIGSERIAL PRIMARY KEY,

    user_id VARCHAR(255) NOT NULL,

    category_id BIGINT NOT NULL,

    order_id BIGINT NOT NULL,

    starts_at DATE NOT NULL,

    expires_at DATE NOT NULL,

    CONSTRAINT fk_subscription_category
        FOREIGN KEY(category_id)
        REFERENCES categories(id),

    CONSTRAINT fk_subscription_order
        FOREIGN KEY(order_id)
        REFERENCES orders(id)
);