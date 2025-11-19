function ensureAuthenticated(req, res, next) {
  if (!req.session || !req.session.user) {
    // not logged in
    return res.redirect('/login');
  }
  next();
}

module.exports = { ensureAuthenticated };
