import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "https://msealserver-production.up.railway.app/mseal/auth-user/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // You can save or process the profile here if needed
      return done(null, profile);
    }
  )
);

// Serialize user to session
passport.serializeUser((user: any, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user: any, done) => {
  done(null, user);
});

module.exports = passport;