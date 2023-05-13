import passport from "passport";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import passportGoogle from "../services/passport/passport-google.js";
import catchAsync from "../middleware/catchAsync.js";
import authentication from '../middleware/authenticate.js';

const { protectedRoute, socialAuth } = authController;

const authRouter = Router()

authRouter.get('/login', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/../public/login.html'));
});

authRouter.get('/login/federated/google', passport.authenticate('google'));

authRouter.get('/oauth2/redirect/google', passport.authenticate('google', {
  successReturnToOrRedirect: '/app/home',
  failureRedirect: '/login'
}));

authRouter.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/app/home');
  });
});

export default authRouter;