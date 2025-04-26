"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3002/mseal/auth-user/google/callback",
}, (accessToken, refreshToken, profile, done) => {
    // You can save or process the profile here if needed
    return done(null, profile);
}));
// Serialize user to session
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
// Deserialize user from session
passport_1.default.deserializeUser((user, done) => {
    done(null, user);
});
module.exports = passport_1.default;
//# sourceMappingURL=passport-config.js.map