const { authenticatedRequestHandler } = require("../common/requestHandler");

const handleGet = async () => ({
  statusCode: 200,
  body: JSON.stringify({ message: "OK" })
});

const handler = authenticatedRequestHandler(handleGet);

module.exports = {
  handler
};
