const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CampusOS Backend API is running!",
    version: "1.0.0"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    project: "CampusOS"
  });
});

app.listen(PORT, () => {
  console.log(`CampusOS server running at http://localhost:${PORT}`);
});
