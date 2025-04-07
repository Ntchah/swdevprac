const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db");
require("./config/redis/redisSubscriber");
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');

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

//security------

app.use(cors());
app.use(helmet());
app.use(xss());

const { sanitize } = require('express-mongo-sanitize');

app.use((req, res, next) => {
  if (req.body) req.body = sanitize(req.body);
  if (req.params) req.params = sanitize(req.params);
  if (req.query) {
    const sanitizedQuery = sanitize(req.query);
    Object.keys(sanitizedQuery).forEach((key) => {
      req.query[key] = sanitizedQuery[key];
    });
  }
  next();
});


const limiter = rateLimit({
  windowsMs: 10 * 60 * 1000,
  max: 100
});

app.use(limiter);

// swagger-------

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Library API',
      version: '1.0.0',
      description: 'Dentist Booking App API'
    },
    servers:
      [
        {
          url:`http://localhost:${process.env.PORT}/api/v1`
        }
      ],
  },
  apis: ['./routes/*.js'],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//------------

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
