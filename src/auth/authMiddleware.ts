import createError from "http-errors";
import { getAuthorisation } from "./authService";

export const onlyAuthorisedOperator: middy.Middleware<any, any, any> = () => ({
  before: async handler => {
    const { Authorization: authToken } = handler.event.headers;

    const userObject = authToken // TODO: validate that this is a uuid
      ? await getAuthorisation(authToken)
      : undefined;

    if (userObject && userObject.role === "OPERATOR") {
      // user is authorised
      // eslint disable because we actually need to modify the context
      // eslint-disable-next-line no-param-reassign
      handler.event.auth = userObject;
      return;
    }
    throw new createError.Unauthorized();
  }
});
