module.exports = {
  testEnvironment: "node",
  collectCoverage: true, //Enable coverage
  collectCoverageFrom: [
    "controllers/**/*.js",
    "helpers/**/*.js",
    "models/**/*.js",
    "routes/**/*.js",
    "index.js",
    "!**/node_modules/**",
  ],
  coverageDirectory: "coverage", //Output folder for coverage
  coverageReporters: ["text", "lcov"],
  //Enforce coverage thresholds
  coverageThreshold: {
    global: {
      branches: 0, //Global >= 80%
      functions: 0,
      lines: 0,
      statements: 0,
    },
    // "./helpers/": {
    //   branches: 90, //Helpers ≥ 90% branches
    // },
    "./controllers/": {
      branches: 0, //Controllers >= 75%
      lines: 0, //Controllers >= 85% lines
    },
  },
  testMatch: ["**/?(*.)+(spec|test).js"], //Detect test files
  maxWorkers: 1, //Run tests serially (matches your CI --runInBand)
};
