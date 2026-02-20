/**
 * This is the client-side entrypoint for your tRPC API.
 * It's used to create the `api` object which contains the Next.js App-wrapper
 * as well as your typesafe react-query hooks.
 *
 * We also create a few inference helpers for input and output types
 */
import { createTRPCReact } from "@trpc/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";

import { env } from "../env";
import { useStore } from "../store";
import type { User } from ".prisma/client";
// IGNORE PATH - dependency removed at runtime
// eslint-disable-next-line @nx/enforce-module-boundaries
import type { AppRouter } from "../../../ove-core/src/server/router";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

/**
 * A set of typesafe react-query hooks for your tRPC API
 */
export const api = createTRPCReact<AppRouter>();

type MutationOptions<T> = {
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
};

export interface KnipLocation {
  name: string;
  line?: number;
  col?: number;
  pos?: number;
}

export interface KnipIssueFile {
  file: string;
  dependencies: KnipLocation[];
  devDependencies: KnipLocation[];
  optionalPeerDependencies: KnipLocation[];
  unlisted: KnipLocation[];
  binaries: KnipLocation[];
  unresolved: KnipLocation[];
  exports: KnipLocation[];
  types: KnipLocation[];
  enumMembers: Record<string, unknown>;
  duplicates: KnipLocation[];
  catalog: KnipLocation[];
}

export interface KnipReport {
  files: string[];
  issues: KnipIssueFile[];
}

export interface PnpmAuditFinding {
  version: string;
  paths: string[];
}

export interface PnpmAdvisory {
  id: number;
  overview: string;
  title: string;
  module_name: string;
  severity: "info" | "low" | "moderate" | "high" | "critical";
  vulnerable_versions: string;
  patched_versions?: string;
  recommendation?: string;
  url: string;
  findings: PnpmAuditFinding[];
}

export interface PnpmAuditAction {
  action: string;
  module: string;
  target: string;
  depth: number;
}

export interface PnpmAuditReport {
  actions: PnpmAuditAction[];
  advisories: Record<string, PnpmAdvisory>;
  metadata: {
    vulnerabilities: Record<string, number>;
  };
}

export interface PnpmNode {
  from?: string;
  version?: string;
  resolved?: string;
  path?: string;
  dependencies?: Record<string, PnpmNode>;
}

export interface PnpmProject {
  name: string;
  version?: string;
  path: string;
  private?: boolean;
  dependencies?: Record<string, PnpmNode>;
}

export const docs = {
  getBrowserUsage: {
    useQuery: (options?: { enabled: boolean }) =>
      useQuery({
        ...(options ?? {}),
        queryKey: ["getBrowserUsage"],
        queryFn: async ({ signal }) => {
          const res = await fetch(
            `${env.CORE_URL}/docs/compatibility/css/browser-usage.json`,
            { signal },
          );
          return (await res.json()) as Record<string, string>;
        },
      }),
  },
  getPackageAudit: {
    useQuery: (options?: { enabled: boolean }) =>
      useQuery({
        ...(options ?? {}),
        queryKey: ["getPackageAudit"],
        queryFn: async ({ signal }) => {
          const res = await fetch(`${env.CORE_URL}/docs/packages/audit.json`, {
            signal,
          });
          return (await res.json()) as PnpmAuditReport;
        },
      }),
  },
  getPackageDeprecation: {
    useQuery: (options?: { enabled: boolean }) =>
      useQuery({
        ...(options ?? {}),
        queryKey: ["getPackageDeprecation"],
        queryFn: async ({ signal }) => {
          const res = await fetch(`${env.CORE_URL}/docs/packages/deprecated.txt`, {
            signal,
          });
          return (await res.text()) as string;
        },
      }),
  },
  getPackageDirectory: {
    useQuery: (options?: { enabled: boolean }) =>
      useQuery({
        ...(options ?? {}),
        queryKey: ["getPackageDirectory"],
        queryFn: async ({ signal }) => {
          const res = await fetch(`${env.CORE_URL}/docs/packages/packages.json`, {
            signal,
          });
          return (await res.json()) as PnpmProject[];
        }
      })
  },
  getPackageUpdates: {
    useQuery: (options?: { enabled: boolean }) =>
      useQuery({
        ...(options ?? {}),
        queryKey: ["getPackageUpdates"],
        queryFn: async ({ signal }) => {
          const res = await fetch(`${env.CORE_URL}/docs/packages/updates.txt`, {
            signal,
          });
          return (await res.text()) as string;
        },
      })
  },
  getUnusedPackages: {
    useQuery: (options?: { enabled: boolean }) =>
      useQuery({
        ...(options ?? {}),
        queryKey: ["getUnusedPackages"],
        queryFn: async ({ signal }) => {
          const res = await fetch(`${env.CORE_URL}/docs/packages/unused.json`, {
            signal,
          });
          return (await res.json()) as KnipReport;
        },
      })
  }
};

export const s3 = {
  getFileData: {
    useQuery: (
      args: { url: string },
      options?: {
        enabled: boolean;
      },
    ) =>
      useQuery({
        ...(options ?? {}),
        queryKey: ["getFileData", args.url],
        queryFn: async ({ queryKey, signal }) => {
          const res = await fetch(queryKey[1], { signal });
          return await res.text();
        },
      }),
  },
  uploadFile: {
    useMutation: (options?: MutationOptions<void>) =>
      useMutation({
        ...(options ?? { enabled: true }),
        mutationFn: async ({
          payload,
          url,
        }: {
          url: string;
          payload: File;
        }) => {
          await fetch(url, {
            method: "PUT",
            body: payload,
          });
        },
      }),
  },
};

export const auth = {
  refresh: {
    useQuery: () =>
      useQuery({
        queryKey: ["refresh"],
        retry: false,
        queryFn: async ({ signal }) => {
          const user = (await (
            await fetch(`${env.CORE_URL}/api/refresh`, {
              credentials: "include",
              signal,
            })
          ).json()) as Omit<User, "password">;
          useStore.getState().setUser(user);
          return user;
        },
      }),
  },
  login: {
    useMutation: (options?: { onSuccess?: () => void; onError?: () => void }) =>
      useMutation({
        ...(options ?? {}),
        mutationKey: ["login"],
        mutationFn: async ({
          username,
          password,
        }: {
          username: string | null;
          password: string | null;
        }) => {
          const headers =
            username === null || password === null
              ? undefined
              : {
                  Authorization: `Basic ${encodeURIComponent(btoa(`${username}:${password}`))}`,
                };
          const user = (await (
            await fetch(`${env.CORE_URL}/api/login`, {
              method: "POST",
              headers,
              credentials: "include",
            })
          ).json()) as Omit<User, "password">;
          useStore.getState().setUser(user);
        },
      }),
  },
  logout: {
    useMutation: (options?: Parameters<typeof useMutation>[0]) =>
      useMutation({
        ...(options ?? {}),
        mutationKey: ["logout"],
        mutationFn: async ({}: {}) => {
          await fetch(`${env.CORE_URL}/api/logout`, {
            method: "POST",
            credentials: "include",
          });
        },
      }),
  },
  generateOTP: {
    useQuery: (_args: {}, options?: { enabled: boolean }) =>
      useQuery({
        ...(options ?? {}),
        queryKey: ["generateOTP"],
        queryFn: async () => {
          return (await (
            await fetch(`${env.CORE_URL}/api/otp`, {
              credentials: "include",
            })
          ).text()) as string;
        },
      }),
  },
};

/**
 * Inference helper for inputs
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;
/**
 * Inference helper for outputs
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;
