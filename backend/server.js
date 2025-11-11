// server.js

import "dotenv/config"; // ✅ Load .env automatically at the top
import express, { json, static as expressStatic } from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

import User from "./models/User.js";
import authRoutes from "./routes/auth.js";
import portfolioRoutes from "./routes/portfolio.js";
import serviceRoutes from "./routes/service.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// =======================
// 🚀 INITIAL SETUP
// =======================
const app = express();

// ✅ CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Body parser
app.use(json({ limit: "10mb" }));

// ✅ Static uploads folder
app.use("/uploads", expressStatic(join(__dirname, "uploads")));

// ✅ Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      // secure: true, // uncomment for HTTPS in production
      // sameSite: "none",
    },
  })
);

// =======================
// 🧭 PASSPORT CONFIG
// =======================
app.use(passport.initialize());
app.use(passport.session());

// Serialize / Deserialize
passport.serializeUser((user, done) => done(null, user._id ?? user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).lean();
    done(null, user || null);
  } catch (err) {
    done(err, null);
  }
});

// =======================
// 🌐 GOOGLE STRATEGY
// =======================
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const firstName = profile.name?.givenName;
        const lastName = profile.name?.familyName;
        const avatarUrl = profile.photos?.[0]?.value;

        // Find or create user
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
          if (!user.googleId) {
            user.googleId = googleId;
            user.avatarUrl = user.avatarUrl || avatarUrl;
            await user.save();
          }
          return done(null, user);
        }

        const newUser = await User.create({
          firstName,
          lastName,
          email,
          googleId,
          avatarUrl,
          role: "freelancer",
        });

        return done(null, newUser);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// =======================
// 🌐 GOOGLE ROUTES
// =======================
app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login",
    session: true,
  }),
  async (req, res) => {
    try {
      const user = await User.findOne({ email: req.user.email });
      const encodedEmail = encodeURIComponent(user.email);

      if (!user.details1 || !(user.details1.expertise?.length > 0)) {
        return res.redirect(`http://localhost:5173/details1?email=${encodedEmail}`);
      }

      if (!user.details2 || !user.details2.professionalTitle) {
        return res.redirect(`http://localhost:5173/buildprofile?email=${encodedEmail}`);
      }

      res.redirect(`http://localhost:5173/dashboard?email=${encodedEmail}`);
    } catch (err) {
      console.error("Google callback redirect error:", err);
      res.redirect("http://localhost:5173/login");
    }
  }
);

// =======================
// 📦 NORMAL ROUTES
// =======================
app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/service", serviceRoutes);


// =======================
// 🧠 ENV VALIDATION
// =======================
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env!");
}
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("⚠️  Google OAuth ENV missing. Check .env file!");
}

// =======================
// 🧩 DATABASE + SERVER START
// =======================
// const PORT = process.env.PORT || 5000;

// // ✅ Show URI for debugging (safe)
// console.log("🔗 Connecting to MongoDB...");

// mongoose
//   .connect(process.env.MONGO_URI.trim()) // .trim() removes hidden spaces/BOM
//   .then(() => {
//     console.log("✅ MongoDB connected successfully");
//     app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
//   })
//   .catch((err) => console.error("❌ MongoDB connection failed:", err.message));

// =======================
// 🧩 DATABASE + SERVER START
// =======================
const PORT = process.env.PORT || 5000;
const rawMongoUri = process.env.MONGO_URI;

// 👀 Debug log to confirm actual value
console.log("🔗 Connecting to MongoDB...");
console.log("MONGO_URI (raw):", JSON.stringify(rawMongoUri));

if (!rawMongoUri) {
  console.error("❌ No MONGO_URI found in .env file!");
  process.exit(1);
}

console.log("vicky new branch")

mongoose
  .connect(rawMongoUri.trim()) // ✅ .trim() removes hidden spaces or newlines
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });
