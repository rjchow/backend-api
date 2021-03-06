const DEFAULT_RECORD_LIFETIME_IN_MICROSECONDS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_SALT = "salt";
const DEFAULT_QUOTA_PER_PERIOD = process.env.QUOTA_PER_PERIOD || 1;

let configRecordLifetimeInMicroseconds = DEFAULT_RECORD_LIFETIME_IN_MICROSECONDS;
const getRecordLifetime = () => configRecordLifetimeInMicroseconds;

const setRecordLifetime = durationInMicroseconds => {
  configRecordLifetimeInMicroseconds = durationInMicroseconds;
};

let configQuotaPerPeriod = DEFAULT_QUOTA_PER_PERIOD;
const getQuotaPerPeriod = () => configQuotaPerPeriod;

const setQuotaPerPeriod = quotaUnits => {
  configQuotaPerPeriod = quotaUnits;
};

const getDynamodbConfig = () =>
  process.env.IS_OFFLINE
    ? {
        storageTableName: "musket-storage-stg",
        authTableName: "musket-auth-stg"
      }
    : {
        storageTableName: process.env.MUSKET_STORAGE_TABLE,
        authTableName: process.env.MUSKET_AUTH_TABLE
      };

const config = () => ({
  dynamodb: getDynamodbConfig,
  appParameters: {
    recordLifetime: getRecordLifetime,
    salt: process.env.SALT || DEFAULT_SALT,
    quotaPerPeriod: getQuotaPerPeriod
  }
});

module.exports = {
  config: config(),
  setConfig: { setRecordLifetime, setQuotaPerPeriod }
};
