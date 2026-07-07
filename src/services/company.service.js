const db = require("../config/mysqlConfig.js");

// FUNCTION:
function companyIdGenerator(insertId, name) {
  const now = new Date();
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, "");
  const companyId = `CMP-${ymd}-${name.slice(0, 1).toUpperCase()}${String(insertId).padStart(2, "0")}`;
  return companyId;
}

async function checkNameIsSameOldname(id, newName) {
  const company = await exports.getCompanyById(id);

  if (!company) {
    throw new Error("Company not found");
  }

  return company.name === newName;
}

// SERVICE: POST
exports.createCompany = async ({ name }) => {
  try {
    const now = new Date();

    const sql = `
    INSERT INTO companies (
      name,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?)
  `;
    const result = await db.query(sql, [name, now, now]);
    const companyCode = companyIdGenerator(result.insertId, name);

    await db.query("UPDATE companies SET company_code=? WHERE id=?", [
      companyCode,
      result.insertId,
    ]);

    return {
      id: result.insertId,
      companyCode: companyCode,
      name,
      created_at: now,
      updated_at: now,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// SERVICE: GET
exports.getCompanies = async () => {
  try {
    const sql = "SELECT * FROM companies";
    const rows = await db.query(sql);
    return rows;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getCompanyById = async (id) => {
  try {
    const sql = "SELECT * FROM companies WHERE id = ?";
    const rows = await db.query(sql, [id]);
    return rows[0];
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getCompanyByCode = async (companyCode) => {
  console.log("companyCode:", companyCode);
  try {
    const sql = "SELECT * FROM companies WHERE company_code = ?";
    const rows = await db.query(sql, [companyCode]);
    return rows[0];
  } catch (error) {
    throw new Error(error.message);
  }
};

// SERVICE: DELETE
exports.deleteCompany = async (id) => {
  try {
    const sql = "DELETE FROM companies WHERE id = ?";
    await db.query(sql, [id]);
  } catch (error) {
    throw new Error(error.message);
  }
};

// SERVICE: PUT / UPDATE
exports.updateCompany = async (id, { name }) => {
  try {
    const now = new Date();
    const sql = `
      UPDATE companies
      SET name = ?, updated_at = ?
      WHERE id = ?
    `;

    const isSame = await checkNameIsSameOldname(id, name);
    if (isSame) {
      const error = new Error(
        "The new company name must be different from the current name.",
      );

      error.statusCode = 422;
      error.code = "NAME_UNCHANGED";

      throw error;
    }

    const result = await db.query(sql, [name, now, id]);
    if (result.affectedRows === 0) {
      throw new Error("Company not found");
    }
    return { id, name, updated_at: now };
  } catch (error) {
    throw new Error(error.message);
  }
};
