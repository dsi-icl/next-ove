import { z } from "zod";
import { OVEExceptionSchema, ResponseSchema } from "./ove-types";

// Type aliases for API
export type Image = string;
export const ImageSchema = z.string();

export type ID = number;
export const IDSchema = z.number();

export const DeviceIDSchema = z.string();
export type Status = boolean;
export const StatusSchema = z.boolean();

export type Optional<T> = T | undefined;

// Node types
export const ScreenshotMethodSchema = z.union([
  z.literal("upload"),
  z.literal("local"),
  z.literal("response")
]);
export type ScreenshotMethod = z.infer<typeof ScreenshotMethodSchema>;

// PJLink types
export const PJLinkSourceSchema = z.object({
  RGB: z.literal(1),
  VIDEO: z.literal(2),
  DIGITAL: z.literal(3),
  STORAGE: z.literal(4),
  NETWORK: z.literal(5)
}).strict();

export type PJLinkSource = z.infer<typeof PJLinkSourceSchema>;

// Services
export const ServiceTypesSchema = z.union([
  z.literal("node"),
  z.literal("mdc"),
  z.literal("pjlink")
]);
export type ServiceTypes = z.infer<typeof ServiceTypesSchema>;

export const MDCSourceSchema = z.object({
  UNKNOWN: z.number(),
  PC: z.number(),
  DVI: z.number(),
  DVI_VIDEO: z.number(),
  AV: z.number(),
  SVIDEO: z.number(),
  COMPONENT: z.number(),
  MAGICNET: z.number(),
  TV: z.number(),
  DTV: z.number(),
  HDMI1: z.number(),
  HDMI1_PC: z.number(),
  HDMI2: z.number(),
  HDMI2_PC: z.number(),
  DP: z.number(),
  DP2: z.number(),
  DP3: z.number()
}).strict();

export type MDCSources = z.infer<typeof MDCSourceSchema>;
export const SourceSchemas = z.union([
  MDCSourceSchema.keyof(),
  PJLinkSourceSchema.keyof()
]);

// Device
export const DeviceSchema = z.object({
  id: z.string(),
  description: z.string(),
  ip: z.string(),
  port: z.number(),
  protocol: ServiceTypesSchema,
  mac: z.string(),
  tags: z.array(z.string())
});

export type Device = z.infer<typeof DeviceSchema>;

// Bridge types
export const BridgeMetadataSchema =
  z.object({ bridge: z.string() });
export const getBridgeResponseSchema = <T extends z.ZodTypeAny>(schema: T) => {
  return z.object({
    meta: BridgeMetadataSchema,
    response: schema
  });
};

export const getDeviceResponseSchema =
  <T extends z.ZodTypeAny>(schema: T):
    z.ZodUnion<readonly [T, typeof OVEExceptionSchema]> =>
    z.union([schema, OVEExceptionSchema]);

const multiDeviceWrapper = <T extends z.ZodTypeAny>(schema: T) =>
  z.array(z.object({
    deviceId: z.string(),
    response: getDeviceResponseSchema(schema)
  }));
export const getMultiDeviceResponseSchema =
  <T extends z.ZodTypeAny>(schema: T):
    z.ZodUnion<readonly [ReturnType<
      typeof multiDeviceWrapper<T>>,
      typeof OVEExceptionSchema
    ]> => z.union([multiDeviceWrapper(schema), OVEExceptionSchema]);

type ServiceAPIRoute<A extends z.ZodRawShape, U extends z.ZodTypeAny> = {
  args: z.ZodObject<A, "strict", z.ZodTypeAny>
  returns: U
};

type ClientAPIRoute<A extends z.ZodRawShape, U extends z.ZodTypeAny> = {
  client: ReturnType<typeof getDeviceResponseSchema<U>>;
} & { [Key in keyof ServiceAPIRoute<A, U>]: ServiceAPIRoute<A, U>[Key] }

type BridgeAPIRoute<A extends z.ZodRawShape, U extends z.ZodTypeAny> = {
  bridge: ReturnType<
    typeof getBridgeResponseSchema<ClientAPIRoute<A, U>["client"]>
  >;
} & { [Key in keyof ClientAPIRoute<A, U>]: ClientAPIRoute<A, U>[Key] };

type BridgeAPIRouteAll<A extends z.ZodRawShape, U extends z.ZodTypeAny> =
  { [Key in keyof ClientAPIRoute<A, U>]: ClientAPIRoute<A, U>[Key] } & {
  bridge: ReturnType<typeof
    getBridgeResponseSchema<ReturnType<typeof getMultiDeviceResponseSchema<U>>>>
};

