import React, { Suspense } from "react";
import { useLoggedIn } from "../hooks/auth";
import { auth } from "../utils/api";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/protected-route";
import { useStore } from "../store";

const Logs = React.lazy(() => import("../pages/logs/page"));
const Admin = React.lazy(() => import("../pages/admin/page"));
const Login = React.lazy(() => import("../pages/login/page"));
const Sockets = React.lazy(() => import("../pages/sockets/page"));
const Landing = React.lazy(() => import("../pages/landing/page"));
const Projects = React.lazy(() => import("../pages/launcher/page"));
const HardwareManager = React.lazy(() => import("../pages/hardware/page"));
const Collaboration = React.lazy(() => import("../pages/collaboration/page"));
const ProjectEditorLoader = React.lazy(() => import("../pages/editor/loader"));

const Router = () => {
  const loggedIn = useLoggedIn();
  const user = useStore((store) => store.user);
  const refresh = auth.refresh.useQuery();

  return refresh.isFetched ? (
    <Suspense fallback={<div></div>}>
      <Routes>
        <Route path="/" element={loggedIn ? <Projects /> : <Landing />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute
              condition={loggedIn && user?.role === "admin"}
              redirectTo="/login?to=/admin"
            >
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hardware"
          element={
            <ProtectedRoute
              condition={loggedIn}
              redirectTo="/login?to=/hardware"
            >
              <HardwareManager />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/sockets"
          element={
            <ProtectedRoute
              condition={loggedIn}
              redirectTo="/login?to=/sockets"
            >
              <Sockets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editor"
          element={
            <ProtectedRoute condition={loggedIn} redirectTo="/login?to=/editor">
              <ProjectEditorLoader />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collaboration"
          element={
            <ProtectedRoute
              condition={loggedIn}
              redirectTo="/login?to=/collaboration"
            >
              <Collaboration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <ProtectedRoute condition={loggedIn} redirectTo="/login?to=/logs">
              <Logs />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  ) : (
    <div></div>
  );
};

export default Router;
