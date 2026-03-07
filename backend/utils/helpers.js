export const isStringEmpty = (val) => {
  return typeof val !== "string" || val.trim().length == 0;
};
export const checkValidate = (...strings) => {
  return strings.every((str) => !isStringEmpty(str));
};
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
export const isValidPhoneNumber = (phone) => {
  const regex = /^0\d{9}$/;
  return regex.test(phone);
};
