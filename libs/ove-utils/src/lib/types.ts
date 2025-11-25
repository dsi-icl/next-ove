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
  buildLogMessage: (logLevel: LogLevel, ...args: any[]) => string[]
  fatal: (...args: any[]) => void
  error: (...args: any[]) => void
  warn: (...args: any[]) => void
  info: (...args: any[]) => void
  debug: (...args: any[]) => void
  trace: (...args: any[]) => void
}

export type ConstantsType = {
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
