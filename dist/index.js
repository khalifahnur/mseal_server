"use strict";
// import express from "express";
// import mongoose from "mongoose";
// import bodyParser from "body-parser";
// import dotenv from "dotenv";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import http from "http";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = __importDefault(require("http"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const morgan_1 = __importDefault(require("morgan"));
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
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const port = process.env.PORT || 3002;
const MongodbConn = process.env.MONGODB_CONN || "";
const corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
};
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use((0, cors_1.default)(corsOptions));
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: true, limit: "5mb" }));
app.use(body_parser_1.default.json({ limit: "1mb" }));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
mongoose_1.default
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
app.use((err, req, res, next) => {
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
//# sourceMappingURL=index.js.map