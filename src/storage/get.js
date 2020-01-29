const middy = require("middy");
const { cors } = require("middy/middlewares");
const { getCustomerHistory } = require("./documentService");

const handleGet = async event => {
  try {
    const { id } = event.pathParameters;
    const history = await getCustomerHistory(id);
    return {
      statusCode: 200,
      body: JSON.stringify(history)
    };
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: e.message })
    };
  }
};

const handler = middy(handleGet).use(cors());

module.exports = {
  handler
};
