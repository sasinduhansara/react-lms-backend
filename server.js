import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import userRouter from "./routes/userRoutes.js";
import departmentRouter from "./routes/departmentRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import newsRouter from "./routes/newsRoutes.js";
import materialsRouter from "./routes/materialsRoutes.js";
import lessonRouter from "./routes/lessonRoutes.js";
import lessonPartRouter from "./routes/lessonPartRoutes.js";
import lecturerRouter from "./routes/lecturerRoutes.js";
import marksRouter from "./routes/marksRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import settingsRouter from "./routes/settingsRoutes.js";

// import { authenticate } from './middleware/auth.js';
dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const connectionString = process.env.MONGO_URI;

// Check if the connection string is defined
mongoose
  .connect(connectionString)
  .then(() => {
    console.log("MongoDB connected");
  })

  // Handle connection errors
  .catch(() => {
    console.log("MongoDB connection failed");
  });

// Middleware to parse JSON request body

app.use("/api/users", userRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/subjects", subjectRoutes);
app.use("/api/news", newsRouter);
app.use("/api/materials", materialsRouter);
app.use("/api/lessons", lessonRouter);
app.use("/api/lesson-parts", lessonPartRouter);
app.use("/api/lecturers", lecturerRouter);
app.use("/api/marks", marksRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/settings", settingsRouter);

app.listen(5000, (req, res) => {
  console.log("Server is running on port 5000");
});
