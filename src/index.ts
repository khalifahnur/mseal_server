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
import session from "express-session";
import {RedisStore} from "connect-redis";
import { createClient } from "redis";

import { Server } from "socket.io";
import setupWebSocket from "./socket/orderConfirmPayment";
import setupMembershipWebSocket from "./socket/membershipConfirmPayment";
import setupWalletWebSocket from "./socket/walletConfirmPayment";
import setupTicketWebSocket from "./socket/ticketConfirmPayment";

const passport = require("passport");
const consumeOrderEmailQueue = require("./lib/queue/order_email/consumer");
const consumeTicketEmailQueue = require("./lib/queue/ticket/consumer");
const consumerSignInEmailQueue = require("./lib/queue/auth/signin/consumer");
const consumerSignUpEmailQueue = require("./lib/queue/auth/signup/consumer");
const consumerForgotEmailQueue = require("./lib/queue/auth/forgotPsswd/consumer");
const consmuerValidTicketEmailueue = require("./lib/queue/ticket/validTicketConsumer")

require("./lib/passport-config");

const userrouter = require("./router/user/userrouter");
const membershiprouter = require("./router/membership/membershiprouter");
const paymentrouter = require("./router/payment/paymentrouter");
const eventrouter = require("./router/event/eventrouter");
const ticketrouter = require("./router/ticket/ticketrouter");
const merchandiserouter = require("./router/merchandise/merchandise");
const adminrouter = require("./router/admin/adminrouter");
const staffrouter = require("./router/staff/staffrouter");
const transactionrouter = require("./router/transaction/transactionrouter");

dotenv.config();

const app = express();
const server = http.createServer(app);

app.set('trust proxy', true);

const port = process.env.PORT || 3002;
const MongodbConn = process.env.MONGODB_CONN || "";

const corsOptions = {
  origin: [
    "https://mseal-membership.vercel.app",
    "https://mseal-master.vercel.app",
    "http://localhost:3000",
    "http://localhost:5672",
  ], // local testing => "http://localhost:3001"
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"],
};

const io = new Server(server, {
  cors: {
    origin: ["https://mseal-membership.vercel.app", "http://localhost:3000",],
    methods: ["GET", "POST"],
    credentials:true,
  },
});

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan("combined"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: "5mb" }));
app.use(bodyParser.json({ limit: "1mb" }));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use((req, res, next) => {
  if (req.path.startsWith("/mseal/ticket/validate-ticket")) {
    return next();
  }
  return limiter(req, res, next);
});


mongoose
  .connect(MongodbConn, { maxPoolSize: 10 })
  .then(() => {
    console.log("MongoDB successfully connected");
  })
  .catch((error) => {
    console.log("MongoDB connection Error", error);
  });

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.connect();

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || "",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, 
    },
  })
);

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
app.use("/mseal/transaction", transactionrouter);

consumeOrderEmailQueue().catch(({ err }: any) => {
  console.error("Failed to start (order) email consumer:", err);
});
consumeTicketEmailQueue().catch(({ err }: any) => {
  console.error("Failed to start (ticket) email consumer:", err);
});
consumerSignInEmailQueue().catch(({ err }: any) => {
  console.error("Failed to start (signin) email consumer:", err);
});
consumerSignUpEmailQueue().catch(({ err }: any) => {
  console.error("Failed to start (signup) email consumer:", err);
});
consumerForgotEmailQueue().catch(({err}:any) => {
  console.error("Failed to start (forgot psswd)",err);
})
consmuerValidTicketEmailueue().catch(({err}:any)=>{
  console.log("Failed to start (valid_ticket)",err)
})
setupWebSocket(io)
setupMembershipWebSocket(io)
setupWalletWebSocket(io)
setupTicketWebSocket(io)

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
  }
);

server
  .listen(port, () => {
    console.log(`Listening on port ${port}`);
  })
  .on("error", (err) => {
    console.error("Server error:", err);
  });
