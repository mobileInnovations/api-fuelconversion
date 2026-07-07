const express = require("express");
const multer = require("multer");
const controller = require("../controllers/converter.controller");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

router.post(
  "/",
  upload.fields([
    { name: "master", maxCount: 1 },
    { name: "fleet", maxCount: 1 },
  ]),
  controller.convert,
);

module.exports = router;
