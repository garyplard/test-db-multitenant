import { PrismaClient } from "@prisma/client";
import { NextApiRequest } from "next";
import { Middleware } from "next-connect";
import { NextRequest, NextResponse } from "next/server";

export interface PrismaRequest extends NextApiRequest {
  prisma: PrismaClient;
}

const tenantsClients: Record<string, PrismaClient> = {
  main: new PrismaClient({
    datasources: {
      db: { url: `${process.env.DATABASE_URL}/${process.env.MAIN_DB_NAME}` },
    },
  }),
};

export const prismaMiddleware: Middleware<PrismaRequest, NextResponse> = async (
  req,
  _res,
  next
) => {
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

  tenantsClients[host] = new PrismaClient({
    datasources: {
      db: { url: `${process.env.DATABASE_URL}/${tenant.dbName}` },
    },
  });
  tenantsClients[host].$use(async (params, next) => {
    params.args = {
      ...params.args,
      where: {
        AND: { ...params.args.where, access: { has: host } },
      },
    };
    return await next(params);
  });
  req.prisma = tenantsClients[host];
  next();
};
