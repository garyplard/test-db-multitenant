import type { NextApiResponse } from "next";
import { baseMiddleware, Request } from "../../middleware/baseMiddleware";

export default baseMiddleware().get(
  async (req: Request, res: NextApiResponse) => {
    const [prisma, mongoose] = await Promise.all([
      req.prisma.course.findMany(),
      req.models.Course.find(),
    ]);
    res.status(200).json({ prisma, mongoose });
  }
);
