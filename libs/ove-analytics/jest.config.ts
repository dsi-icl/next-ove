/* eslint-disable */
export default {
  displayName: 'ove-analytics',
  preset: '../../jest.preset.ts',
  globals: {},
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../out/coverage/tests/libs/ove-analytics',
};
