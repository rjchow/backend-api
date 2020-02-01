import uuid from "uuid/v4";
import {
  createTransaction,
  getCustomerHistory
} from "../../src/storage/documentService";
import { config, setConfig } from "../../config";

describe("createTransaction", () => {
  test("should store a transaction correctly", async () => {
    const fakeId = uuid();
    const quantity = 1;
    const receipt = await createTransaction(fakeId, quantity);
    expect(receipt).toMatchObject([
      { quantity, transactionTime: expect.any(Number) }
    ]);
  });
  test("should fail if quantity is larger than whole quota", async () => {
    expect.assertions(1);
    const fakeId = uuid();
    const quantity = 9999999;
    await expect(createTransaction(fakeId, quantity)).rejects.toThrow(
      `Quantity requested will exceed customer quota of ${config.appParameters.quotaPerPeriod()}`
    );
  });
  test("should fail if quantity requested causes quota to exceed", async () => {
    expect.assertions(1);
    const fakeId = uuid();
    await createTransaction(fakeId, 1);
    await expect(
      createTransaction(fakeId, config.appParameters.quotaPerPeriod())
    ).rejects.toThrow(
      `Quantity requested will exceed customer quota of ${config.appParameters.quotaPerPeriod()}`
    );
  });
});

const delay = t => new Promise(resolve => setTimeout(resolve, t));

describe("getCustomerHistory", () => {
  test("should return empty array if customer has never been seen before", async () => {
    expect(await getCustomerHistory(uuid())).toMatchObject([]);
  });

  test("should work with one transaction history", async () => {
    const fakeId = uuid();
    const quantity = 1;
    await createTransaction(fakeId, quantity);
    const record = await getCustomerHistory(fakeId);
    expect(record).toMatchObject([
      { quantity, transactionTime: expect.any(Number) }
    ]);
  });
  test("should work with multiple transaction history", async () => {
    const prevQuota = config.appParameters.quotaPerPeriod();
    setConfig.setQuotaPerPeriod(5);

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
    setConfig.setQuotaPerPeriod(prevQuota);
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
