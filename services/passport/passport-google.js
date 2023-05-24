import passport from "passport";
import GoogleStrategy from "passport-google-oidc";
import {db} from "../../db/db.js";
import { config } from "dotenv";
import debug from "debug";
import { userDBVerification } from "./passport-db-service.js";

config();

passport.use(
  "google",
  new GoogleStrategy({
  clientID: process.env['GOOGLE_CLIENT_ID'],
  clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  callbackURL: '/auth/oauth2/redirect/google',
  scope: [ 'profile' ]
}, userDBVerification));
  
// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

export default passport;