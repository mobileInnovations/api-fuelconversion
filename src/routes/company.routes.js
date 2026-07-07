const express = require("express");

const companyController = require("../controllers/company.controller");

const router = express.Router();

router.post("/", companyController.createCompany);

router.get("/", companyController.getCompanies);
router.get("/:id", companyController.getCompanyById);
router.get("/code/:companyCode", companyController.getCompanyByCode);

router.put("/:id", companyController.updateCompany);

router.delete("/:id", companyController.deleteCompany);

module.exports = router;
