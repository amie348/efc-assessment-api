import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "@models/(.*)": "<rootDir>/src/models/$1",
    "@controllers/(.*)": "<rootDir>/src/controllers/$1",
    "@routes/(.*)": "<rootDir>/src/routes/$1",
    "@validations/(.*)": "<rootDir>/src/validations/$1",
    "@config/(.*)": "<rootDir>/src/config/$1",
    "@utils/(.*)": "<rootDir>/src/utils/$1",
    "@customeTypes/(.*)": "<rootDir>/src/types/$1",
    "@services/(.*)": "<rootDir>/src/services/$1",
    "@db/(.*)": "<rootDir>/src/db/$1",
    "@middlewares/(.*)": "<rootDir>/src/middlewares/$1",
    "@docs/(.*)": "<rootDir>/docs/$1",
  },
  moduleFileExtensions: ["ts", "js", "json", "node"],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.[tj]sx?$",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  coverageDirectory: "<rootDir>/coverage", // Directory where coverage reports will be stored
  collectCoverage: true, // Enables code coverage collection
  collectCoverageFrom: [
    "src/**/*.{ts,js}", // Collect coverage from all TypeScript and JavaScript files in the src directory
    "!src/**/*.d.ts", // Exclude declaration files
    "!src/**/index.ts", // Optionally exclude index files if not needed
    "!src/**/*test.{ts,js}", // Optionally exclude test files from coverage
  ],
  coverageReporters: ["text", "lcov", "json"], // You can add other reporters like "html" if needed
  coverageThreshold: {
    global: {
      branches: 80, // Minimum threshold for branches coverage
      functions: 80, // Minimum threshold for functions coverage
      lines: 80, // Minimum threshold for lines coverage
      statements: 80, // Minimum threshold for statements coverage
    },
  },
};

export default config;
