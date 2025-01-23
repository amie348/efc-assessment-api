import axios from "axios";
import type { Request, Response, NextFunction } from "express";
import type { IUser } from "@customeTypes/user";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.log("Token not found");
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  try {
    const response = await axios.get(`${process.env.USER_SERVICE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user: IUser = response.data.data;

    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

export default authMiddleware;
