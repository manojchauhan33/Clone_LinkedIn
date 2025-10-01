import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../modules/auth/user.model";

const JWT_SECRET = process.env.JWT_SECRET;

interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized. Token missing." });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET!);
    const user = await User.findOne({ where: { id: decoded.id } });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized. User not found." });
    }

    req.user = user;       // full user object
    (req as any).userId = user.id;  //  add this for controllers

    next();
  } catch (err: any) {
    return res.status(401).json({ error: "Unauthorized. Invalid token." });
  }
};
