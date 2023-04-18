import { render } from '@testing-library/react';

import OveBridgeUi from './ove-bridge-ui';

describe('OveBridgeUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OveBridgeUi />);
    expect(baseElement).toBeTruthy();
  });
});
