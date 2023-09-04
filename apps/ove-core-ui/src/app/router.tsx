import Home from "../pages/home/page";
import Login from "../pages/login/page";
import Hardware from "../pages/hardware/page";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/protected-route";
import { useAuth } from "../hooks";

const Router = () => {
  const { loggedIn } = useAuth();
  return <Routes>
    <Route
      path="/"
      element={<Home />}
    />
    <Route
      path="/hardware"
      element={<ProtectedRoute children={<Hardware />}
                               condition={loggedIn}
                               redirectTo={"/login"} />}
    />
    <Route
      path="/login"
      element={<Login />}
    />
  </Routes>;
};

export default Router;