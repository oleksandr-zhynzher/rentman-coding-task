const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());

app.get("/api/data", (req, res) => {
  const dataPath = path.join(__dirname, "response.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  res.json(data);
});

app.listen(PORT);
