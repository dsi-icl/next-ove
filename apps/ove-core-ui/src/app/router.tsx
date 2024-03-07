import React from "react";
import { assert } from "@ove/ove-utils";
import Login from "../pages/login/page";
import Sockets from "../pages/sockets/page";
import Launcher from "../pages/launcher/page";
import Hardware from "../pages/hardware/page";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/protected-route";
import ProjectEditorLoader from "../pages/project-editor/loader";

type RouterProps = {
  loggedIn: boolean,
  login: (username: string, password: string) => Promise<void>,
  username: string | null
}

const Router = ({ loggedIn, login, username }: RouterProps) => {
  return <Routes>
    <Route
      path="/"
      element={<Launcher loggedIn={loggedIn} />}
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
        <ProjectEditorLoader username={assert(username)} /></ProtectedRoute>} />
  </Routes>;
};

export default Router;
