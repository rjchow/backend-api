const uuid = require("uuid/v4");
const {
  createTransaction,
  getCustomerHistory
} = require("../../src/storage/documentService");
const { config, setConfig } = require("../../config");

describe("createTransaction", () => {
  test("should store a transaction correctly", async () => {
    const fakeId = uuid();
    const quantity = 5;
    const receipt = await createTransaction(fakeId, quantity);
    expect(receipt).toMatchObject([
      { quantity, transactionTime: expect.any(Number) }
    ]);
  });
  test("should fail if quantity is larger than whole quota", async () => {
    expect.assertions(1);
    const fakeId = uuid();
    const quantity = 9999999;
    try {
      await createTransaction(fakeId, quantity);
    } catch (e) {
      expect(e.message).toEqual(
        `Quantity requested will exceed customer quota of ${config.appParameters.quotaPerPeriod}`
      );
    }
  });
  test("should fail if quantity requested causes quota to exceed", async () => {
    expect.assertions(1);
    const fakeId = uuid();
    await createTransaction(fakeId, 1);
    try {
      await createTransaction(fakeId, config.appParameters.quotaPerPeriod);
    } catch (e) {
      expect(e.message).toEqual(
        `Quantity requested will exceed customer quota of ${config.appParameters.quotaPerPeriod}`
      );
    }
  });
});

const delay = t => new Promise(resolve => setTimeout(resolve, t));

describe("getCustomerHistory", () => {
  test("should return empty array if customer has never been seen before", async () => {
    expect(await getCustomerHistory(uuid())).toMatchObject([]);
  });

  test("should work with one transaction history", async () => {
    const fakeId = uuid();
    const quantity = 5;
    await createTransaction(fakeId, quantity);
    const record = await getCustomerHistory(fakeId);
    expect(record).toMatchObject([
      { quantity, transactionTime: expect.any(Number) }
    ]);
  });
  test("should work with multiple transaction history", async () => {
    const fakeId = uuid();
    const quantity = 1;
    await createTransaction(fakeId, quantity);
    await createTransaction(fakeId, quantity);
    await createTransaction(fakeId, quantity);
    const record = await getCustomerHistory(fakeId);
    expect(record).toMatchObject([
      { quantity, transactionTime: expect.any(Number) },
      { quantity, transactionTime: expect.any(Number) },
      { quantity, transactionTime: expect.any(Number) }
    ]);
  });
  test("should only return records that haven't expired", async () => {
    const fakeId = uuid();
    setConfig.setRecordLifetime(100);
    await createTransaction(fakeId, 1);
    await delay(100);
    await createTransaction(fakeId, 1);
    const records = await getCustomerHistory(fakeId);
    expect(records).toMatchObject([
      { quantity: 1, transactionTime: expect.any(Number) }
    ]);
    expect(records[0].transactionTime).toBeGreaterThan(Date.now() - 100);
  });
});
