const redis = require("redis");

const client = redis.createClient({
     host: "localhost",
     port: 6380, 
     db: 0, 
   });

client.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

client.connect().then(() => {
     console.log(`Redis connected on PORT ${client.options.port}`);
   }).catch((err) => {
     console.error("Error connecting to Redis:", err);
   });
   

module.exports = { client };
