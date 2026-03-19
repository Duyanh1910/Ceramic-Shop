export const isStringEmpty = (val) => {
  return typeof val !== "string" || val.trim().length == 0;
};
export const checkValidate = (...strings) => {
  return strings.every((str) => !isStringEmpty(str));
};
export const isValidEmail = (email) => {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
export const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  const regex = /^0\d{9}$/;
  return regex.test(String(phone));
};

export const isValidDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};