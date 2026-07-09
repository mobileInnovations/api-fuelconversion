const companyService = require("../services/company.service.js");

const db = require("../config/mysqlConfig.js");

const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

exports.createUser = async ({ username, password, company_code }) => {
  try {
    if (!username || !password || !company_code) {
      throw new Error("username, password, and company_code are required");
    }

    const checkCompany = await companyService.getCompanyByCode(company_code);

    if (!checkCompany) {
      throw new Error(`Company with code ${company_code} does not exist`);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const now = new Date();

    const sql = `
    INSERT INTO users (
      username,
      company_code,
      password_hash,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?)
  `;

    const result = await db.query(sql, [
      username,
      company_code,
      passwordHash,
      now,
      now,
    ]);

    return {
      id: result.insertId,
      username,
      company_code,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.isUsernameTaken = async (username) => {
  const sql = "SELECT COUNT(*) AS count FROM users WHERE username = ?";
  const rows = await db.query(sql, [username]);
  return rows[0].count > 0;
};

exports.getUserByUsername = async (username) => {
  const sql = "SELECT * FROM users WHERE username = ?";
  const rows = await db.query(sql, [username]);
  return rows[0];
};

exports.getUserById = async (userId) => {
  const sql = "SELECT * FROM users WHERE id = ?";
  const rows = await db.query(sql, [userId]);
  return rows[0];
};

exports.getAllUsers = async () => {
  const sql = "SELECT * FROM users";
  const rows = await db.query(sql);
  return rows;
};

exports.updatePassword = async (userId, currentPassword, newPassword) => {
  // 1. ดึง password เดิม
  const [[user]] = await db.query(
    "SELECT password_hash FROM users WHERE id = ?",
    [userId],
  );

  if (!user) {
    const error = new Error("User not found");
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  // 2. เช็ค current password
  const isCurrentValid = await bcrypt.compare(
    currentPassword,
    user.password_hash,
  );

  if (!isCurrentValid) {
    const error = new Error("Current password invalid");
    error.code = "CURRENT_PASSWORD_INVALID";
    throw error;
  }

  // 3. เช็ค new password ซ้ำกับของเดิม
  const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);

  if (isSamePassword) {
    const error = new Error("Password is the same");
    error.code = "PASSWORD_SAME";
    throw error;
  }

  // 4. hash password ใหม่
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const now = new Date();

  // 5. update`
  const result = await db.query(
    `
    UPDATE users
    SET password_hash = ?, password_changed_at = ?, updated_at = ?
    WHERE id = ?
    `,
    [passwordHash, now, now, userId],
  );

  if (result.affectedRows === 0) {
    throw new Error("Password update failed");
  }
};

exports.deleteUser = async (userId) => {
  const sql = `
    DELETE FROM users
    WHERE id = ?
  `;
  await db.query(sql, [userId]);
};

exports.changeUsername = async (userId, newUsername) => {
  if (!newUsername) return;

  // 1. ดึง username ปัจจุบัน
  const [[user]] = await db.query("SELECT username FROM users WHERE id = ?", [
    userId,
  ]);

  if (!user) {
    throw new Error("User not found");
  }

  // 2. เช็คชื่อเหมือนเดิม
  if (user.username === newUsername) {
    const error = new Error("Username is the same as current");
    error.code = "USERNAME_SAME";
    throw error;
  }

  // 3. เช็ค username ซ้ำกับคนอื่น
  const [existing] = await db.query(
    "SELECT id FROM users WHERE username = ? AND id != ?",
    [newUsername, userId],
  );

  if (existing.length > 0) {
    const error = new Error("Username already exists");
    error.code = "USERNAME_EXISTS";
    throw error;
  }

  // 4. Update
  const now = new Date();
  const result = await db.query(
    `
    UPDATE users
    SET username = ?, updated_at = ?
    WHERE id = ?
    `,
    [newUsername, now, userId],
  );

  if (result.affectedRows === 0) {
    throw new Error("Update failed");
  }
};

exports.deleteUserById = async (userId) => {
  // 1. ดึง user
  const user = await this.getUserById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  // 2. 🚫 ห้ามลบ superadmin
  if (user.role === "superadmin") {
    const error = new Error("Cannot delete superadmin user");
    error.code = "CANNOT_DELETE_SUPERADMIN";
    throw error;
  }

  // 3. delete
  const result = await db.query(
    `
    DELETE FROM users
    WHERE id = ?
    `,
    [userId],
  );

  if (result.affectedRows === 0) {
    const error = new Error("Delete user failed");
    error.code = "DELETE_FAILED";
    throw error;
  }

  return true;
};
