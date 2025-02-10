import { useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { useCallback, useEffect } from "react";
import { createAuthClient, createClient, createLogoutClient } from "../utils";
import { env, logger } from "../env";
import { isError } from "@ove/ove-types";
import { Json } from "@ove/ove-utils";

export const useAuth = () => {
  const navigate = useNavigate();
  const tokens = useStore((state) => state.tokens);
  const setTokens = useStore((state) => state.setTokens);
  const setUser = useStore((state) => state.setUser);
  const user = useStore((state) => state.user);

  const logout = useCallback(
    async (force = false) => {
      if (tokens !== null && !force) {
        try {
          await createLogoutClient(tokens.access).logout.mutate({});
        } catch (e) {
          logger.error(e);
        }
      }
      setTokens(null);
      setUser(null);
      localStorage.removeItem("tokens");
      navigate("/", { replace: true });
    },
    [navigate, setTokens, tokens, setUser],
  );

  const login = useCallback(
    async (username: string, password: string) => {
      try {
        const res = await createAuthClient(username, password).login.mutate({});
        if ("oveError" in res) {
          await logout();
        } else {
          const tokens_ = { ...res, expiry: new Date(res.expiry) };
          setTokens(tokens_);
          const user = await createLogoutClient(tokens_.access).getUserID.query(
            {},
          );
          setUser(isError(user) ? null : user);
          localStorage.setItem("tokens", Json.stringify(res));
          navigate("/", { replace: true });
        }
      } catch (_e) {
        await logout(true);
      }
    },
    [logout, navigate, setTokens, setUser],
  );

  const refresh = useCallback(async () => {
    if (tokens === null) return;
    try {
      const res = await createClient(tokens).token.query({});
      if (isError(res)) {
        await logout();
        return;
      }
      const refreshedTokens = {
        access: res.token,
        expiry: new Date(res.expiry),
        refresh: tokens.refresh,
      };
      localStorage.setItem("tokens", Json.stringify(refreshedTokens));
      setTokens(refreshedTokens);
      return refreshedTokens;
    } catch (_e) {
      await logout();
    }
  }, [tokens, logout, setTokens]);

  useEffect(() => {
    if (tokens === null || tokens.expiry > new Date()) return;
    if (user === null) {
      createLogoutClient(tokens.access)
        .getUserID.query({})
        .then((user) => {
          setUser(isError(user) ? null : user);
        });
    }
    refresh().catch();
  }, [refresh, tokens, user, setUser]);

  return {
    loggedIn: tokens !== null || env.DISABLE_AUTH,
    tokens,
    login,
    logout,
    refresh,
  };
};
