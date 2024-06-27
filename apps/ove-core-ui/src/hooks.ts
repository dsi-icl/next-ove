import { trpc } from "./utils/api";
import { useStore } from "./store";
import { env, logger } from "./env";
import { Json } from "@ove/ove-utils";
import { isError } from "@ove/ove-types";
import { useDialog } from "@ove/ui-components";
import { useLocation, useNavigate } from "react-router-dom";
import type { LaunchConfig } from "./pages/project-editor/hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createAuthClient, createLogoutClient, createClient } from "./utils";

export const useAuth = () => {
  const navigate = useNavigate();
  const tokens = useStore(state => state.tokens);
  const setTokens = useStore(state => state.setTokens);
  const [username, setUsername] = useState<string | null>(null);

  const logout = useCallback(async (force = false) => {
    if (tokens !== null && !force) {
      try {
        await createLogoutClient(tokens.access).logout.mutate();
      } catch (e) {
        logger.error(e);
      }
    }
    setTokens(null);
    localStorage.removeItem("tokens");
    navigate("/", { replace: true });
  }, [navigate, setTokens, tokens]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await createAuthClient(username, password).login.mutate();
      if ("oveError" in res) {
        await logout();
      } else {
        setTokens({ ...res, expiry: new Date(res.expiry) });
        setUsername(username);
        localStorage.setItem("tokens", Json.stringify(res));
        navigate("/", { replace: true });
      }
    } catch (e) {
      await logout(true);
    }
  }, [logout, navigate, setTokens]);

  const refresh = useCallback(async () => {
    if (tokens === null) return;
    try {
      const res = await createClient(tokens).token.query();
      if (isError(res)) {
        await logout();
        return;
      }
      const refreshedTokens = {
        access: res.token,
        expiry: new Date(res.expiry),
        refresh: tokens.refresh
      };
      localStorage.setItem("tokens", Json.stringify(refreshedTokens));
      setTokens(refreshedTokens);
      return refreshedTokens;
    } catch (e) {
      await logout();
    }
  }, [tokens, logout, setTokens]);

  useEffect(() => {
    if (tokens === null || tokens.expiry > new Date()) return;
    refresh().catch();
  }, [refresh, tokens]);

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

export const useObservatories = () => {
  const observatories_ = trpc.core.getObservatoryBounds.useQuery();
  const [observatories, setObservatories] = useState<Record<string, {
    width: number,
    height: number,
    rows: number,
    columns: number
  }>>({});

  useEffect(() => {
    if (observatories_.status !== "success" ||
      isError(observatories_.data)) return;
    if (env.MODE !== "development" ||
      Object.keys(observatories_.data).length > 0) {
      setObservatories(observatories_.data);
    }
  }, [observatories_.status, observatories_.data]);

  return { observatories };
};

export const useActions = <T>() => {
  const [action_, setAction_] = useState<{
    action: T,
    config?: LaunchConfig
  } | null>(null);
  const { openDialog, isOpen, closeDialog, ref } = useDialog();
  const action = useMemo(() => action_?.action ?? null, [action_]);
  const config = useMemo(() => action_?.config ?? null, [action_]);

  useEffect(() => {
    if (action === null) {
      closeDialog();
    } else {
      openDialog();
    }
  }, [action, closeDialog, openDialog]);

  const setAction = useCallback((action: T, config?: LaunchConfig) => {
    setAction_(action === null ? null : { action, config });
  }, [setAction_]);

  return { dialog: ref, setAction, action, config, isOpen };
};
