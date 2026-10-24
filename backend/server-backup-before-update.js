const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, "campus-data.json");

app.use(cors());
app.use(express.json());

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    }
  } catch (error) {
    console.error("Could not read data:", error.message);
  }

  return {
    complaints: [],
    lostItems: [],
    events: [],
    notices: []
  };
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CampusOS Backend API is running!",
    version: "1.0.0"
  });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "healthy", project: "CampusOS" });
});

const resources = [
  { route: "complaints", key: "complaints" },
  { route: "lost-items", key: "lostItems" },
  { route: "events", key: "events" },
  { route: "notices", key: "notices" }
];

for (const resource of resources) {
  app.get(`/api/${resource.route}`, (req, res) => {
    const data = readData();
    res.json({ success: true, data: data[resource.key] });
  });

  app.post(`/api/${resource.route}`, (req, res) => {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Send a valid JSON object."
      });
    }

    const data = readData();
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...req.body,
      createdAt: new Date().toISOString()
    };

    data[resource.key].push(item);

    try {
      saveData(data);
      res.status(201).json({
        success: true,
        message: "Record saved successfully.",
        data: item
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Could not save record."
      });
    }
  });

  app.delete(`/api/${resource.route}/:id`, (req, res) => {
    const data = readData();
    const records = data[resource.key];
    const updated = records.filter(item => String(item.id) !== req.params.id);

    if (updated.length === records.length) {
      return res.status(404).json({
        success: false,
        message: "Record not found."
      });
    }

    data[resource.key] = updated;

    try {
      saveData(data);
      res.json({ success: true, message: "Record deleted." });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Could not delete record."
      });
    }
  });
}

app.listen(PORT, () => {
  console.log(`CampusOS server running at http://localhost:${PORT}`);
});
