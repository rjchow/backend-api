const {
  getCustomerHistory,
  computeQuotaSpent,
  computeRemainingQuota
} = require("./documentService");
const { authenticatedRequestHandler } = require("../common/requestHandler");

const handleGet = async event => {
  try {
    const { id } = event.pathParameters;
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

const handler = authenticatedRequestHandler(handleGet);

module.exports = {
  handler
};
