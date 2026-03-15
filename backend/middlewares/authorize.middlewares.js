import ErrorHandler from "../utils/error_handler.js";
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler("401 Unauthorized", 401));
    }
    const { role } = req.user;
    if (!allowedRoles.includes(role)) {
      return next(new ErrorHandler("403 Forbidden", 401));
    }
    next();
  };
};

export default checkRole;
