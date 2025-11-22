/* START OF FILE server.js */

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const authRoutes = require("./routes/authRoutes");
const recordRoutes = require("./routes/recordRoutes");
const fileRoutes = require("./routes/fileRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const consultationRoutes = require("./routes/consultationRoutes");
const patientRoutes = require("./routes/patientRoutes"); 

dotenv.config();
const app = express();

// ✅ Configure CORS to allow frontend domains
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000", 
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:8080",
      "http://127.0.0.1:8080",
      "https://medicore-frontend-app.vercel.app",  // Your Vercel domain 1
      "https://medi-core-eight.vercel.app",        // Your Vercel domain 2
      "https://medicore-frontend.vercel.app",      // Fallback domain
      process.env.FRONTEND_URL                     // Environment variable for flexibility
    ].filter(Boolean), // Remove undefined values
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
  })
);

// ✅ Middleware
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URL, { // Make sure this matches your Render environment variable name
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Health check endpoint for Render
app.get("/api/auth/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "MediCore Backend is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/patients", patientRoutes); // ✅ NEW: Add patient routes to the app

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
/* END OF FILE server.js */
