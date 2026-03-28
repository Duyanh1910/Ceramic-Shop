import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/error_handler.js";

const jwtMiddleware = (req, res, next) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    let token;
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } 
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new ErrorHandler("Vui lòng đăng nhập để tiếp tục!", 401));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Middleware Error: ", err.message);
    return next(new ErrorHandler("Phiên đăng nhập không hợp lệ hoặc đã hết hạn!", 401));
  }
};

export default jwtMiddleware;