import middy from "middy";
import { cors } from "middy/middlewares";
import httpErrorHandler from "@middy/http-error-handler";
import { onlyAuthorisedOperator } from "../auth/authMiddleware";

export const authenticatedRequestHandler = (handler: any) =>
  middy(handler)
    .use(cors())
    .use(onlyAuthorisedOperator())
    .use(httpErrorHandler());
