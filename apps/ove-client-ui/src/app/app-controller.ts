import { useEffect, useState } from "react";

export const usePin = () => {
  const [pin, setPin] =
    useState<string>("");

  useEffect(() => {
    window.electron.receive("update-pin", setPin);
  }, []);

  return pin;
};