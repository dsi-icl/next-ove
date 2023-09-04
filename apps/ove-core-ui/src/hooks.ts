import { useCallback, useEffect, useState } from "react";
import { Tokens } from "@ove/ove-types";
import { Json } from "@ove/ove-utils";
import { useNavigate } from "react-router-dom";
import { createAuthClient } from "./utils";
import { logger } from "./env";

export const useAuth = () => {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState<Tokens | null>(() => {
    const stored = localStorage.getItem("tokens");
    if (stored === null) return null;
    return Json.parse<Tokens>(stored);
  });

  useEffect(() => {
    if (tokens === null) {
      localStorage.removeItem("tokens");
      navigate("/", { replace: true });
    } else {
      localStorage.setItem("tokens", Json.stringify(tokens));
      navigate("/", { replace: true });
    }
  }, [tokens]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setTokens(await createAuthClient(username, password).login.mutate());
    } catch (e) {
      logger.error(e);
      logout();
    }
  }, []);

  const logout = useCallback(() => {
    setTokens(null);
  }, []);

  return {
    loggedIn: tokens !== null,
    tokens,
    login,
    logout
  };
};