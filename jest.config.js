module.exports = {
  testEnvironment: 'node',
  collectCoverage: true, //Enable coverage
  collectCoverageFrom: [
    "controllers/**/*.js",
    "helpers/**/*.js",
    "models/**/*.js",
    "routes/**/*.js",
    "!**/node_modules/**"
  ],
  coverageDirectory: "coverage", //Output folder for coverage
  coverageReporters: ["text", "lcov"],
  //Enforce coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,    //Global ≥ 80%
      functions: 80,
      lines: 80,
      statements: 80
    },
    "./helpers/": {
      branches: 90     //Helpers ≥ 90% branches
    },
    "./controllers/": {
      branches: 75,    //Controllers ≥ 75%
      lines: 85        //Controllers ≥ 85% lines
    }
  },
  testMatch: ["**/?(*.)+(spec|test).js"], //Detect test files
  maxWorkers: 1 //Run tests serially (matches your CI --runInBand)
};