const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/basicAuth.middleware");

// router.use(authMiddleware)
router.use("/companies", require("./company.routes"));
router.use("/users", require("./user.routes"));
router.use("/converter", require("./converter.routes"));

module.exports = router;
