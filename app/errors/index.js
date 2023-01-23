const CustomApiError = require("./custom-api-error");
const BadRequestError = require("./bad-request");
const NotFoundError = require("./not-found");
const Unauthorized = require("./unauthorized");
const UnauthenticatedError = require("./unauthenticated");

module.exports = {
    CustomApiError,
    BadRequestError,
    NotFoundError,
    Unauthorized,
    UnauthenticatedError,
};