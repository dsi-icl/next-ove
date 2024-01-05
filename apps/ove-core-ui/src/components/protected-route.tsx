import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";

/**
 * Only allows navigation to a route if a condition is met.
 * Otherwise, it redirects to a different specified route.
 */
const ProtectedRoute = ({
  condition,
  redirectTo,
  children
}: ConditionalRouteProps): JSX.Element => condition ? <>{children}</> :
  <Navigate to={redirectTo} replace />;

export type ConditionalRouteProps = {
  /**
   * Route is created if its condition is true.
   * For example, `condition={isLoggedIn}` or `condition={isAdmin}`
   */
  condition: boolean

  /** The route to redirect to if `condition` is false */
  redirectTo: string

  children?: ReactNode
}

export default ProtectedRoute;