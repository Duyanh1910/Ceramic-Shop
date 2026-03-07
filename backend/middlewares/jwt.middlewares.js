import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/error_handler.js";

const jwtMiddleware = (req, res, next) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return next(new ErrorHandler("401 Unauthorized", 401));
    }
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    return next(new ErrorHandler("401 Unauthorized", 401));
  }
};

export default jwtMiddleware;
