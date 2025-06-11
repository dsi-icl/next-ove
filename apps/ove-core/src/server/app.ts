import express from "express";

export interface Request extends express.Request {
  username?: string;
  role?: string;
}

export const app = express();
