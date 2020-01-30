const createError = require("http-errors");
const middy = require("middy");
const { cors } = require("middy/middlewares");
const httpErrorHandler = require("@middy/http-error-handler");
const { getAuthorisation, putAuthorisation } = require("./authService");

const handlePost = async event => {
  const { authToken, role, userReference } = JSON.parse(event.body);
  // try {
  if (await getAuthorisation(authToken)) {
    throw createError(400, "Authorization Token already exists");
  }
  await putAuthorisation(authToken, role, userReference);
  return {
    statusCode: 200,
    body: JSON.stringify({ authToken, role, userReference })
  };
};

const handler = middy(handlePost)
  .use(cors())
  .use(httpErrorHandler());

module.exports = {
  handler
};
