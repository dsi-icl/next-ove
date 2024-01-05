import { useEffect, useState } from "react";
import { logger } from "../../env";

export const useVideoStreams = () => {
  const [streams, setStreams] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    window.bridge.startStreams({}).catch(logger.error);
    window.bridge.getStreams({}).then(streams => {
      if (!Array.isArray(streams)) return;
      setStreams(streams);
    });

    return () => {
      window.bridge.stopStreams({}).catch(logger.error);
    }
  }, []);

  return streams;
};