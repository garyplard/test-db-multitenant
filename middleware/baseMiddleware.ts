import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { prismaMiddleware, PrismaRequest } from "./prismaMiddleware";

export type Request = NextApiRequest & PrismaRequest;

export const baseMiddleware = () =>
  nextConnect<Request, NextApiResponse>().use(prismaMiddleware);
