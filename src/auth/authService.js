const { get, put } = require("../dynamoDb");
const { config } = require("../../config");

const getAuthorisation = async authToken => {
  const params = {
    TableName: config.dynamodb().authTableName,
    Key: {
      operatorToken: authToken
    }
  };

  const result = await get(params);
  return result.Item;
};

const putAuthorisation = async (authToken, role, userReference) => {
  const params = {
    TableName: config.dynamodb().authTableName,
    Item: {
      operatorToken: authToken,
      role,
      userReference // put identity here
    }
  };
  await put(params);
  return params.Item;
};

module.exports = { getAuthorisation, putAuthorisation };
