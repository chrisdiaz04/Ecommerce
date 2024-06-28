import express from 'express';
import bodyParser from 'body-parser';
import { connectDB, client, seedCustomer, seedRestaurant, seedReservation } from './db.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const startDB = async () => {
    try {
        await connectDB();
        
        await seedCustomer();
        await seedRestaurant();
        await seedReservation();
        
        console.log('Database initialization and seeding complete');
    } catch (e) {
        console.log('Error during database initialization');
        console.error(e);
        throw e;
    }
};

startDB();

app.get('/api/customers', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM Customer');
        res.json(result.rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

app.get('/api/restaurants', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM Restaurant');
        res.json(result.rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch restaurants' });
    }
});

app.get('/api/reservations', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM Reservation');
        res.json(result.rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
});

app.post('/api/customers/:id/reservations', async (req, res) => {
    const { id } = req.params;
    const { restaurant_id, date, party_count } = req.body;

    try {
        const result = await client.query(
            `INSERT INTO Reservation (date, party_count, restaurant_id, customer_id) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [date, party_count, restaurant_id, id]
        );
        res.status(201).json(result.rows[0]);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create reservation' });
    }
});

app.delete('/api/customers/:customer_id/reservations/:id', async (req, res) => {
    const { customer_id, id } = req.params;

    try {
        await client.query(
            `DELETE FROM Reservation WHERE id = $1 AND customer_id = $2`,
            [id, customer_id]
        );
        res.status(204).send();
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to delete reservation' });
    }
});

// Error handling route
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
