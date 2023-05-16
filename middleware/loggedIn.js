export default loggedIn => async (request, response, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect('/auth/login/federated/google');
  }
};