import passport from "passport";
import debug from "debug";
import passportLocal from "../services/passport/passport-google.js";
import { ApplicationError, NotFoundError } from "../middleware/error.js";

const DEBUG = debug("dev");

export default {
  socialAuth: async (req, res) => {
    try {
      const { authInfo, user } = req;
    } catch (err) {
      res.status(500).json({
        status: 'error',
        error: {
          message: err.message,
        },
      });
    }
  },


  protectedRoute: async (req, res) => {
    res.status(200).json({
      status: "success",
      data: {
        message: "Maybe maybe maybe",
      },
    });
  }, 
};