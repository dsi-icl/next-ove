/* eslint-disable */
export default {
  displayName: 'ove-server-utils',
  preset: '../../jest.preset.ts',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../out/coverage/tests/libs/ove-server-utils',
};
