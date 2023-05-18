import passport from "passport";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { Router } from "express";
import passportGoogle from "../services/passport/passport-google.js";

const authRouter = Router()

authRouter.get('/login', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/../public/login.html'));
});

authRouter.get('/images/logo.svg', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/../public/images/logo.svg'));
});

authRouter.get('/css/style.css', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/../public/css/style.css'));
});

authRouter.get('/login/federated/google', passport.authenticate('google'));

authRouter.get('/oauth2/redirect/google', passport.authenticate('google', {
  successReturnToOrRedirect: '/home',
  failureRedirect: '/auth/login'
}));

authRouter.get('/user', function(req, res, next) {
  if (req.user) {
    res.status(200).json({
      status: "success",
      user: req.user,
    });
  } else {
    res.status(401).json({
      status: "unauthorized",
      message: "You are not logged in."
    });
  }
});

authRouter.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

export default authRouter;