import { APIGatewayEvent } from "aws-lambda";
import createHttpError from "http-errors";
import { UserObject } from "src/auth/authService";
import { createTransaction } from "./documentService";
import { authenticatedRequestHandler } from "../common/requestHandler";

interface AuthenticatedAPIGatewayEvent extends APIGatewayEvent {
  auth: UserObject;
}

const handleCreate = async (event: AuthenticatedAPIGatewayEvent) => {
  try {
    const { id } = event.pathParameters ?? { id: undefined };
    const { quantity } = JSON.parse(event.body ?? "");
    if (!quantity) {
      throw new createHttpError.BadRequest("Quantity not provided");
    }
    if (!id) {
      throw new createHttpError.InternalServerError();
    }
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

export const handler = authenticatedRequestHandler(handleCreate);
