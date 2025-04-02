const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db");
require("./config/redis/redisSubscriber");

dotenv.config({ path: "./config/config.env" });

connectDB();

const dentists = require("./routes/dentists");
const appointments = require("./routes/appointments");
const auth = require("./routes/auth");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/dentists", dentists);
app.use("/api/v1/appointments", appointments);
app.use("/api/v1/auth", auth);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    "Server running in ",
    process.env.NODE_ENV,
    " mode on port ",
    PORT
  )
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