type CoreAPIRoute<A extends z.ZodRawShape, U extends z.ZodTypeAny> = {
  [Key in keyof BridgeAPIRoute<A, U>]: BridgeAPIRoute<A, U>[Key]
};

type CoreAPIRouteAll<A extends z.ZodRawShape, U extends z.ZodTypeAny> = {
  [Key in keyof BridgeAPIRouteAll<A, U>]: BridgeAPIRouteAll<A, U>[Key]
};

const emptySchema = z.object({}).strict();
const infoArgsSchema = { type: z.string().optional() };

const ServiceAPI = {
  getStatus: {
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  getInfo: {
    args: z.object(infoArgsSchema).strict(),
    returns: z.unknown()
  },
  getBrowserStatus: {
    args: z.object({ browserId: IDSchema }).strict(),
    returns: StatusSchema
  },
  getBrowsers: {
    args: z.object({}).strict(),
    returns: z.array(IDSchema)
  },
  start: {
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  reboot: {
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  shutdown: {
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  execute: {
    args: z.object({ command: z.string() }).strict(),
    returns: ResponseSchema
  },
  screenshot: {
    args: z.object({
      method: ScreenshotMethodSchema,
      screens: z.array(IDSchema)
    }).strict(),
    returns: z.array(ImageSchema)
  },
  openBrowser: {
    args: z.object({
      url: z.string().optional(),
      displayId: IDSchema.optional()
    }).strict(),
    returns: IDSchema
  },
  closeBrowser: {
    args: z.object({ browserId: IDSchema }).strict(),
    returns: StatusSchema
  },
  closeBrowsers: {
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  setVolume: {
    args: z.object({ volume: z.number() }).strict(),
    returns: StatusSchema
  },
  setSource: {
    args: z.object({
      source: SourceSchemas,
      channel: z.number().optional()
    }).strict(),
    returns: StatusSchema
  },
  mute: { args: z.object({}).strict(), returns: StatusSchema },
  unmute: { args: z.object({}).strict(), returns: StatusSchema },
  muteAudio: { args: z.object({}).strict(), returns: StatusSchema },
  unmuteAudio: { args: z.object({}).strict(), returns: StatusSchema },
  muteVideo: { args: z.object({}).strict(), returns: StatusSchema },
  unmuteVideo: { args: z.object({}).strict(), returns: StatusSchema }
};

type ServiceAPIType = typeof ServiceAPI;
type ServiceKeys = keyof ServiceAPIType;
type ArgsShape<Key extends keyof ServiceAPIType> =
  ServiceAPIType[Key]["args"]["shape"]

export type ClientAPIRoutesType = {
  [Key in ServiceKeys]: ClientAPIRoute<
    ArgsShape<Key>,
    typeof ServiceAPI[Key]["returns"]
  >
};

type ClientKeys = ServiceKeys;

const devicesSchema = z.array(DeviceSchema);
const deviceIDSchema =
  z.object({ deviceId: DeviceIDSchema }).strict();
const addDeviceSchema = z.object({ device: DeviceSchema }).strict();

type ClientArgsShape<Key extends keyof ClientAPIRoutesType> =
  ClientAPIRoutesType[Key]["args"]["shape"];

export type BridgeAPIRoutesType = {
  getDevice: BridgeAPIRoute<
    typeof deviceIDSchema["shape"],
    typeof DeviceSchema
  >
  getDevices: BridgeAPIRoute<
    typeof emptySchema["shape"],
    typeof devicesSchema
  >
  addDevice: BridgeAPIRoute<
    typeof addDeviceSchema["shape"],
    typeof StatusSchema
  >
  removeDevice: BridgeAPIRoute<
    typeof deviceIDSchema["shape"],
    typeof StatusSchema
  >
} & {
  [Key in ClientKeys]: BridgeAPIRoute<z.extendShape<ClientArgsShape<Key>, {
    deviceId: z.ZodString
  }>, ClientAPIRoutesType[Key]["returns"]>
} & {
  [Key in ClientKeys as `${Key}All`]: BridgeAPIRouteAll<z.extendShape<
    ClientArgsShape<Key>,
    { tag: z.ZodOptional<z.ZodString> }
  >, ClientAPIRoutesType[Key]["returns"]>
};

export const ClientAPIRoutes: ClientAPIRoutesType = (Object.keys(ServiceAPI) as Array<keyof typeof ServiceAPI>).reduce((acc, k) => {
  return {
    ...acc,
    [k]: {
      returns: ServiceAPI[k].returns,
      args: ServiceAPI[k].args,
      client: z.union([ServiceAPI[k].returns, OVEExceptionSchema])
    }
  };
}, {} as ClientAPIRoutesType);

const BridgeAPIRoutes: BridgeAPIRoutesType = (Object.keys(ClientAPIRoutes) as Array<keyof ClientAPIRoutesType>).reduce((acc, k) => {
  return {
    ...acc,
    [k]: {
      returns: ClientAPIRoutes[k].returns,
      args: ClientAPIRoutes[k].args.extend({
        deviceId: DeviceIDSchema
      }),
      client: ClientAPIRoutes[k].client,
      bridge: getBridgeResponseSchema(ClientAPIRoutes[k].client)
    },
    [`${k}All`]: {
      returns: ClientAPIRoutes[k].returns,
      args: ClientAPIRoutes[k].args.extend({
        tag: z.string().optional()
      }),
      client: ClientAPIRoutes[k].client,
      bridge: getBridgeResponseSchema(ClientAPIRoutes[k].client)
    }
  };
}, {
  getDevice: {
    args: z.object({ deviceId: DeviceIDSchema }).strict(),
    returns: DeviceSchema,
    client: getDeviceResponseSchema(DeviceSchema),
    bridge: getBridgeResponseSchema(getDeviceResponseSchema(DeviceSchema))
  },
  getDevices: {
    args: z.object({}).strict(),
    returns: z.array(DeviceSchema),
    client: getDeviceResponseSchema(z.array(DeviceSchema)),
    bridge: getBridgeResponseSchema(
      getDeviceResponseSchema(z.array(DeviceSchema)))
  },
  addDevice: {
    args: z.object({ device: DeviceSchema }).strict(),
    returns: StatusSchema,
    client: getDeviceResponseSchema(StatusSchema),
    bridge: getBridgeResponseSchema(getDeviceResponseSchema(StatusSchema))
  },
  removeDevice: {
    args: z.object({ deviceId: DeviceIDSchema }).strict(),
    returns: StatusSchema,
    client: getDeviceResponseSchema(StatusSchema),
    bridge: getBridgeResponseSchema(getDeviceResponseSchema(StatusSchema))
  }
} as BridgeAPIRoutesType);

export const CoreAPIRoutes: CoreAPIRoutesType = (Object.keys(BridgeAPIRoutes) as Array<keyof BridgeAPIRoutesType>).reduce((acc, k) => {
  return {
    ...acc,
    [k]: {
      returns: BridgeAPIRoutes[k].returns,
      args: BridgeAPIRoutes[k].args.extend({bridgeId: z.string()}),
      client: BridgeAPIRoutes[k].client,
      bridge: BridgeAPIRoutes[k].bridge
    }
  }
}, {} as CoreAPIRoutesType);

type CoreAPIRoutesType = {
  [Key in keyof BridgeAPIRoutesType]:
  BridgeAPIRoutesType[Key] extends BridgeAPIRoute<
    BridgeAPIRoutesType[Key]["args"]["shape"],
    BridgeAPIRoutesType[Key]["returns"]
  > ? CoreAPIRoute<
    z.extendShape<BridgeAPIRoutesType[Key]["args"]["shape"], {
      bridgeId: z.ZodString
    }>, BridgeAPIRoutesType[Key]["returns"]> : CoreAPIRouteAll<z.extendShape<
    BridgeAPIRoutesType[Key]["args"]["shape"],
    { bridgeId: z.ZodString }
  >, BridgeAPIRoutesType[Key]["returns"]>
}

export type BridgeAPI = {
  [Key in keyof BridgeAPIRoutesType]: (
    args: z.infer<BridgeAPIRoutesType[Key]["args"]>,
    callback: (response: z.infer<BridgeAPIRoutesType[Key]["bridge"]>) => void
  ) => void
};

export type DS = {
  [Key in keyof ClientAPIRoutesType]?: (
    device: Device,
    args: z.infer<ClientAPIRoutesType[Key]["args"]>
  ) => Promise<Optional<z.infer<ClientAPIRoutesType[Key]["client"]>>>
};

export type DSArgs<Key extends keyof DS> = z.infer<ClientAPIRoutesType[Key]["args"]>;

export type ClientToServerEvents = Record<string, unknown>;

export type Browser = {
  idx: string
};
