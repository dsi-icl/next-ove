import { useState } from "react";

export const useSnackbar = () => {
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => {
      setNotification(null);
    }, 3_500);
  };

  return {
    notification: notification ?? "",
    show: showNotification,
    isVisible: notification !== null
  };
};