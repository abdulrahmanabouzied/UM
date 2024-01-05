import compression from "compression";
import express from "express";
import helmet from "helmet";
import path from "path";
import url from "url";
import cors from "cors";
import { config } from "dotenv";
// import cookieParser from "cookie-parser";
import dbConnection from "./database.js";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import handleScoket from "../utils/socketHandler.js";
import api from "./../routes/index.routes.js";
// import googlePassportStrategy from "./googlePassportStrategy.js";
// const passport = require('passport');
import passport from "passport";
import googlePassportStrategy from "./googlePassportStrategy.js";
import session from "express-session";
import cookieParser from "cookie-parser";
// import rateLimit from "express-rate-limit";

// import sessionAuth from "../middlewares/session.auth.js";

// vars
const app = express();
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
const chat = io.of("/socket");

// methods
config();
await dbConnection();
handleScoket(chat);
// googlePassportStrategy(passport);
// facebookPassportStrategy(passport);
// middlewares
app.use(express.json({ limit: "50kb" }));
app.use("/files", express.static("src/public"));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
// app.use(sessionAuth);
// app.use(cookieParser(process.env.SESSION_SECRET));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

googlePassportStrategy(passport);
app.use(helmet());
app.use(morgan("dev"));
app.use(
  compression({
    level: 6,
    threshold: 100 * 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
  })
);
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
/*
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    message: "Rate limit exceeded",
  })
);*/
app.use(api);

// exports
export default server;
