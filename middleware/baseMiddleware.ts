import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { prismaMiddleware, PrismaRequest } from "./prismaMiddleware";
import { mongooseMiddleware, MongooseRequest } from "./mongooseMiddleware";

export type Request = NextApiRequest & PrismaRequest & MongooseRequest;

export const baseMiddleware = () =>
  nextConnect<Request, NextApiResponse>()
    .use(prismaMiddleware)
    .use(mongooseMiddleware);
