import type {
  Browser,
  BrowserConfig,
  MDCSource,
  PJLinkSource,
  StatusOptions,
} from "@ove/ove-types";

type ReconciliationStateValue<T, U> = { target: T | null; observed: U | null; };

export type NodeState = {
  type: "node";
  status: ReconciliationStateValue<StatusOptions, StatusOptions>;
  browsers: ReconciliationStateValue<boolean, Record<string, Browser>>;
  browserConfigs: ReconciliationStateValue<BrowserConfig, BrowserConfig>;
  screenshots: string[] | null;
};

export type MDCState = {
  type: "mdc";
  status: ReconciliationStateValue<StatusOptions, StatusOptions>;
  volume: ReconciliationStateValue<number, number>;
  source: ReconciliationStateValue<keyof MDCSource, keyof MDCSource>;
  muted: ReconciliationStateValue<boolean, boolean>;
};

export type PJLinkState = {
  type: "pjlink";
  status: ReconciliationStateValue<StatusOptions, StatusOptions>;
  source: ReconciliationStateValue<keyof PJLinkSource, keyof PJLinkSource>;
  muted: ReconciliationStateValue<boolean, boolean>;
  audio: ReconciliationStateValue<boolean, boolean>;
  video: ReconciliationStateValue<boolean, boolean>;
}

export type State = Record<string, NodeState | MDCState | PJLinkState>;