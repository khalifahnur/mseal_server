// import express from "express";
// import mongoose from "mongoose";
// import bodyParser from "body-parser";
// import dotenv from "dotenv";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import http from "http";

// const session = require('express-session');
// const passport = require('passport');

// require('./lib/passport-config');

// const userrouter = require("./router/user/userrouter");
// const membershiprouter = require("./router/membership/membershiprouter");
// const paymentrouter = require("./router/payment/paymentrouter");
// const eventrouter = require("./router/event/eventrouter");
// const ticketrouter = require("./router/ticket/ticketrouter");
// const merchandiserouter = require("./router/merchandise/merchandise");
// const adminrouter = require("./router/admin/adminrouter");
// const staffrouter = require("./router/staff/staffrouter");

// dotenv.config();

// const app = express();
// const server = http.createServer(app);

// const port = process.env.PORT || 3002;
// const MongodbConn = process.env.MONGODB_CONN || "";
// const sessionSecret = process.env.SESSION_SECRET || "";

// const corsOptions = {
//   origin: ["http://localhost:3000","http://localhost:3001"],
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   credentials: true,
//   allowedHeaders: ["Content-Type", "Authorization"],
//   exposedHeaders: ["Set-Cookie"],
// };

// app.use(cors(corsOptions));
// app.use(cookieParser());

// app.use(bodyParser.urlencoded({ extended: true, limit: "5mb" }));
// app.use(bodyParser.json({ limit: "1mb" }));


// mongoose
//   .connect(MongodbConn)
//   .then(() => {
//     // startCronJob();
//     console.log("MongoDB successfully connected");
//   })
//   .catch((error) => {
//     console.log("MongoDB connection Error", error);
//   });


// app.use(
//   session({
//     secret: sessionSecret,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: process.env.NODE_ENV === "production",
//       httpOnly: true,
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//     },
//   })
// );
// app.use(passport.initialize());
// app.use(passport.session());


// app.use("/mseal/auth-user", userrouter);
// app.use("/mseal/membership", membershiprouter);
// app.use("/mseal/payment", paymentrouter);
// app.use("/mseal/event", eventrouter);
// app.use("/mseal/ticket", ticketrouter);
// app.use("/mseal/merchandise", merchandiserouter);
// app.use("/mseal/auth-admin", adminrouter);
// app.use("/mseal/staff-auth", staffrouter);

// server
//   .listen(port, () => {
//     console.log(`Listening on port ${port}`);
//   })
//   .on("error", (err: Error) => {
//     console.error("Server error:", err);
//   });

import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

const passport = require('passport');

require('./lib/passport-config');

const userrouter = require("./router/user/userrouter");
const membershiprouter = require("./router/membership/membershiprouter");
const paymentrouter = require("./router/payment/paymentrouter");
const eventrouter = require("./router/event/eventrouter");
const ticketrouter = require("./router/ticket/ticketrouter");
const merchandiserouter = require("./router/merchandise/merchandise");
const adminrouter = require("./router/admin/adminrouter");
const staffrouter = require("./router/staff/staffrouter");

dotenv.config();

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 3002;
const MongodbConn = process.env.MONGODB_CONN || "";


const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"],
};

app.use(helmet());
app.use(morgan('combined'));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: "5mb" }));
app.use(bodyParser.json({ limit: "1mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

mongoose
  .connect(MongodbConn, { maxPoolSize: 10 })
  .then(() => {
    console.log("MongoDB successfully connected");
  })
  .catch((error) => {
    console.log("MongoDB connection Error", error);
  });


app.use(passport.initialize());
app.use(passport.session());


app.use("/mseal/auth-user", userrouter);
app.use("/mseal/membership", membershiprouter);
app.use("/mseal/payment", paymentrouter);
app.use("/mseal/event", eventrouter);
app.use("/mseal/ticket", ticketrouter);
app.use("/mseal/merchandise", merchandiserouter);
app.use("/mseal/auth-admin", adminrouter);
app.use("/mseal/staff-auth", staffrouter);


app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

server
  .listen(port, () => {
    console.log(`Listening on port ${port}`);
  })
  .on("error", (err) => {
    console.error("Server error:", err);
  });