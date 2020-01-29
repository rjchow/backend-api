const uuid = require("uuid/v4");
const {
  createTransaction,
  getCustomerHistory,
  QUOTA_PER_PERIOD
} = require("../../src/storage/documentService");

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
        `Error: quantity requested will exceed customer quota of ${QUOTA_PER_PERIOD}`
      );
    }
  });
  test("should fail if quantity requested causes quota to exceed", async () => {
    expect.assertions(1);
    const fakeId = uuid();
    await createTransaction(fakeId, 1);
    try {
      await createTransaction(fakeId, QUOTA_PER_PERIOD);
    } catch (e) {
      expect(e.message).toEqual(
        `Error: quantity requested will exceed customer quota of ${QUOTA_PER_PERIOD}`
      );
    }
  });
});

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
});
