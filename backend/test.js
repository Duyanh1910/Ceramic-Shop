const generateOrderCode = () => {
  const date = new Date();
  const dateStr = `${date.getFullYear().toString().slice(-2)}${(date.getMonth() + 1).toString().padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DH${dateStr}${randomStr}`;
};

for (let i = 0; i < 50; i++) {
  console.log(generateOrderCode());
}
