const DEFAULT_RECORD_LIFETIME_IN_MICROSECONDS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_SALT = "salt";
const DEFAULT_QUOTA_PER_PERIOD = 5;

let configRecordLifetimeInMicroseconds = DEFAULT_RECORD_LIFETIME_IN_MICROSECONDS;
const getRecordLifetime = () => configRecordLifetimeInMicroseconds;

const setRecordLifetime = durationInMicroseconds => {
  configRecordLifetimeInMicroseconds = durationInMicroseconds;
};

const getDynamodbConfig = () =>
  process.env.IS_OFFLINE
    ? {
        storageTableName: "musket-storage-stg"
      }
    : {
        storageTableName: process.env.MUSKET_STORAGE_TABLE
      };

const config = () => ({
  dynamodb: getDynamodbConfig,
  appParameters: {
    recordLifetime: getRecordLifetime,
    salt: process.env.SALT || DEFAULT_SALT,
    quotaPerPeriod: process.env.QUOTA_PER_PERIOD || DEFAULT_QUOTA_PER_PERIOD
  }
});

module.exports = { config: config(), setConfig: { setRecordLifetime } };
