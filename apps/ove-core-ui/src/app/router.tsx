import React, { Suspense } from "react";
import { useLoggedIn } from "../hooks/auth";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/protected-route";

const Logs = React.lazy(() => import("../pages/logs/page"));
const Login = React.lazy(() => import("../pages/login/page"));
const Sockets = React.lazy(() => import("../pages/sockets/page"));
const Landing = React.lazy(() => import("../pages/landing/page"));
const Projects = React.lazy(() => import("../pages/launcher/page"));
const HardwareManager = React.lazy(() => import("../pages/hardware/page"));
const Collaboration = React.lazy(() => import("../pages/collaboration/page"));
const ProjectEditorLoader = React.lazy(() => import("../pages/editor/loader"));

const Router = () => {
  const loggedIn = useLoggedIn();

  return (
    <Suspense fallback={<div></div>}>
      <Routes>
        <Route path="/" element={loggedIn ? <Projects /> : <Landing />} />
        <Route
          path="/hardware"
          element={
            <ProtectedRoute condition={loggedIn} redirectTo={"/login"}>
              <HardwareManager />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/sockets"
          element={
            <ProtectedRoute condition={loggedIn} redirectTo="/login">
              <Sockets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editor"
          element={
            <ProtectedRoute condition={loggedIn} redirectTo="/login">
              <ProjectEditorLoader />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collaboration"
          element={
            <ProtectedRoute condition={loggedIn} redirectTo="/login">
              <Collaboration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <ProtectedRoute condition={loggedIn} redirectTo="/login">
              <Logs />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
};

export default Router;
