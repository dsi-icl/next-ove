export default {
  modulePathIgnorePatterns: ["<rootDir>/apps/*", "<rootDir>/libs/*"],
  preset: "ts-jest",
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true
      }
    ]
  }
};
