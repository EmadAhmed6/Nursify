import type { Request, Response, NextFunction } from "express";
const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Cloudinary/Server Error:", err);

  const isDev = process.env.NODE_ENV !== "production";

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path || "ID format"}: ${err.value}`,
      ...(isDev && { stack: err.stack }),
    });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
      ...(isDev && { stack: err.stack }),
    });
  }

  const statusCode = res.statusCode === 200 ? (err.statusCode || 500) : res.statusCode;

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(isDev && { stack: err.stack }),
  });
};

const sendError = (res: Response, statusCode: number, errorMessage: string) => {
  const isDev = process.env.NODE_ENV !== "production";
  return res.status(statusCode).json({
    success: false,
    message: errorMessage,
    ...(isDev && { stack: new Error(errorMessage).stack }),
  });
};

const successMsg = (
  res: Response,
  statusCode: number,
  successMessage: string,
  data: any,
) => {
  return res.status(statusCode).json({
    success: true,
    message: successMessage,
    data: data,
  });
};

export { notFound, errorHandler, sendError, successMsg };
