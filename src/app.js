const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Root
app.get("/", (req, res) => res.redirect(`/api/v1`));

app.get("/api/v1", (req, res) => {
  res.json({
    success: true,
    message: "Fuel Conversion API v1",
    version: "1.0.0",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Register routes
const routes = require("./routes");
app.use(`/api/v1`, routes);

const errorHandler = require("./middlewares/error.middleware");
app.use(errorHandler);

module.exports = app;
