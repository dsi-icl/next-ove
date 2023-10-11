import { useEffect, useState } from "react";
import { logger } from "../../env";

export const useVideoStreams = () => {
  const [streams, setStreams] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    window.electron.startStreams().catch(logger.error);
    window.electron.getStreams().then(setStreams);

    return () => {
      window.electron.stopStreams().catch(logger.error);
    }
  }, []);

  return streams;
};