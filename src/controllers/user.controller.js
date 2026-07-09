const userService = require("../services/user.service.js");

exports.createUser = async (req, res) => {
  try {
    const { username, password, company_code } = req.body;

    // basic validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "username, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        success: false,
        message: "Username can only contain letters, numbers, and underscores",
      });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Username must be between 3 and 30 characters long",
      });
    }

    if (await userService.isUsernameTaken(username)) {
      return res.status(409).json({
        success: false,
        message: `Username: ${username} is already taken`,
      });
    }

    const userId = await userService.createUser({
      username,
      password,
      company_code,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { userId },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message:
        "Internal server error, Please check the server logs for more details",
      error: error.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await userService.getUserById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    await userService.updatePassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    if (error.code === "CURRENT_PASSWORD_INVALID") {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    if (error.code === "PASSWORD_SAME") {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    if (error.code === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const targetUserId = Number(id);
    const currentUserId = Number(req.user.id);

    if (Number.isNaN(targetUserId) || Number.isNaN(currentUserId)) {
      throw new Error("INVALID_USER_ID");
    }

    if (targetUserId === currentUserId) {
      const error = new Error("Cannot delete yourself");
      error.code = "CANNOT_DELETE_SELF";
      throw error;
    }

    await userService.deleteUserById(id);
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    if (error.code === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (error.code === "CANNOT_DELETE_SELF") {
      return res.status(400).json({
        success: false,
        message: "Users cannot delete themselves",
      });
    }
    if (error.code === "SUPERADMIN_DELETE_DENIED") {
      return res.status(403).json({
        success: false,
        message: "Superadmin accounts cannot be deleted",
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({
      success: true,
      data: { count: users.length, users },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await userService.getUserByUsername(username);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.isUsernameTaken = async (req, res) => {
  try {
    const { username } = req.params;
    const isTaken = await userService.isUsernameTaken(username);
    res.status(200).json({
      success: true,
      data: { isTaken },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "No data provided to update",
      });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        success: false,
        message: "Username can only contain letters, numbers, and underscores",
      });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Username must be between 3 and 30 characters long",
      });
    }

    await userService.changeUsername(userId, username);

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
    });
  } catch (error) {
    if (error.code === "USERNAME_SAME") {
      return res.status(400).json({
        success: false,
        message: "New username must be different from current username",
      });
    }

    if (error.code === "USERNAME_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
