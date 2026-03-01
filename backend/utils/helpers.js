export const isStringEmpty = (val) => {
  return typeof val !== "string" || val.trim().length == 0;
};
export const checkValidate = (...strings) => {
  return strings.every((str) => !isStringEmpty(str));
};
