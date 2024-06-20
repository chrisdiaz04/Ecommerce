import pg from 'pg';
import express from 'express';

const { Client } = pg;
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost:5432/Acme_Directory';

const client = new Client({ connectionString: DATABASE_URL });

app.get('/api/Employees', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM Employees');
    res.json(result.rows);
  } catch (e) {
    console.error('Error fetching employees:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/Employees', async (req, res) => {
  const { department_id } = req.body;

  if (!department_id) {
    return res.status(400).json({ error: 'department_id is required' });
  }

  try {
    const result = await client.query(`
      INSERT INTO Employees (department_id) 
      VALUES ($1) 
      RETURNING *`, [department_id]);

    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error('Error inserting employee:', e);
    res.status(500).json({ error: 'Internal server error', details: e.detail });
  }
});

app.post('/api/Departments', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  try {
    const result = await client.query(`
      INSERT INTO Departments (name) 
      VALUES ($1) 
      RETURNING *`, [name]);

    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error('Error inserting department:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const startApp = async () => {
  try {
    await client.connect();

    await client.query(`
      DROP TABLE IF EXISTS Employees;
      DROP TABLE IF EXISTS Departments;

      CREATE TABLE IF NOT EXISTS Departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS Employees (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        department_id INTEGER REFERENCES Departments(id) NOT NULL
      );

      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER update_employees_updated_at
      BEFORE UPDATE ON Employees
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    app.listen(PORT, () => {
      console.log(`Server is now listening on port ${PORT}`);
    });
  } catch (e) {
    console.log('Server no work');
    console.error('Database connection error:', e);
  }
};

startApp();
