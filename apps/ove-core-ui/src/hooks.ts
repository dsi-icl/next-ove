import { useCallback } from "react";
import { Json } from "@ove/ove-utils";
import { useNavigate } from "react-router-dom";
import { createAuthClient, createClient } from "./utils";
import { logger } from "./env";
import { useStore } from "./store";

export const useAuth = () => {
  const navigate = useNavigate();
  const tokens = useStore(state => state.tokens);
  const setTokens = useStore(state => state.setTokens);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await createAuthClient(username, password).login.mutate();
      if ("oveError" in res) {
        logger.error(res.oveError);
        logout();
      } else {
        setTokens(res);
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
    const res = await createClient(tokens).token.mutate();
    if (typeof res !== "string") return;
    const refreshedTokens = {access: res, refresh: tokens.refresh};
    localStorage.setItem("tokens", Json.stringify(refreshedTokens));
    setTokens(refreshedTokens);
    return refreshedTokens;
  }, []);

  return {
    loggedIn: tokens !== null,
    tokens,
    login,
    logout,
    refresh
  };
};

// export const useFetchConfig = () => {
//   const {refresh} = useAuth();
//   const context = trpc.useContext();
//   return {
//     retry: false,
//     onError: async () => {
//       console.log("REFRESHING");
//       await refresh();
//       await context.invalidate();
//     }
//   };
// };