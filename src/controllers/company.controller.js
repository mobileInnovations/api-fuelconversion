const bcrypt = require("bcrypt");
const companyService = require("../services/company.service.js");

// POST
exports.createCompany = async (req, res) => {
  try {
    const { name } = req.body;
    const company = await companyService.createCompany({ name });
    res.status(201).json(company);
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET
exports.getCompanies = async (req, res) => {
  try {
    const companies = await companyService.getCompanies();
    res.status(200).json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await companyService.getCompanyById(id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.status(200).json(company);
  } catch (error) {
    console.error("Error fetching company by ID:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getCompanyByCode = async (req, res) => {
  try {
    const { companyCode } = req.params;
    const company = await companyService.getCompanyByCode(companyCode);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.status(200).json(company);
  } catch (error) {
    console.error("Error fetching company by code:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE
exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    await companyService.deleteCompany(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).json({ message: error.message });
  }
};

// PUT
exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updatedCompany = await companyService.updateCompany(id, { name });
    res.status(200).json(updatedCompany);
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({ message: error.message });
  }
};
