/**
 * Custom error response class that extends the built-in Error class
 * Used to create consistent error responses across the API
 */
class ErrorResponse extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;
