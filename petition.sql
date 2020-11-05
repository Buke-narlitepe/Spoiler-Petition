-- createdb petition
-- psql -d petition -f petition.sql

DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    firstname VARCHAR(100),
    lastname VARCHAR(100),
    signature VARCHAR
);