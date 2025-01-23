import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { getSpecificUser } from "@services/user.service";

// Define the type for the decoded JWT
interface DecodedToken {
  id: string;
}

const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
        return;
      }

      // Decode the token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as DecodedToken;
      const user = await getSpecificUser({ _id: decoded.id });
      if (!user) {
        res.status(401).json({ message: "Not authorized, user not found" });
        return;
      }
      req.user = { _id: user._id, email: user.email, username: user.username };

      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
      return;
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
    return;
  }
};

export default protect;
