import { useEffect, useState } from "react";

export const usePin = () => {
  const [pin, setPin] = useState("");

  useEffect(() => {
    window.client.receive("update-pin", setPin);
  }, []);

  return pin;
};
