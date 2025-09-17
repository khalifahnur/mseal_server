"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = require("connect-redis");
const redis_1 = require("redis");
const socket_io_1 = require("socket.io");
const orderConfirmPayment_1 = __importDefault(require("./socket/orderConfirmPayment"));
const membershipConfirmPayment_1 = __importDefault(require("./socket/membershipConfirmPayment"));
const walletConfirmPayment_1 = __importDefault(require("./socket/walletConfirmPayment"));
const ticketConfirmPayment_1 = __importDefault(require("./socket/ticketConfirmPayment"));
const passport = require("passport");
const consumeOrderEmailQueue = require("./lib/queue/order_email/consumer");
const consumeTicketEmailQueue = require("./lib/queue/ticket/consumer");
const consumerSignInEmailQueue = require("./lib/queue/auth/signin/consumer");
const consumerSignUpEmailQueue = require("./lib/queue/auth/signup/consumer");
const consumerForgotEmailQueue = require("./lib/queue/auth/forgotPsswd/consumer");
const consmuerValidTicketEmailueue = require("./lib/queue/ticket/validTicketConsumer");
const consumerAdminSignInEmailQueue = require("./lib/queue/auth/verifyAdmin/consumer");
require("./lib/passport-config");
const startCronJob = require("./controller/ticket/tickets/updateStatus");
const userrouter = require("./router/user/userrouter");
const membershiprouter = require("./router/membership/membershiprouter");
const paymentrouter = require("./router/payment/paymentrouter");
const eventrouter = require("./router/event/eventrouter");
const ticketrouter = require("./router/ticket/ticketrouter");
const merchandiserouter = require("./router/merchandise/merchandise");
const adminrouter = require("./router/admin/adminrouter");
const staffrouter = require("./router/staff/staffrouter");
const transactionrouter = require("./router/transaction/transactionrouter");
const orderrouter = require("./router/order/orderrouter");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.set('trust proxy', 1);
app.disable('x-powered-by');
const port = process.env.PORT || 3002;
const MongodbConn = process.env.MONGODB_CONN || "";
const corsOptions = {
    origin: [
        "https://mseal-membership.vercel.app",
        "https://mseal-master.vercel.app",
        "http://localhost:3000"
    ], // local testing => "http://localhost:3001"
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
};
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ["https://mseal-membership.vercel.app", "http://localhost:3000",],
        methods: ["GET", "POST"],
        credentials: true,
    },
});
app.use((0, cors_1.default)(corsOptions));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("combined"));
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: true, limit: "5mb" }));
app.use(body_parser_1.default.json({ limit: "1mb" }));
const limiter = (0, express_rate_limit_1.default)({
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
mongoose_1.default
    .connect(MongodbConn, { maxPoolSize: 10 })
    .then(() => {
    startCronJob();
    console.log("MongoDB successfully connected");
})
    .catch((error) => {
    console.log("MongoDB connection Error", error);
});
const redisClient = (0, redis_1.createClient)({
    //url: process.env.REDIS_URL,
    url: 'redis://localhost:6379',
});
redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.connect();
app.use((0, express_session_1.default)({
    store: new connect_redis_1.RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || "",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
    },
}));
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
app.use("/mseal/order", orderrouter);
consumeOrderEmailQueue().catch(({ err }) => {
    console.error("Failed to start (order) email consumer:", err);
});
consumeTicketEmailQueue().catch(({ err }) => {
    console.error("Failed to start (ticket) email consumer:", err);
});
consumerSignInEmailQueue().catch(({ err }) => {
    console.error("Failed to start (signin) email consumer:", err);
});
consumerSignUpEmailQueue().catch(({ err }) => {
    console.error("Failed to start (signup) email consumer:", err);
});
consumerForgotEmailQueue().catch(({ err }) => {
    console.error("Failed to start (forgot psswd)", err);
});
consmuerValidTicketEmailueue().catch(({ err }) => {
    console.log("Failed to start (valid_ticket)", err);
});
consumerAdminSignInEmailQueue().catch(({ err }) => {
    console.log("Failed to start (admin_verification)", err);
});
(0, orderConfirmPayment_1.default)(io);
(0, membershipConfirmPayment_1.default)(io);
(0, walletConfirmPayment_1.default)(io);
(0, ticketConfirmPayment_1.default)(io);
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