import uuid from "uuid/v4";
import { getAuthorisation, putAuthorisation } from "../../src/auth/authService";

import { onlyAuthorisedOperator } from "../../src/auth/authMiddleware";

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
    await expect(onlyAuthorisedOperator().before(mockHandler)).rejects.toThrow(
      /Unauthorized/
    );
    mockHandler.event.headers = {};
    await expect(onlyAuthorisedOperator().before(mockHandler)).rejects.toThrow(
      /Unauthorized/
    );
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
    await expect(
      onlyAuthorisedOperator().before(mockHandler, mockCallback)
    ).rejects.toThrow(/Unauthorized/);
  });
});
