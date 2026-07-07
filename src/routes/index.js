const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/basicAuth.middleware");

const companyRoutes = require("./company.routes");
const converterRoutes = require("./converter.routes");

const userRoutes = require("./user.routes");

// router.use(authMiddleware)
router.use("/companies", companyRoutes);
router.use("/users", userRoutes);
router.use("/converter", converterRoutes);

module.exports = router;
