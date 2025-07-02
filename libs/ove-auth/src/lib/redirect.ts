import type { Request } from "./utils";
import type { NextFunction, Response } from "express";

export const redirectMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
  authorize: (role: string, url: string) => boolean,
) => {
  if (req.role === undefined) {
    res.sendStatus(401);
    return;
  }

  const to = req.query?.["to"] as string | undefined;

  if (to === undefined) {
    res.sendStatus(400);
    return;
  }

  if (!authorize(req.role, to)) {
    res.sendStatus(403);
    return;
  }

  req.to = to;

  next();
};
