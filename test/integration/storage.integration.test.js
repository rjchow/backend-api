const uuid = require("uuid/v4");
const {
  createTransaction,
  getCustomerHistory
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
    const quantity = 5;
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
