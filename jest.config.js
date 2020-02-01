module.exports = {
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      diagnostics: {
        warnOnly: true
      }
    }
  }
};
