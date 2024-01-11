import React from "react";
import Home from "../pages/home/home";
import Hardware from "../pages/hardware/hardware";
import { Route, Routes } from "react-router-dom";
import LiveView from "../pages/live-view/live-view";

const Router = () => <Routes>
  <Route
    path="/"
    element={<Home />}
  />
  <Route
    path="/hardware"
    element={<Hardware />}
  />
  <Route
    path="/live-view"
    element={<LiveView />}
  />
</Routes>;

export default Router;
