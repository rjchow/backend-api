import { authenticatedRequestHandler } from "../common/requestHandler";

const handleGet = async () => ({
  statusCode: 200,
  body: JSON.stringify({ message: "OK" })
});

export const handler = authenticatedRequestHandler(handleGet);
