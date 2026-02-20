import * as React from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import ErrorPage from "./page";
import { useLocation } from "react-router-dom";

type AppErrorBoundaryProps = {
  children: React.ReactNode;
};

const Fallback = ({
  error,
}: FallbackProps) => (
  <ErrorPage
    error={error}
    title="Application error"
    description="An unexpected error occurred."
    resetErrorBoundary={() => window.location.reload()}
  />
);

const AppErrorBoundary = ({
  children,
}: AppErrorBoundaryProps) => {
  const location = useLocation();
  return (
    <ErrorBoundary
      FallbackComponent={Fallback}
      onError={(error, info) => {
        console.error("Captured by boundary:", error, info);
      }}
      resetKeys={[location.pathname]}
    >
      {children}
    </ErrorBoundary>
  );
};

export default AppErrorBoundary;