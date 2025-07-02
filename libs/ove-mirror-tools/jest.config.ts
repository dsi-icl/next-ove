/* eslint-disable */
export default {
  displayName: 'ove-mirror-tools',
  preset: '../../jest.preset.ts',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../out/coverage/tests/libs/ove-mirror-tools',
};
