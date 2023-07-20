import Home from "../pages/home/home";
import Hardware from "../pages/hardware/hardware";
import { Route, Routes } from "react-router-dom";

const Router = () => <Routes>
  <Route
    path="/"
    element={<Home />}
  />
  <Route
    path="/hardware"
    element={<Hardware />}
  />
</Routes>;

export default Router;