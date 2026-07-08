const express = require("express");
const router = express.Router();

const printRouter = require("../utils/routeLogger");

const companyRoutes = require("./company.routes");
const userRoutes = require("./user.routes");
const converterRoutes = require("./converter.routes");

router.use("/companies", companyRoutes);
router.use("/users", userRoutes);
router.use("/converter", converterRoutes);

console.log("\n📌 Registered API Routes");
printRouter("/api/v1/companies", companyRoutes);
printRouter("/api/v1/users", userRoutes);
printRouter("/api/v1/converter", converterRoutes);
console.log();

module.exports = router;