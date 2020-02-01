import { get, put } from "../dynamoDb";
import { config } from "../../config";

export type AuthToken = string;
export type Role = string;

export type UserObject = {
  authToken: AuthToken;
  role: Role;
  userReference: string;
};

export const getAuthorisation = async (authToken: AuthToken) => {
  const params = {
    TableName: config.dynamodb().authTableName,
    Key: {
      operatorToken: authToken
    }
  };

  const result = await get(params);
  return result.Item;
};

export const putAuthorisation = async (
  authToken: AuthToken,
  role: Role,
  userReference: string
) => {
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
