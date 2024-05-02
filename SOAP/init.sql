CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    about VARCHAR(500),
    price FLOAT
);

INSERT INTO products (name, about, price) VALUES
    ('My First Game', 'This is an awsome game!', 60);

CREATE TABLE products2 (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    about VARCHAR(500),
    price FLOAT
);

INSERT INTO products2 (name, about, price) VALUES
    ('My First Game', 'This is an awsome game!', 60);
