import { env } from "./env";
import { trpc } from "./utils/api";
import { useStore } from "./store";
import { Json } from "@ove/ove-utils";
import { isError } from "@ove/ove-types";
import { useDialog } from "@ove/ui-components";
import { createAuthClient, createClient } from "./utils";
import { useLocation, useNavigate } from "react-router-dom";
import type { LaunchConfig } from "./pages/project-editor/hooks";
import { useCallback, useEffect, useMemo, useState } from "react";

export const useAuth = () => {
  const navigate = useNavigate();
  const tokens = useStore(state => state.tokens);
  const setTokens = useStore(state => state.setTokens);
  const [username, setUsername] = useState<string | null>(null);

  const logout = useCallback(() => {
    setTokens(null);
    localStorage.removeItem("tokens");
    navigate("/", { replace: true });
  }, [navigate, setTokens]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await createAuthClient(username, password).login.mutate();
      if ("oveError" in res) {
        logout();
      } else {
        setTokens({ ...res, expiry: new Date(res.expiry) });
        setUsername(username);
        localStorage.setItem("tokens", Json.stringify(res));
        navigate("/", { replace: true });
      }
    } catch (e) {
      logout();
    }
  }, [logout, navigate, setTokens]);

  const refresh = useCallback(async () => {
    if (tokens === null) return;
    try {
      const res = await createClient(tokens).token.mutate();
      if (isError(res)) {
        logout();
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
      logout();
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
