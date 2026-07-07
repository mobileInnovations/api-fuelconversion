/**
 * Handles errors that occur during request processing.
 *
 * @param {Error} err - The error object that was thrown.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack.
 * @return {void}
 */
function errorHandler(err, req, res) {
  console.error("Error:", err); // Log the error details for debugging purposes

  if (typeof err === "string") {
    // Custom application error
    return res.status(400).json({message: err});
  }

  if (err.name === "UnauthorizedError") {
    // JWT authentication error
    return res.status(401).json({message: "Invalid Token"});
  }

  if (err.name === "ValidationError") {
    // Handle validation errors
    return res.status(422).json({message: err.message, details: err.errors});
  }

  // Default to 500 server error for other cases
  return res
    .status(500)
    .json({message: "Internal Server Error", details: err.message});
}

module.exports = errorHandler;
