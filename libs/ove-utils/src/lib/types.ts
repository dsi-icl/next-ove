export type LogLevel = {
  name: string
  consoleLogger: string
  level: number
  label: {
    bgColor: string
    color: string
  }
}

export type LoadLogger = {
  Logger: (name: string, logLevel: number) => Logger
}

export type Logger = {
  name: string
  getLogLabel: (logLevel: LogLevel) => object
  buildLogMessage: (logLevel: LogLevel, ...args: string[]) => string[]
  fatal: (...args: string[]) => void
  error: (...args: string[]) => void
  warn: (...args: string[]) => void
  info: (...args: string[]) => void
  debug: (...args: string[]) => void
  trace: (...args: string[]) => void
}

export type Constants = {
  UNKNOWN_APP_ID: string
  APP_LOG_ID_WIDTH: number
  LogLevels: {
    [index:string]: LogLevel
  }
  RegExp: {
    Annotation: {
      [index:string]: RegExp
    }
  }
  DEFAULT_LOG_LEVEL: number
}
