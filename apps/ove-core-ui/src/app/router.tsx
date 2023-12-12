import Launcher from "../pages/launcher/page";
import Login from "../pages/login/page";
import Hardware from "../pages/hardware/page";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/protected-route";
import Sockets from "../pages/sockets/page";
import ProjectEditor from "../pages/project-editor/page";

type RouterProps = {loggedIn: boolean, login: (username: string, password: string) => Promise<void>}

const Router = ({loggedIn, login}: RouterProps) => {
  return <Routes>
    <Route
      path="/"
      element={<Launcher loggedIn={loggedIn} />}
    />
    <Route
      path="/hardware"
      element={<ProtectedRoute condition={loggedIn}
                               redirectTo={"/login"}><Hardware /></ProtectedRoute>}
    />
    <Route
      path="/login"
      element={<Login login={login} />}
    />
    <Route
      path="/sockets"
      element={<ProtectedRoute condition={loggedIn}
                               redirectTo="/login"><Sockets /></ProtectedRoute>} />
    <Route
      path="/project-editor"
      element={<ProtectedRoute condition={loggedIn} redirectTo="/login"><ProjectEditor /></ProtectedRoute>} />
  </Routes>;
};

export default Router;
