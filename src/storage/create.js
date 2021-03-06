const { createTransaction } = require("./documentService");

const { authenticatedRequestHandler } = require("../common/requestHandler");

const handleCreate = async event => {
  try {
    const { id } = event.pathParameters;
    const { quantity } = JSON.parse(event.body);
    const user = event.auth;
    const receipt = await createTransaction(id, quantity, user.userReference);
    return {
      statusCode: 200,
      body: JSON.stringify(receipt)
    };
  } catch (e) {
    // this error message shows up when the uuid already exists in dynamodb and we try to write to it
    if (e.message === "The conditional request failed") {
      return {
        statusCode: 400,
        body: "Unauthorised"
      };
    }
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: e.message
      })
    };
  }
};

const handler = authenticatedRequestHandler(handleCreate);

module.exports = {
  handler
};
