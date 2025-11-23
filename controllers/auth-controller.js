const bcrypt = require("bcrypt");
const Employee = require("../models/employee.js");
const activityLogger = require("../helpers/activityLogger.js");

console.log("[DB] using db:", require("mongoose").connection.name);
console.log(
  "[DB] employee collection name:",
  Employee.collection.collectionName,
);

const MAX_FAILED_ATTEMPTS = 5; // 5 tries
const FAILED_WINDOW_MINUTES = 15; // within 15 minutes
const LOCK_TIME_MINUTES = 15; // lock account for 15 minutes

function isAccountLocked(user) {
  if (!user.lockUntil) return false;
  return user.lockUntil > new Date();
}

async function recordFailedLogin(user, meta, reason) {
  // If user is unknown (null), just log and bail
  if (!user) {
    await activityLogger(meta.username || "unknown", "login_failed", {
      ...meta,
      reason,
    });
    return;
  }

  const now = new Date();
  let failedAttempts = user.failedLoginAttempts || 0;

  // Reset counter if last failure was outside the window
  if (
    user.lastFailedLoginAt &&
    now - user.lastFailedLoginAt > FAILED_WINDOW_MINUTES * 60 * 1000
  ) {
    failedAttempts = 1;
  } else {
    failedAttempts += 1;
  }

  const update = {
    failedLoginAttempts: failedAttempts,
    lastFailedLoginAt: now,
  };

  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    update.lockUntil = new Date(now.getTime() + LOCK_TIME_MINUTES * 60 * 1000);
  }

  await Employee.updateOne({ _id: user._id }, update);

  await activityLogger(user.username, "login_failed", {
    ...meta,
    reason,
    failedLoginAttempts: update.failedLoginAttempts,
    lockUntil: update.lockUntil,
  });
}

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
      ip: req.ip,
      ua: req.headers["user-agent"],
      username,
    };

    try {
      const user = await Employee.findOne({ username });

      // 1) Unknown username -> generic failure + log
      if (!user) {
        console.warn("[AUTH][FAIL] user not found", meta);
        await recordFailedLogin(null, meta, "user_not_found");
        return res
          .status(401)
          .render("login", { error: "Invalid credentials" });
      }

      // 2) Account temporarily locked?
      if (isAccountLocked(user)) {
        console.warn("[AUTH][FAIL] account locked", {
          ...meta,
          lockUntil: user.lockUntil,
        });

        await activityLogger(user.username, "login_failed_account_locked", {
          ...meta,
          lockUntil: user.lockUntil,
        });

        return res.status(429).render("login", {
          error:
            "Too many failed attempts. Your account is temporarily locked. Please try again later.",
        });
      }

      // 3) Password check
      const passwordMatches = await bcrypt.compare(
        password || "",
        user.password,
      );

      if (!passwordMatches) {
        console.warn("[AUTH][FAIL] bad password", meta);
        await recordFailedLogin(user, meta, "bad_password");

        return res
          .status(401)
          .render("login", { error: "Invalid credentials" });
      }

      // 4) Has no access (disabled account)
      if (!user.hasAccess) {
        console.warn("[AUTH][FAIL] no access", {
          ...meta,
          hasAccess: user.hasAccess,
        });

        await activityLogger(user.username, "login_failed_no_access", {
          ...meta,
          hasAccess: user.hasAccess,
        });

        return res.status(403).render("login", { error: "Account disabled" });
      }

      // 5) Successful login -> reset failed counters & lock
      if (
        user.failedLoginAttempts > 0 ||
        user.lastFailedLoginAt ||
        user.lockUntil
      ) {
        await Employee.updateOne(
          { _id: user._id },
          {
            failedLoginAttempts: 0,
            lastFailedLoginAt: null,
            lockUntil: null,
          },
        );
      }

      // Optional hardening: consider req.session.regenerate() here to prevent session fixation
      req.session.loggedIn = true;
      req.session.isAdmin = user.role === "admin";
      req.session.user = {
        _id: user._id,
        username: user.username,
        role: user.role,
        hasAccess: user.hasAccess,
      };

      console.info("[AUTH][OK] login", {
        ...meta,
        isAdmin: req.session.isAdmin,
      });

      await activityLogger(user.username, "login_success", {
        ...meta,
        isAdmin: req.session.isAdmin,
      });

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
      // fire-and-forget; activityLogger handles its own errors
      activityLogger(meta.username || "unknown", "logout", meta);

      return res.redirect("/login");
    });
  },
};

module.exports = controller;
