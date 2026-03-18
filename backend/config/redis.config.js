import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL;

const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error:", err);
});

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("✅ Đã kết nối tới Memurai thành công!");
    }
  } catch (err) {
    console.error("❌ Không thể kết nối Redis:", err);
  }
};

export default redisClient;
