const bcrypt = require("bcrypt");
const Employee = require("../models/employee.js");
const activityLogger = require("../helpers/activityLogger");

// TODO: after testing and debugging, REMOVE
// CSSECDV security risk for explicit logout logging

console.log("[DB] using db:", require("mongoose").connection.name);
console.log(
  "[DB] employee collection name:",
  Employee.collection.collectionName,
);

const controller = {
  /**
   * Authenticates the user
   * Sets session.loggedIn to true if successful
   * Sets session.isAdmin to true if the user is an admin
   * Redirects to event home page if successful
   * Otherwise redirects back to the login page
   * @name post/authenticate
   * @param {express.request} req request object, must have username and password in its body
   * @param {express.response} res response object
   */
  authenticate: async function (req, res) {
    const { username, password } = req.body || {};
    const meta = {
      at: new Date().toISOString(),
      // username: req.session?.user?.username,
      ip: req.ip,
      ua: req.headers["user-agent"],
      username,
    };

    try {
      const user = await Employee.findOne({ username });
      if (!user) {
        console.warn("[AUTH][FAIL] user not found", meta);
        // activityLogger('login_fail', meta);
        return res
          .status(401)
          .render("login", { error: "Invalid credentials" });
      }

      // const result = await bcrypt.compare(password || '', user.password);
      const result = user
        ? await bcrypt.compare(password, user.password)
        : false;

      if (!result) {
        console.warn("[AUTH][FAIL] bad password", meta);
        // activityLogger('login_fail', meta);
        return res
          .status(401)
          .render("login", { error: "Invalid credentials" });
      }

      if (!user.hasAccess) {
        console.warn("[AUTH][FAIL] no access", {
          ...meta,
          hasAccess: user.hasAccess,
        });
        // activityLogger('login_fail', { ...meta, reason: 'no_access' });
        return res.status(403).render("login", { error: "Account disabled" });
      }

      req.session.user = user;
      req.session.loggedIn = true;
      req.session.isAdmin = user.role === "admin";

      console.info("[AUTH][OK] login", {
        ...meta,
        isAdmin: req.session.isAdmin,
      });
      // activityLogger('login_success', { ...meta, isAdmin: req.session.isAdmin });
      return res.redirect("/event-tracker/home");
    } catch (err) {
      console.error("[AUTH][ERROR]", { ...meta, err: err.message });
      return res.status(500).render("login", { error: "Server error" });
    }
  },

  /**
   * Renders the appropriate login html file and
   * sends it to the user
   * @name get/login
   * @param {express.request} req  request object
   * @param {express.response} res response object
   */
  getLogin: function (req, res) {
    if (req.session.user) return res.redirect("/event-tracker/home");
    return res.render("login");
  },

  // getLogout: function (req, res) {
  //     req.session.destroy(function (err) {
  //         if (err) throw err;
  //         res.redirect('/');
  //     });
  // },
  // TODO: after testing and debugging, REMOVE
  // CSSECDV security risk for explicit logout logging
  getLogout: function (req, res) {
    const meta = {
      at: new Date().toISOString(),
      username: req.session?.user?.username,
      ip: req.ip,
    };
    req.session.destroy(function (err) {
      if (err) {
        console.error("[AUTH][LOGOUT][ERROR]", { ...meta, err: err.message });
        return res.status(500).redirect("/login");
      }
      console.info("[AUTH][LOGOUT][OK]", meta);
      return res.redirect("/login");
    });
  },
};

module.exports = controller;
