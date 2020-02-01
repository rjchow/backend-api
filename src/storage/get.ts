import { APIGatewayEvent } from "aws-lambda";
import createHttpError from "http-errors";
import {
  getCustomerHistory,
  computeQuotaSpent,
  computeRemainingQuota
} from "./documentService";

import { authenticatedRequestHandler } from "../common/requestHandler";

const handleGet = async (event: APIGatewayEvent) => {
  try {
    const { id } = event.pathParameters ?? { id: undefined };
    if (!id) {
      // serverless framework is supposed to ensure id is populated
      throw new createHttpError.InternalServerError();
    }
    const history = await getCustomerHistory(id);
    const quotaSpent = await computeQuotaSpent(history);
    const remainingQuota = computeRemainingQuota(quotaSpent);
    return {
      statusCode: 200,
      body: JSON.stringify({ remainingQuota, history })
    };
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: e.message })
    };
  }
};

export const handler = authenticatedRequestHandler(handleGet);
