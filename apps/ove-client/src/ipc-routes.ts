export const inboundChannels: InboundAPIChannels = {
  getInfo: "get-info",
  getAppVersion: "get-server-version",
};

export const outboundChannels: OutboundAPIChannels = {
  updatePin: "update-pin"
}

export type InboundAPIChannels = {
  [Key in keyof InboundAPI]: string
}

export type OutboundAPIChannels = {
  [Key in keyof OutboundAPI]: string
}

// client -> server
export type InboundAPI = {
  getInfo: (type?: string) => Promise<unknown>
  getAppVersion: () => Promise<string>
}

// server -> client
export type OutboundAPI = {
  updatePin: (pin: string) => void
}