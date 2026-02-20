import { s3 } from "./s3";
import { prisma } from "./db";
import type { Request } from "./app";
import type { Response } from "express";
import { clickhouse } from "./clickhouse";
import type { NodeHTTPCreateContextFnOptions } from "@trpc/server/dist/adapters/node-http"; // eslint-disable-next-line @typescript-eslint/no-explicit-any

type ContextOptions = NodeHTTPCreateContextFnOptions<Request, Response>;

export const createContext = async ({ req, res }: ContextOptions) => {
  if (req.username === undefined) throw new Error("Unable to identify user");
  return <Context>{
    req,
    res,
    username: req.username,
    role: req.role,
    prisma,
    s3,
    clickhouse,
  };
};
export type Context = {
  req: Request;
  res: Response;
  username: string;
  prisma: typeof prisma;
  s3: typeof s3;
  clickhouse: typeof clickhouse
};
