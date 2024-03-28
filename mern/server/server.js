import express from "express";
import cors from "cors";
import recordRoutes from "./routes/record.js";
import dotenv from 'dotenv';
// In your main server file
import { connectToServer } from './db/connection.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database connection and then start the server
connectToServer((err) => {
  if (err) {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  } else {
    app.use('/record', recordRoutes); // Use recordRoutes after DB connection is established
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }
});

app.use(cors());
app.use(express.json());
app.use("", recordRoutes);
// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});