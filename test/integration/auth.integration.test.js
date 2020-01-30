const uuid = require("uuid/v4");
const {
  getAuthorisation,
  putAuthorisation
} = require("../../src/auth/authService");

const { onlyAuthorisedOperator } = require("../../src/auth/authMiddleware");

describe("putAuthorisation", () => {
  test("should put a user object", async () => {
    const fakeToken = uuid();
    const userObject = {
      operatorToken: fakeToken,
      role: "OPERATOR",
      userReference: "S1234567B"
    };
    const receipt = await putAuthorisation(
      userObject.operatorToken,
      userObject.role,
      userObject.userReference
    );
    expect(receipt).toMatchObject(userObject);

    expect(await getAuthorisation(fakeToken)).toMatchObject(userObject);
  });

  test("should fail when retrieving non-existent user", async () => {
    const fakeToken = uuid();
    expect(await getAuthorisation(fakeToken)).toEqual(undefined);
  });
});

describe("authMiddleware", () => {
  test("should work correctly if authorization token isn't provided", async () => {
    const mockHandler = {
      event: {
        headers: {
          Authorization: ""
        }
      }
    };
    try {
      await onlyAuthorisedOperator().before(mockHandler);
    } catch (e) {
      expect(e.message).toEqual("Unauthorized");
    }
    mockHandler.event.headers = {};
    try {
      await onlyAuthorisedOperator().before(mockHandler);
    } catch (e) {
      expect(e.message).toEqual("Unauthorized");
    }
  });
  test("should inject context when user exists", async () => {
    const fakeToken = uuid();
    const userObject = {
      operatorToken: fakeToken,
      role: "OPERATOR",
      userReference: "S1234567B"
    };
    await putAuthorisation(
      userObject.operatorToken,
      userObject.role,
      userObject.userReference
    );

    const mockHandler = {
      event: {
        headers: {
          Authorization: fakeToken
        }
      }
    };
    const mockCallback = jest.fn();
    await onlyAuthorisedOperator().before(mockHandler, mockCallback);

    expect(mockHandler.event.auth).toMatchObject({
      operatorToken: fakeToken,
      role: userObject.role,
      userReference: userObject.userReference
    });

    expect(mockCallback.mock.calls.length).toEqual(1);
  });
  test("should return error response when user doesn't exist", async () => {
    expect.assertions(1);
    const fakeToken = uuid();
    const mockCallback = jest.fn();
    const mockHandler = {
      event: {
        headers: {
          Authorization: fakeToken
        }
      },
      callback: mockCallback
    };
    try {
      await onlyAuthorisedOperator().before(mockHandler, mockCallback);
    } catch (e) {
      expect(e.message).toEqual("Unauthorized");
    }
  });
});
