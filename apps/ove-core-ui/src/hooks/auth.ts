import { useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { useCallback, useEffect, useMemo } from "react";
import { logger } from "../env";
import { auth } from "../utils/api";
import { toast } from "sonner";

export const useLogout = () => {
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);
  const logout = auth.logout.useMutation({
    onSuccess: () => {
      setUser(null);
      navigate("/", { replace: true });
    },
    onError: () => {
      toast.error("Unable to logout, please try again");
    },
  });

  return useCallback(() => {
    logout.mutateAsync({}).catch(logger.error);
  }, [logout]);
};

export const useLoggedIn = () => {
  const user = useStore((state) => state.user);
  return useMemo(() => user !== null, [user]);
};

export const useLogin = (username: string | null, password: string | null) => {
  const setUser = useStore((state) => state.setUser);
  const navigate = useNavigate();
  const location = useLocation();
  const to = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("to") ?? "/";
  }, [location.search]);
  const login = auth.login.useMutation({
    onSuccess: (data) => {
      console.log("Successful login", data);
      setUser(data);
      navigate(to);
    },
    onError: () => {
      toast.error("Unable to login, please try again");
    },
  });

  useEffect(() => {
    if (username === null || password === null) return;
    login.mutateAsync({ username, password }).catch(logger.error);
  }, [username, password]);
};
