import dns from "node:dns";
dns.setServers(["1.1.1.1"]);

import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";



const app = express();


app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);


app.get("/", (req, res) => {
  res.json({
    message: "Resume ATS Analyzer API is running"
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:");
    console.error(error);
  });