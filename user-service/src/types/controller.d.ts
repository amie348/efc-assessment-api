import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./request";

export type ApiGenericResponse<T> = {
  message: string;
  data?: T;
};
