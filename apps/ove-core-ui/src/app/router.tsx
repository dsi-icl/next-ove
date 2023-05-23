import Home from "../pages/home/page";
import Hardware from "../pages/hardware/page";
import { Route, Routes } from "react-router-dom";
import Login, { Tokens } from "../pages/login/page";
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