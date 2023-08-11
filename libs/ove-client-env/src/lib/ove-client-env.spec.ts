import { oveClientEnv } from './ove-client-env';

describe('oveClientEnv', () => {
  it('should work', () => {
    expect(oveClientEnv()).toEqual('ove-client-env');
  });
});
