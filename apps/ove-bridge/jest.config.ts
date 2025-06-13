/* eslint-disable */
export default {
  displayName: "ove-bridge",
  preset: "../../jest.preset.ts",
  globals: {},
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.spec.json",
      },
    ],
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "../../out/coverage/tests/apps/ove-bridge",
};
