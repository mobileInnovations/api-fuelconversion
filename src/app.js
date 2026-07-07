const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Register routes

const routes = require("./routes");
app.use(`/api/v1`, routes);

const errorHandler = require("./middlewares/error.middleware");
app.use(errorHandler);

module.exports = app;
