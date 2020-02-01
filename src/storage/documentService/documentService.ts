import { createHash } from "crypto";
import { config } from "../../../config";
import { put, query } from "../../dynamoDb";

type CustomerId = string;
type TransactionTimeInMicroseconds = number;
type RecordLifetimeInMicroseconds = number;

interface TransactionRecord {
  customerId: CustomerId;
  quantity: number;
  transactionTime: TransactionTimeInMicroseconds;
  transactedBy: string;
}
const identifierStringToSaltedHash = (identifier: string) =>
  createHash("sha256")
    .update(`${identifier} + ${config.appParameters.salt}`)
    .digest("hex");

const putTransaction = async (
  customerId: CustomerId,
  quantity: number,
  user: string
): Promise<TransactionRecord> => {
  const transactionTime: TransactionTimeInMicroseconds = Date.now(); // unix time in microseconds
  const params = {
    TableName: config.dynamodb().storageTableName,
    Item: {
      customerId: identifierStringToSaltedHash(customerId),
      quantity,
      transactionTime,
      transactedBy: user
    }
  };
  return put(params).then(() => params.Item);
};

const computeTimestampSinceOffset = (
  recordLifetimeInMicroseconds: RecordLifetimeInMicroseconds
) => Date.now() - recordLifetimeInMicroseconds;

export const getCustomerHistory = async (
  customerId: CustomerId,
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
  return documents.Items.map((transactionRecord: TransactionRecord) => ({
    quantity: transactionRecord.quantity,
    transactionTime: transactionRecord.transactionTime
  }));
};

export const computeQuotaSpent = async (
  transactionRecords: TransactionRecord[]
) =>
  transactionRecords.reduce(
    (accumulator, record) => accumulator + record.quantity,
    0
  );

export const computeRemainingQuota = (quotaSpent: number) =>
  config.appParameters.quotaPerPeriod() - quotaSpent;

const validateQuantity = (quantity: number): boolean =>
  Number.isInteger(quantity) && quantity > 0;

const validateIdentifier = (identifier: string): boolean =>
  identifier.length > 0; // TODO: add validation rules

export const createTransaction = async (
  customerId: CustomerId,
  quantity: number,
  user: string
) => {
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
      `Quantity requested will exceed customer quota of ${config.appParameters.quotaPerPeriod()}`
    );
  }
  const receipt = await putTransaction(customerId, quantity, user);
  return transactionRecords.concat([
    { quantity: receipt.quantity, transactionTime: receipt.transactionTime }
  ]);
};
