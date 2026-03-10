console.log("Welcome!");

// ===== 1️⃣ Imports =====
const express = require("express");
const cors = require("cors");
const { Pool } = require('pg');
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");



// ===== 2️⃣ App Setup =====
const app = express();
app.use(cors());
app.use(express.json());

// ===== 3️⃣ pg =====
require('dotenv').config({ path: __dirname + '/.env' });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD), // ensure string
  port: Number(process.env.DB_PORT),
});
async function connectDB() {
  try {
    await pool.connect();
    console.log("✅ Connected to Postgres");
  } catch (err) {
    console.error("❌ Postgres connection error, retrying...");
    setTimeout(connectDB, 5000);
  }
}

connectDB();

  console.log('DB_PASSWORD type:', typeof process.env.DB_PASSWORD, process.env.DB_PASSWORD ? 'set' : 'undefined');
// ===== 4️⃣ Swagger Setup =====
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CRUD API Documentation",
      version: "1.0.0",
      description: "A simple CRUD API using Express and Supabase",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./index.js"], // <-- this file contains the JSDoc comments
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /assignments:
 *   get:
 *     summary: Get all assignments
 *     responses:
 *       200:
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Assignment'
 */
app.get('/assignments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM assignments');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /assignments:
 * post:
 * summary: Create a new assignment
 * tags: [Assignments]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - studentname
 * - title
 * - content
 * properties:
 * studentname:
 * type: string
 * title:
 * type: string
 * content:
 * type: string
 * responses:
 * 201:
 * description: Assignment created successfully
 * 400:
 * description: Missing required fields
 * 500:
 * description: Server error    
 */
  app.post('/assignments', async (req, res) => {
  const { studentname, title, content } = req.body; 

  try {
    const result = await pool.query(
      'INSERT INTO assignments (studentname, title, content) VALUES ($1, $2, $3) RETURNING *',
      [studentname, title, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /assignments/{id}:
 *   get:
 *     summary: Get assignment by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Assignment found
 *       404:
 *         description: Assignment not found
 */
app.get("/assignments/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID must be a number" });

  try {
    const result = await pool.query('SELECT * FROM assignments WHERE id=$1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Assignment not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




/**
 * @swagger
 * /assignments/{id}:
 *   put:
 *     summary: Update an assignment
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentname:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Assignment updated successfully
 *       400:
 *         description: Invalid ID or missing fields
 */
app.put('/assignments/:id', async (req, res) => {
  const { id } = req.params;
  const { studentname, title, content } = req.body;

  try {
    const result = await pool.query(
      'UPDATE assignments SET title=$1, studentname=$2, content=$3 WHERE id=$4 RETURNING *',
      [title, studentname, content, id]
    );
     if (result.rows.length === 0) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /assignments/{id}:
 *   delete:
 *     summary: Delete an assignment
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *        description: Assignment deleted
 *       404:
 *         description: Assignment not found
 */
app.delete('/assignments/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM assignments WHERE id=$1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== 6️⃣ Start Server =====
app.listen(3000, () => {
  console.log('Server running on port 3000');
});