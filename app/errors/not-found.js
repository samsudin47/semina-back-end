const { StatusCodes } = require("http-status-codes");
const CustomApiError = require("./custom-api-error");

class NotFound extends CustomApiError {
    constructor(message) {
        super(message);
        // memberikan statusCode not found
        this.statusCode = StatusCodes.NOT_FOUND;
    }
}

module.exports = NotFound;