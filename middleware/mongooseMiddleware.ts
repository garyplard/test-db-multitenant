import { NextApiRequest, NextApiResponse } from "next";
import { Middleware } from "next-connect";
import {
  connect,
  Connection,
  connection,
  ConnectionStates,
  models,
  createConnection,
} from "mongoose";
import { Tenant } from "@/models/tenant";
import { generateModelsForConnection } from "../models/index";

export interface MongooseRequest extends NextApiRequest {
  models: typeof models;
}

const tenantsConnections: Record<string, Connection> = {};

export const mongooseMiddleware: Middleware<
  MongooseRequest,
  NextApiResponse
> = async (req, _res, next) => {
  const { host } = req.headers;
  if (!host) return next("Host not found");
  if (tenantsConnections[host]) {
    req.models = tenantsConnections[host].models;
    return next();
  }

  if (!process.env.DATABASE_URL) {
    return next("Missing env variables");
  }

  if (connection.readyState != ConnectionStates.connected) {
    connect(process.env.DATABASE_URL);
  }

  const tenant = await Tenant.findOne({
    slug: req.headers.host,
  });

  if (!tenant) {
    return next("Tenant not found");
  }

  tenantsConnections[host] = createConnection(process.env.DATABASE_URL);

  generateModelsForConnection(tenantsConnections[host], tenant._id);
  req.models = tenantsConnections[host].models;

  next();
};
