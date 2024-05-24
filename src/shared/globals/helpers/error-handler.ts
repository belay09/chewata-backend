import HTTP_STATUS from "http-status-codes";
import { Error } from "mongoose";

export interface IErrorResponse {
  status: number;
  message: string;
  statusCode: number;
  serializeError(): IError;
}

export interface IError {
    status: number;
    message: string;
    statusCode: number;
}
export abstract class CustomError extends Error {
  abstract status: number;
  abstract statusCode: number;
  constructor(message: string) {
    super(message);
  }
  serializeError(): IError {
    return {
      status: this.status,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}
export class BadRequestError extends CustomError {
  status = HTTP_STATUS.BAD_REQUEST;
  statusCode = HTTP_STATUS.BAD_REQUEST;
  constructor(message: string) {
    super(message);
  }
}
export class NotFoundError extends CustomError {
  status = HTTP_STATUS.NOT_FOUND;
  statusCode = HTTP_STATUS.NOT_FOUND;
  constructor(message: string) {
    super(message);
  }
}
export class InternalServerError extends CustomError {
  status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  constructor(message: string) {
    super(message);
  }
}
export class UnauthorizedError extends CustomError {
  status = HTTP_STATUS.UNAUTHORIZED;
  statusCode = HTTP_STATUS.UNAUTHORIZED;
  constructor(message: string) {
    super(message);
  }
}
export class FileTooLargeError extends CustomError {
  status = HTTP_STATUS.FORBIDDEN;
  statusCode = HTTP_STATUS.FORBIDDEN;
  constructor(message: string) {
    super(message);
  }
}
export class JoiRequestValidationError extends CustomError {
  status = HTTP_STATUS.BAD_REQUEST;
  statusCode = HTTP_STATUS.BAD_REQUEST;
  constructor(message: string) {
    super(message);
  }
}