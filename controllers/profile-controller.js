const bcrypt = require("bcrypt");
const Employee = require("../models/employee.js");
const {
  sanitizeString,
  isValidName,
  isValidPhone,
} = require("../helpers/validation.js");
const { isValidPassword } = require("../helpers/newPasswordValidator.js");
const activityLogger = require("../helpers/activityLogger.js");

function buildEmployeeView(employee) {
  if (!employee) return null;

  return {
    username: employee.username,
    name: employee.name,
    role: employee.role,
    contactNum: employee.contactNum,
    emergencyContactName: employee.emergencyContactName,
    emergencyContactNum: employee.emergencyContactNum,
  };
}

const controller = {
  /**
   * GET /profile
   * Show current user's profile
   */
  getProfile: async function (req, res, next) {
    try {
      if (!req.session || !req.session.user) {
        return res.redirect("/login");
      }

      const username = req.session.user.username;
      const employee = await Employee.findOne({ username });

      if (!employee) {
        console.error("[PROFILE][GET] Employee not found:", username);
        return res.status(404).render("error", {
          message: "Profile not found",
        });
      }

      const viewModel = buildEmployeeView(employee);

      return res.render("profile", {
        employee: viewModel,
      });
    } catch (err) {
      console.error("[PROFILE][GET][ERROR]", err);
      return next(err);
    }
  },

  /**
   * POST /profile
   * Update own profile (contact info + optional password change)
   */
  updateProfile: async function (req, res, next) {
    try {
      if (!req.session || !req.session.user) {
        return res.redirect("/login");
      }

      const username = req.session.user.username;
      const employee = await Employee.findOne({ username });

      if (!employee) {
        console.error("[PROFILE][UPDATE] Employee not found:", username);
        return res.status(404).render("error", {
          message: "Could not update profile",
        });
      }

      const {
        name,
        contactNum,
        emergencyContactName,
        emergencyContactNum,
        oldPassword,
        newPassword,
        confirmPassword,
      } = req.body;

      const update = {};
      const viewModel = buildEmployeeView(employee);

      // --- Basic info validation/sanitization ---
      if (typeof name === "string" && name.trim() !== "") {
        const cleanName = sanitizeString(name);
        if (!isValidName(cleanName)) {
          return res.status(400).render("profile", {
            employee: viewModel,
            error: "Could not update profile",
          });
        }
        update.name = cleanName;
      }

      if (typeof contactNum === "string" && contactNum.trim() !== "") {
        const cleanContact = sanitizeString(contactNum);
        if (!isValidPhone(cleanContact)) {
          return res.status(400).render("profile", {
            employee: viewModel,
            error: "Could not update profile",
          });
        }
        update.contactNum = cleanContact;
      }

      if (
        typeof emergencyContactName === "string" &&
        emergencyContactName.trim() !== ""
      ) {
        update.emergencyContactName = sanitizeString(emergencyContactName);
      }

      if (
        typeof emergencyContactNum === "string" &&
        emergencyContactNum.trim() !== ""
      ) {
        const cleanEC = sanitizeString(emergencyContactNum);
        if (!isValidPhone(cleanEC)) {
          return res.status(400).render("profile", {
            employee: viewModel,
            error: "Could not update profile",
          });
        }
        update.emergencyContactNum = cleanEC;
      }

      // --- Password change (optional) ---
      const wantsPasswordChange =
        (oldPassword && oldPassword.trim() !== "") ||
        (newPassword && newPassword.trim() !== "") ||
        (confirmPassword && confirmPassword.trim() !== "");

      if (wantsPasswordChange) {
        if (
          !oldPassword ||
          !newPassword ||
          !confirmPassword ||
          newPassword.trim() === "" ||
          confirmPassword.trim() === ""
        ) {
          await activityLogger(
            username,
            "Failed profile update (missing password fields)",
          );
          return res.status(400).render("profile", {
            employee: viewModel,
            error: "Could not update profile",
          });
        }

        if (newPassword !== confirmPassword) {
          await activityLogger(
            username,
            "Failed profile update (password mismatch)",
          );
          return res.status(400).render("profile", {
            employee: viewModel,
            error: "Could not update profile",
          });
        }

        const isOldCorrect = await bcrypt.compare(
          oldPassword,
          employee.password,
        );
        if (!isOldCorrect) {
          await activityLogger(
            username,
            "Failed profile update (wrong old password)",
          );
          return res.status(400).render("profile", {
            employee: viewModel,
            error: "Could not update profile",
          });
        }

        const passwordResult = await isValidPassword(newPassword, username);
        //debug: need to support both boolean and { success, message }
        const isValid =
          typeof passwordResult === "boolean"
            ? passwordResult
            : passwordResult && passwordResult.success;

        if (!isValid) {
          await activityLogger(
            username,
            "Failed profile update (weak or reused password)",
          );

          const errorMessage =
            passwordResult &&
            typeof passwordResult === "object" &&
            passwordResult.message
              ? passwordResult.message
              : "Could not update profile";

          return res.status(400).render("profile", {
            employee: viewModel,
            error: errorMessage,
          });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        update.password = hash;
      }

      // --- Persist changes ---
      await Employee.updateOne({ username }, update);

      await activityLogger(
        username,
        wantsPasswordChange
          ? "Updated own profile (with password change)"
          : "Updated own profile",
      );

      return res.redirect("/profile");
    } catch (err) {
      console.error("[PROFILE][UPDATE][ERROR]", err);
      return next(err);
    }
  },
};

module.exports = controller;
