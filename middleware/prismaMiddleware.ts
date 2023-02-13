import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { Middleware } from "next-connect";

export interface PrismaRequest extends NextApiRequest {
  prisma: PrismaClient;
}

const tenantsClients: Record<string, PrismaClient> = {
  main: new PrismaClient(),
};

export const prismaMiddleware: Middleware<
  PrismaRequest,
  NextApiResponse
> = async (req, _res, next) => {
  const { host } = req.headers;
  if (!host) return next("Host not found");
  if (tenantsClients[host]) {
    req.prisma = tenantsClients[host];
    return next();
  }

  const { main } = tenantsClients;
  const tenant = await main.tenant.findFirst({
    where: { slug: host },
  });

  if (!tenant) {
    return next("Tenant not found");
  }

  tenantsClients[host] = new PrismaClient();
  tenantsClients[host].$use(async (params, next) => {
    params.args = {
      ...params.args,
      where: {
        AND: { ...params.args?.where, access: { has: tenant.id } },
      },
    };
    const result = await next(params);

    result.forEach((item: Record<string, unknown>) => {
      delete item.access;
    });

    return result;
  });
  req.prisma = tenantsClients[host];
  next();
};
