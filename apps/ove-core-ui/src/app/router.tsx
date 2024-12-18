import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/protected-route";

const Login = React.lazy(() => import("../pages/login/page"));
const Sockets = React.lazy(() => import("../pages/sockets/page"));
const Projects = React.lazy(() => import("../pages/projects/page"));
const Landing = React.lazy(() => import("../pages/landing/page"));
const Hardware = React.lazy(() => import("../pages/hardware/page"));
const ProjectEditorLoader = React.lazy(() => import("../pages/project-editor/loader"));

type RouterProps = {
  loggedIn: boolean,
  login: (username: string, password: string) => Promise<void>,
  token: string
}

const Router = ({ loggedIn, login, token }: RouterProps) => {
  return <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      <Route
        path="/"
        element={loggedIn ? <Projects /> : <Landing />}
      />
      <Route
        path="/hardware"
        element={<ProtectedRoute condition={loggedIn} redirectTo={"/login"}>
          <Hardware /></ProtectedRoute>}
      />
      <Route
        path="/login"
        element={<Login login={login} />}
      />
      <Route
        path="/sockets"
        element={<ProtectedRoute condition={loggedIn} redirectTo="/login">
          <Sockets /></ProtectedRoute>} />
      <Route
        path="/project-editor"
        element={<ProtectedRoute condition={loggedIn} redirectTo="/login">
          <ProjectEditorLoader token={token} /></ProtectedRoute>} />
    </Routes>
  </Suspense>;
};

export default Router;
