console.log("Welcome!");

// ===== 1️⃣ Imports =====
const express = require("express");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { createClient } = require("@supabase/supabase-js");

// ===== 2️⃣ App Setup =====
const app = express();
app.use(cors());
app.use(express.json());

// ===== 3️⃣ Supabase Client =====
const supabase = createClient(
  "https://fpeqyunwduhmzydbbxof.supabase.co", //  Supabase URL
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZXF5dW53ZHVobXp5ZGJieG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NjYzMTEsImV4cCI6MjA4NzU0MjMxMX0.CsNQ2wv2ZIqc73RxCtBZtp7FuwXzpyRnKR2NiCA4iZo"                         // Your Supabase anon key
);

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
 *         description: Returns list of assignments
 */
app.get("/assignments", async (req, res) => {
  const { data, error } = await supabase.from("assignments").select("*");
  if (error) return res.status(500).json({ error });
  res.json(data);
});

/**
 * @swagger
 * /assignments:
 *   post:
 *     summary: Create a new assignment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentName
 *               - title
 *               - content
 *             properties:
 *               studentName:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Assignment created successfully
 *       400:
 *         description: Missing required fields
 */
app.post("/assignments", async (req, res) => {
  const { studentName, title, content } = req.body;

  if (!studentName || !title || !content) {
    return res.status(400).json({ message: "All fields required" });
  }

  const { data, error } = await supabase
    .from("assignments")
    .insert([{ studentName, title, content }])
    .select();

  if (error) return res.status(500).json({ error });

  res.status(201).json(data);
});

/**
 * @swagger
 * /assignments/{id}:
 *   get:
 *     summary: Get one assignment by ID
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

  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error) return res.status(404).json({ error });
  res.json(data);
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
 *               studentName:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Assignment updated
 *       404:
 *         description: Assignment not found
 */
app.put("/assignments/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID must be a number" });

  const { data, error } = await supabase
    .from("assignments")
    .update(req.body)
    .eq("id", id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  if (!data.length) return res.status(404).json({ message: "Assignment not found" });

  res.json({ message: "Assignment updated successfully", updated: data[0] });
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
 *         description: Assignment deleted
 *       404:
 *         description: Assignment not found
 */
app.delete("/assignments/:id", async (req, res) => {
  const id = Number(req.params.id);
if (isNaN(id)) return res.status(400).json({ message: "ID must be a number" });

  const { data: existing, error: checkError } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", id);

  if (!existing.length) return res.status(404).json({ message: "Assignment not found" });

  const { error } = await supabase.from("assignments").delete().eq("id", id);
  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Deleted successfully" });
});

// ===== 6️⃣ Start Server =====
const PORT = 3000;
app.listen(PORT, () => console.log(`🔥 Server running on http://localhost:${PORT}`));