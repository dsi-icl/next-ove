import { useStore } from "./store";
import { env, logger } from "./env";
import { Json } from "@ove/ove-utils";
import { useCallback, useMemo, useState } from "react";
import { createAuthClient, createClient } from "./utils";
import { useLocation, useNavigate } from "react-router-dom";

export const useAuth = () => {
  const navigate = useNavigate();
  const tokens = useStore(state => state.tokens);
  const setTokens = useStore(state => state.setTokens);
  const [username, setUsername] = useState<string | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await createAuthClient(username, password).login.mutate();
      if ("oveError" in res) {
        logger.error(res.oveError);
        logout();
      } else {
        setTokens(res);
        setUsername(username);
        localStorage.setItem("tokens", Json.stringify(res));
        navigate("/", { replace: true });
      }
    } catch (e) {
      logger.error(e);
      logout();
    }
  }, []);

  const logout = useCallback(() => {
    setTokens(null);
    localStorage.removeItem("tokens");
    navigate("/", { replace: true });
  }, []);

  const refresh = useCallback(async () => {
    if (tokens === null) return;
    try {
      const res = await createClient(tokens).token.mutate();
      if (typeof res !== "string") {
        logout();
        return;
      }
      const refreshedTokens = {access: res, refresh: tokens.refresh};
      localStorage.setItem("tokens", Json.stringify(refreshedTokens));
      setTokens(refreshedTokens);
      return refreshedTokens;
    } catch (e) {
      logout();
      return;
    }

  }, [tokens]);

  return {
    loggedIn: tokens !== null || env.DISABLE_AUTH,
    tokens,
    login,
    logout,
    refresh,
    username
  };
};

export const useQuery = () => {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
};
