const { assert } = require("chai");

const { getUserByEmail, urlsForUser } = require("../helpers.js");

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe("#getUserByEmail", function() {
  it("should return a user with valid email", function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user.id, expectedOutput);
  });
});

const urlDatabase = {
  "b6UTxQ": {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  "i3BoGr": {
    longURL: "http://www.google.com",
    userID: "bG84iM"
  }
};

describe("#urlsForUser", function() {
  it("should return an object with shortURL for user", function() {
    const actual = urlsForUser("aJ48lW", urlDatabase);
    const expected = { "b6UTxQ": { longURL: "https://www.tsn.ca", userID: "aJ48lW" } };
    assert.deepEqual(actual, expected);
  });
});