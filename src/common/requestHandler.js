const middy = require("middy");
const { cors } = require("middy/middlewares");
const httpErrorHandler = require("@middy/http-error-handler");
const { onlyAuthorisedOperator } = require("../auth/authMiddleware");

const authenticatedRequestHandler = handler =>
  middy(handler)
    .use(cors())
    .use(onlyAuthorisedOperator())
    .use(httpErrorHandler());

module.exports = { authenticatedRequestHandler };
