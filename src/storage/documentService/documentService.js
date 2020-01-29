const { createHash } = require("crypto");
const config = require("../config");
const { put, query } = require("../dynamoDb");

const SALT = "salt";
const QUOTA_PER_PERIOD = 5;

const identifierStringToSaltedHash = identifier =>
  createHash("sha256")
    .update(`${identifier} + ${SALT}`)
    .digest("hex");

const putTransaction = async (customerId, quantity) => {
  const transactionTime = Date.now(); // unix time in microseconds
  const transactedBy = "system"; // TODO: change this to user id
  const params = {
    TableName: config.dynamodb.storageTableName,
    Item: {
      customerId: identifierStringToSaltedHash(customerId),
      quantity,
      transactionTime,
      transactedBy
    }
  };
  return put(params).then(() => params.Item);
};

const getCustomerHistory = async customerId => {
  const params = {
    TableName: config.dynamodb.storageTableName,
    KeyConditionExpression: "customerId = :givenId",
    ExpressionAttributeValues: {
      ":givenId": identifierStringToSaltedHash(customerId)
      // TODO: set range expression for history to look back
    }
  };
  const documents = await query(params);
  return documents.Items.map(transactionRecord => ({
    quantity: transactionRecord.quantity,
    transactionTime: transactionRecord.transactionTime
  }));
};

const computeQuotaSpent = async transactionRecords =>
  transactionRecords.reduce(
    (accumulator, record) => accumulator + record.quantity,
    0
  );

const validateQuantity = quantity => Number.isInteger(quantity) && quantity > 0;

const validateIdentifier = identifier => identifier.length > 0; // TODO: add validation rules

const createTransaction = async (customerId, quantity) => {
  if (!validateIdentifier(customerId)) {
    throw new Error("Invalid customer ID");
  }
  if (!validateQuantity(quantity)) {
    throw new Error(`${quantity} is not a positive integer`);
  }
  const transactionRecords = await getCustomerHistory(customerId);
  const quotaSpent = await computeQuotaSpent(transactionRecords);
  if (quotaSpent + quantity > QUOTA_PER_PERIOD) {
    throw new Error(
      `Error: quantity requested will exceed customer quota of ${QUOTA_PER_PERIOD}`
    );
  }
  const receipt = await putTransaction(customerId, quantity);
  return transactionRecords.concat([
    { quantity: receipt.quantity, transactionTime: receipt.transactionTime }
  ]);
};

module.exports = {
  getCustomerHistory,
  createTransaction,
  computeQuotaSpent,
  QUOTA_PER_PERIOD
};
