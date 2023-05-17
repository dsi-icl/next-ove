export const channels: APIChannels = {
  getInfo: "get-info",
  getAppVersion: "get-app-version"
};

export type APIChannels = {
  [Key in keyof API]: string
}

export type API = {
  getInfo: (type?: string) => Promise<unknown>
  getAppVersion: () => Promise<string>
}