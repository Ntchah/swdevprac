// utils/redis.js
const redis = require("redis");

const client = redis.createClient({
  socket: {
    host: "localhost",
    port: 6380,
  },
  database: 0,
});

const connectRedis = async () => {
  client.on("error", (err) => {
    console.error("Redis Client Error:", err);
  });

  try {
    await client.connect();
    console.log(`Redis connected on PORT ${client.options.socket.port}`);
  } catch (err) {
    console.error("Error connecting to Redis:", err);
  }
};

module.exports = { connectRedis, client };
