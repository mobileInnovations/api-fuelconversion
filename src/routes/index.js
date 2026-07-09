const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/basicAuth.middleware");
const printRouter = require("../utils/routeLogger");

const authRoutes = require("./auth.routes");
const companyRoutes = require("./company.routes");
const userRoutes = require("./user.routes");
const converterRoutes = require("./converter.routes");

router.use("/auth", authRoutes);
router.use(authMiddleware); // Apply authentication middleware to all routes
router.use("/companies", companyRoutes);
router.use("/converter", converterRoutes);
router.use("/users", userRoutes);

console.log("\n📌 Registered API Routes");
printRouter("/api/v1/auth", authRoutes);
printRouter("/api/v1/companies", companyRoutes);
printRouter("/api/v1/users", userRoutes);
printRouter("/api/v1/converter", converterRoutes);
console.log();

module.exports = router;
