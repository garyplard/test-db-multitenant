import type { NextApiResponse } from "next";
import { baseMiddleware, Request } from "../../middleware/baseMiddleware";

export default baseMiddleware().get(
  async (req: Request, res: NextApiResponse) => {
    const tests = await req.prisma.test.findMany({ where: {} });
    res.status(200).json({ tenants: tests });
  }
);
