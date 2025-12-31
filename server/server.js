import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cookieSession from "cookie-session";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// 1. CORS 설정 (Vite 기본 포트 5173 허용)
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

// 2. 쿠키 세션 설정
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.COOKIE_KEY || "secret_key"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

// 3. [중요] Passport 0.6+ 호환성 패치 미들웨어
// cookie-session에 없는 regenerate/save 메소드를 강제로 주입하여 오류 방지
app.use(function (request, response, next) {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb) => {
      cb();
    };
  }
  if (request.session && !request.session.save) {
    request.session.save = (cb) => {
      cb();
    };
  }
  next();
});

// 4. Passport 초기화
app.use(passport.initialize());
app.use(passport.session());

// --- Mock Database & Passport Config ---
const users = [];

const verifyUser = async (googleId) => {
  return users.find((user) => user.googleId === googleId);
};

const insertUser = async (profile) => {
  const newUser = {
    googleId: profile.id,
    displayName: profile.displayName,
    email: profile.emails?.[0]?.value,
    provider: "google",
  };
  users.push(newUser);
  return newUser;
};

passport.serializeUser((user, done) => {
  done(null, user.googleId);
});

passport.deserializeUser(async (googleId, done) => {
  const user = await verifyUser(googleId);
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const exUser = await verifyUser(profile.id);
        if (exUser) {
          return done(null, exUser);
        } else {
          const newUser = await insertUser(profile);
          return done(null, newUser);
        }
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// --- Routes ---
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:5173", // React App URL
    failureRedirect: "/login/failed",
  })
);

app.get("/auth/user", (req, res) => {
  if (req.user) {
    res.status(200).json({ success: true, user: req.user });
  } else {
    res.status(401).json({ success: false, message: "Not logged in" });
  }
});

app.get("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("http://localhost:5173");
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

