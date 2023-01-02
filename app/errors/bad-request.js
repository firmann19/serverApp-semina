// import http-status-codes
const { StatucCodes } = require("http-status-codes");
// import custom-api
const CustomAPIError = require("./custom-api-error");

class BadRequest extends CustomAPIError {
  constructor(message) {
    super(message);
    // memberikan statusCode bad request
    this.statusCode = StatucCodes.BAD_REQUEST;
  }
}
module.exports = BadRequest;
