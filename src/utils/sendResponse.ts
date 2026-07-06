import { Response } from "express";
type TMeta = {
  page: Number;
  limit: Number;
  total: Number;
};
type TResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: any;
  meta?: TMeta;
};
const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    data: data?.data,
    meta: data.meta,
    error: data?.error,
  });
};
export default sendResponse;
