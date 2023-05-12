import express from "express";
import logger from "morgan";
import { config } from "dotenv";
import passport from 'passport';
import errorHandler from "./middleware/errorHandler.js";
import { NotFoundError } from "./middleware/error.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectSqlite from "connect-sqlite3";
import authRouter from "./routes/auth.route.js";
import csrf from "csurf";


config();
const app = express();

const SQLiteStore = connectSqlite(session);

if (["development", "production"].includes(process.env.NODE_ENV)) {
    app.use(logger("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(errorHandler);
app.use(session({
  secret: 'the ultimate secret',
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
}));
app.use(csrf());
app.use(passport.authenticate('session'));

app.use(function(req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});


passport.initialize();

app.use('/auth', authRouter);

app.get("/", (_, res) => {
  res.status(200).json({
    status: "success",
    message: "This is the start of everything, it is not protected",
  });
});

app.all("*", (_, res) => {
  throw new NotFoundError('Resource not found on this server')
});


export default app;