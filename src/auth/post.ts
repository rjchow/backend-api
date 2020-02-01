import createError from "http-errors";
import { APIGatewayEvent } from "aws-lambda";
import middy from "middy";
import { cors } from "middy/middlewares";
import httpErrorHandler from "@middy/http-error-handler";
import { getAuthorisation, putAuthorisation } from "./authService";

const handlePost = async (event: APIGatewayEvent) => {
  const { authToken, role, userReference } = JSON.parse(event.body ?? "");
  if (await getAuthorisation(authToken)) {
    throw createError(400, "Authorization Token already exists");
  }
  await putAuthorisation(authToken, role, userReference);
  return {
    statusCode: 200,
    body: JSON.stringify({ authToken, role, userReference })
  };
};

export const handler = middy(handlePost)
  .use(cors())
  .use(httpErrorHandler());
