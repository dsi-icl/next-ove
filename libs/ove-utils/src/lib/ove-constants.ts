import { type ConstantsType } from "./types";

const Constants: ConstantsType = ({
  UNKNOWN_APP_ID: "__UNKNOWN__",
  APP_LOG_ID_WIDTH: 16,
  RegExp: {
    Annotation: {
      NAME: /@NAME/g,
      APP_NAME: /@APP_NAME/g,
      VERSION: /@VERSION/g,
      LICENSE: /@LICENSE/g,
      AUTHOR: /@AUTHOR/g
    }
  },
  LogLevels: {
    fatal: {
      name: "FATAL",
      consoleLogger: "error",
      level: 0,
      label: { bgColor: "#FF0000", color: "#FFFFFF" }
    },
    error: {
      name: "ERROR",
      consoleLogger: "error",
      level: 1,
      label: { bgColor: "#B22222", color: "#FFFAF0" }
    },
    warn: {
      name: "WARN",
      consoleLogger: "warn",
      level: 2,
      label: { bgColor: "#DAA520", color: "#FFFFF0" }
    },
    info: {
      name: "INFO",
      consoleLogger: "log",
      level: 3,
      label: { bgColor: "#2E8B57", color: "#FFFAFA" }
    },
    debug: {
      name: "DEBUG",
      consoleLogger: "log",
      level: 4,
      label: { bgColor: "#1E90FF", color: "#F8F8FF" }
    },
    trace: {
      name: "TRACE",
      consoleLogger: "log",
      level: 5,
      label: { bgColor: "#808080", color: "#FFFAF0" }
    }
  },
  DEFAULT_LOG_LEVEL: -1
});

export default Constants;
