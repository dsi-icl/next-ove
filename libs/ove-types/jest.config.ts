/* eslint-disable */

declare const __BENCHMARKS__: string
export default {
  displayName: 'ove-types',
  preset: '../../jest.preset.ts',
  globals: {
    "__BENCHMARKS__": "../../out/benchmarks.json"
  },
  setupFiles: ["./helpers.cjs"],
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
    "@arktype": [
      "babel-jest"
    ]
  },
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!@arktype)"
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../out/coverage/tests/libs/ove-types',
  workerIdleMemoryLimit: "512MB"
};
