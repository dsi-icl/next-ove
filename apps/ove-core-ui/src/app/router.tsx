import Home from "../pages/home/page";
import Login from "../pages/login/page";
import { Tokens } from "@ove/ove-types";
import Hardware from "../pages/hardware/page";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/protected-route";

export type RouterProps = {
  tokens: Tokens | null
  setTokens: (tokens: Tokens) => void
}

export default ({ tokens, setTokens }: RouterProps) => <Routes>
  <Route
    path="/"
    element={<Home />}
  />
  <Route
    path="/hardware"
    element={<ProtectedRoute children={<Hardware />}
                             condition={tokens !== null}
                             redirectTo={"/login"} />}
  />
  <Route
    path="/login"
    element={<Login setTokens={setTokens} />}
  />
</Routes>