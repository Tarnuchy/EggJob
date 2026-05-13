import React from 'react';
import type { ReactNode } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { ErrorScreen } from '../../screens/ErrorScreen';

interface Props {
  children: ReactNode;
}

export const ErrorBoundary = ({ children }: Props) => (
  <ReactErrorBoundary
    FallbackComponent={ErrorScreen}
    onError={(error) => {
      console.error('[ErrorBoundary]', error);
    }}
  >
    {children}
  </ReactErrorBoundary>
);
