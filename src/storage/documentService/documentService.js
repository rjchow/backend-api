const { createHash } = require("crypto");
const { config } = require("../../../config");
const { put, query } = require("../dynamoDb");

const identifierStringToSaltedHash = identifier =>
  createHash("sha256")
    .update(`${identifier} + ${config.appParameters.salt}`)
    .digest("hex");

const putTransaction = async (customerId, quantity) => {
  const transactionTime = Date.now(); // unix time in microseconds
  const transactedBy = "system"; // TODO: change this to user id
  const params = {
    TableName: config.dynamodb().storageTableName,
    Item: {
      customerId: identifierStringToSaltedHash(customerId),
      quantity,
      transactionTime,
      transactedBy
    }
  };
  return put(params).then(() => params.Item);
};

const computeTimestampSinceOffset = recordLifetimeInMicroseconds =>
  Date.now() - recordLifetimeInMicroseconds;

const getCustomerHistory = async (
  customerId,
  recordLifetime = config.appParameters.recordLifetime()
) => {
  const recordsSince = computeTimestampSinceOffset(recordLifetime);
  const params = {
    TableName: config.dynamodb().storageTableName,
    KeyConditionExpression:
      "customerId = :givenId and transactionTime > :recordsSince",
    ExpressionAttributeValues: {
      ":givenId": identifierStringToSaltedHash(customerId),
      ":recordsSince": recordsSince
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

const computeRemainingQuota = quotaSpent =>
  config.appParameters.quotaPerPeriod - quotaSpent;

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
  if (computeRemainingQuota(quotaSpent) < quantity) {
    throw new Error(
      `Quantity requested will exceed customer quota of ${config.appParameters.quotaPerPeriod}`
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
  computeRemainingQuota
};
