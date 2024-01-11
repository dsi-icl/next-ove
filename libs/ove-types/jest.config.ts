/* eslint-disable */
export default {
  displayName: 'ove-types',
  preset: '../../jest.preset.js',
  globals: {},
  setupFiles: ["./helpers.js"],
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
  coverageDirectory: '../../coverage/libs/ove-types',
  workerIdleMemoryLimit: "512MB"
};
