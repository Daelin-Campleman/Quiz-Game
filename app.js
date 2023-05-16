import express from "express";
import logger from "morgan";
import { config } from "dotenv";
import passport from 'passport';
import errorHandler from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectSqlite from "connect-sqlite3";
import authRouter from "./routes/auth.route.js";
import csrf from "csurf";
import path from "path";
import { fileURLToPath } from 'url';
import { ensureLoggedIn } from "connect-ensure-login";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use(express.static("public"));
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

app.use(function(req,res,next){
  console.log(req.user.name + " is currently logged in")
  next();
})

passport.initialize();

app.use('/auth', authRouter);
// app.use('/', defaultRouter);
app.use('/', ensureLoggedIn('/auth/login/federated/google'),express.static(__dirname + '/public'));

export default app;