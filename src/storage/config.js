const config = () =>
  process.env.IS_OFFLINE
    ? {
        dynamodb: {
          accessKeyId: "localAccessKeyID",
          secretAccessKey: "localAccessKey",
          region: "us-west-2",
          storageTableName: "musket-storage-stg"
        }
      }
    : {
        dynamodb: {
          accessKeyId: process.env.SES_KEY_ID,
          secretAccessKey: process.env.SES_SECRET,
          region: process.env.SES_REGION || "us-west-2",
          storageTableName: process.env.MUSKET_STORAGE_TABLE
        }
      };

module.exports = config();
