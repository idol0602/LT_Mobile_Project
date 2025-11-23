require("dotenv").config();
const express = require("express");
const cors = require("cors");
const router = require("./routes/index");
const PORT = process.env.PORT || 3000;

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(cors());
app.use(express.json()); // Add JSON parsing
app.use(express.urlencoded({ extended: true }));

// Add routes
router(app);

// Global error handler
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.message);
  console.error("[STACK]", err.stack);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`[404] ${req.method} ${req.path} not found`);
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 Utils Server started successfully!`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health\n`);
});
