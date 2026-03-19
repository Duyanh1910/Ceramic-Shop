import ErrorHandler from "../utils/error_handler.js";

const errorMiddleware = (err, req, res, next) => {
  let error = err;
  if (!(err instanceof ErrorHandler)) {
    error = new ErrorHandler(err.message || "INTERNAL SERVER ERROR", 500);
  }
  console.log(err);
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    ...error.data,
  });
};

export default errorMiddleware;
