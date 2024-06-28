import pg from 'pg';
const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost:5432/sqlJoins';

export const client = new Client(DATABASE_URL);

export const connectDB = async () => {
    try {
        await client.connect();
        console.log('Connected to the database');
    } catch (e) {
        console.log('Failed to connect to DB');
        console.error(e);
        throw e;
    }
};

export const seedCustomer = async () => {
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS Customer (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE
            );

            INSERT INTO Customer (name)
            VALUES
                ('Chris'),
                ('David')
            ON CONFLICT (name) DO NOTHING;
        `);
    } catch (e) {
        throw e;
    }
};

export const seedRestaurant = async () => {
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS Restaurant (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE
            );

            INSERT INTO Restaurant (name)
            VALUES
                ('McFarmers'),
                ('BurgerQueen')
            ON CONFLICT (name) DO NOTHING;
        `);
    } catch (e) {
        throw e;
    }
};

export const seedReservation = async () => {
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS Reservation (
                id SERIAL PRIMARY KEY,
                date DATE NOT NULL,
                party_count INTEGER NOT NULL,
                restaurant_id INTEGER REFERENCES Restaurant(id) NOT NULL,
                customer_id INTEGER REFERENCES Customer(id) NOT NULL
            );

            INSERT INTO Reservation (date, party_count, restaurant_id, customer_id)
            VALUES
                ('2023-06-28', 2, 
                    (SELECT id FROM Restaurant WHERE name='McFarmers'),
                    (SELECT id FROM Customer WHERE name='Chris')),
                ('2023-07-14', 4, 
                    (SELECT id FROM Restaurant WHERE name='BurgerQueen'),
                    (SELECT id FROM Customer WHERE name='David'))
            ON CONFLICT (id) DO NOTHING;
        `);
    } catch (e) {
        throw e;
    }
};
