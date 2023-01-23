// import http-status-codes
const { StatusCodes } = require("http-status-codes");
// import custom-api
const CustomApiError = require("./custom-api-error");

class BadRequest extends CustomApiError {
    constructor(message) {
        super(message);
        // memberikan statusCode bad request
        this.StatusCode = StatusCodes.BAD_REQUEST;
    }
}

module.exports = BadRequest;