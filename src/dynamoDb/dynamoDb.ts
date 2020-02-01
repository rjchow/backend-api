import AWS from "aws-sdk";

const options = process.env.IS_OFFLINE
  ? {
      region: "localhost",
      endpoint: "http://localhost:8000",
      accessKeyId: "DEFAULT_ACCESS_KEY",
      secretAccessKey: "DEFAULT_SECRET"
    }
  : {};

const dynamoClient = new AWS.DynamoDB.DocumentClient(options);

export const put = (params: AWS.DynamoDB.DocumentClient.PutItemInput) =>
  dynamoClient.put(params).promise();
export const query = (
  params: AWS.DynamoDB.DocumentClient.QueryInput
): Promise<any> => dynamoClient.query(params).promise();
export const get = (params: AWS.DynamoDB.DocumentClient.GetItemInput) =>
  dynamoClient.get(params).promise();
