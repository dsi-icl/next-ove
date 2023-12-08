import Launcher from "../pages/launcher/page";
import Login from "../pages/login/page";
import Hardware from "../pages/hardware/page";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/protected-route";
import { useAuth } from "../hooks";
import Sockets from "../pages/sockets/page";

const Router = () => {
  const { loggedIn } = useAuth();
  return <Routes>
    <Route
      path="/"
      element={<Launcher />}
    />
    <Route
      path="/hardware"
      element={<ProtectedRoute condition={loggedIn}
                               redirectTo={"/login"}><Hardware /></ProtectedRoute>}
    />
    <Route
      path="/login"
      element={<Login />}
    />
    <Route
      path="/sockets"
      element={<ProtectedRoute condition={loggedIn}
                               redirectTo="/login"><Sockets /></ProtectedRoute>} />
  </Routes>;
};

export default Router;
