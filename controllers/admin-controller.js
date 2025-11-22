const bcrypt = require("bcrypt");
const Employee = require("../models/employee.js");
const Activity = require("../models/activity.js");
const Discount = require("../models/discount.js");
const {
  sanitizeString,
  isValidUsername,
  isValidName,
  isValidPhone,
} = require("../helpers/validation.js");
const { isValidPassword } = require("../helpers/newPasswordValidator.js");
const activityLogger = require("../helpers/activityLogger.js");

const saltRounds = 10;
const ALLOWED_ROLES = ["admin", "manager", "frontdesk"];

const controller = {
  getAdminHome: async function (req, res, next) {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setHours(0, 0, 0, 0);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const employees = await Employee.aggregate([
      { $match: { role: "employee" } },
      {
        $lookup: {
          from: "activities",
          localField: "username",
          foreignField: "username",
          as: "activities",
        },
      },
    ]);
    const formattedEmployees = employees.map((employee) => ({
      ...employee,
      dateRegistered: employee.dateRegistered.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      activities: employee.activities.filter(
        (activity) =>
          new Date(activity.timestamp).setHours(0, 0, 0, 0) - sevenDaysAgo >= 0,
      ),
    }));

    const activities = await Activity.find({
      timestamp: { $gte: sevenDaysAgo },
    });
      const [employees, activities] = await Promise.all([
        Employee.find().sort({ dateRegistered: -1 }).lean(),
        Activity.find({ timestamp: { $gte: sevenDaysAgo } })
          .sort({ timestamp: -1 })
          .lean(),
      ]);

    const data = {
      employees: formattedEmployees,
      activities: activities,
      username: req.session.user.username,
      isAdmin: req.session.isAdmin,
    };
      const data = {
        username: req.session.user.username,
        employees,
        activities,
      };

      res.render("admin-home", data);
    } catch (err) {
      console.error("[ADMIN][HOME][ERROR]", err);
      return next(err);
    }
  },

  getRegisterEmployee: function (req, res) {
    res.render("admin-employee-form", { error: null });
  },

  /**
   * Registers an employee
   * Does not register an employee if the username provided is already in the database
   * responds with 406(Not Acceptable) status code
   * @name post/admin/register
   * @param {express.request} req request object, must have username and password in its body
   * @param {express.response} res response object
   */
  postRegisterEmployee: async function (req, res, next) {
    try {
      const {
        username,
        password,
        role,
        name,
        contactNum,
        emergencyContactName,
        emergencyContactNum,
      } = req.body;

    const hash = await bcrypt.hash(password, saltRounds);
    const isExistingEmployee = await Employee.findOne({ username });
      const cleanUsername = sanitizeString(username);
      const cleanName = sanitizeString(name || "");
      const cleanContact = sanitizeString(contactNum || "");
      const cleanECName = sanitizeString(emergencyContactName || "");
      const cleanECNum = sanitizeString(emergencyContactNum || "");

      if (!isValidUsername(cleanUsername) || !isValidName(cleanName)) {
        return res.status(400).render("admin-employee-form", {
          error: "Invalid input",
        });
      }

      if (cleanContact && !isValidPhone(cleanContact)) {
        return res.status(400).render("admin-employee-form", {
          error: "Invalid input",
        });
      }

      if (cleanECNum && !isValidPhone(cleanECNum)) {
        return res.status(400).render("admin-employee-form", {
          error: "Invalid input",
        });
      }

      const passwordOK = await isValidPassword(password, cleanUsername);
      if (!passwordOK) {
        return res.status(400).render("admin-employee-form", {
          error: "Invalid input",
        });
      }

      const existing = await Employee.findOne({ username: cleanUsername });
      if (existing) {
        console.warn(
          "[ADMIN][REGISTER] Account already exists:",
          cleanUsername,
        );
        const adminUser = req.session?.user?.username || "unknown";
        await activityLogger(adminUser, "Attempted to create existing account");
        return res.status(409).render("admin-employee-form", {
          error: "Account already exists",
        });
      }

      const selectedRole = ALLOWED_ROLES.includes(role) ? role : "frontdesk";
      const hash = await bcrypt.hash(password, saltRounds);

      const employee = await Employee.create({
        username: cleanUsername,
        password: hash,
        name: cleanName,
        contactNum: cleanContact,
        emergencyContactName: cleanECName,
        emergencyContactNum: cleanECNum,
        hasAccess: true,
        role: selectedRole,
        dateRegistered: new Date(),
      });

      const adminUsername = req.session?.user?.username || "unknown";
      await activityLogger(
        adminUsername,
        `Created user ${employee.username} with role ${employee.role}`,
      );

      return res.redirect("/admin");
    } catch (err) {
      console.error("[ADMIN][REGISTER][ERROR]", err);
      return next(err);
    }
  },

  /**
   * Returns all employees registered in the database
   * Only includes 'employee' role
   * @name get/admin/employee
   * @param {express.request} req
   * @param {express.response} res
   */
  getAllEmployees: async function (req, res) {
    const employees = await Employee.find({ role: "employee" });
    res.json(employees);
  },
  /**
   * Returns all employees registered in the database
   * Only includes 'employee' role
   * @name get/admin/employee
   * @param {express.request} req
   * @param {express.response} res
   */
  getAllEmployees: async function (req, res, next) {
    try {
      const employees = await Employee.find().lean();
      res.json(employees);
    } catch (err) {
      console.error("[ADMIN][EMPLOYEES][ERROR]", err);
      return next(err);
    }
  },

  /**
   * Returns all current employees registered in the database
   * Only includes 'employee' role
   * @name get/admin/employee/current
   * @param {express.request} req
   * @param {express.response} res
   */
  getAllCurrentEmployees: async function (req, res) {
    const employees = await Employee.find({
      role: "employee",
      hasAccess: true,
    });
    res.json(employees);
  },

  /**
   * Returns all former employees registered in the database
   * Only includes 'employee' role
   * @name get/admin/employee/former
   * @param {express.request} req
   * @param {express.response} res
   */
  getAllFormerEmployees: async function (req, res) {
    const employees = await Employee.find({
      role: "employee",
      hasAccess: false,
    });
    res.json(employees);
  },
  /**
   * Returns all former employees registered in the database
   * Only includes 'employee' role
   * @name get/admin/employee/former
   * @param {express.request} req
   * @param {express.response} res
   */
  getAllCurrentEmployees: async function (req, res, next) {
    try {
      const employees = await Employee.find({ hasAccess: true }).lean();
      res.json(employees);
    } catch (err) {
      console.error("[ADMIN][CURRENT][ERROR]", err);
      return next(err);
    }
  },

  getAllFormerEmployees: async function (req, res, next) {
    try {
      const employees = await Employee.find({ hasAccess: false }).lean();
      res.json(employees);
    } catch (err) {
      console.error("[ADMIN][FORMER][ERROR]", err);
      return next(err);
    }
  },

  /**
   * Returns the information of the employee
   * associated with the id in the url
   * @name get/admin/employee/:username
   * @param {express.request} req request object, must have id in its params
   * @param {express.response} res response object
   */
  getEmployee: async function (req, res) {
    const { username } = req.params;
    const employee = await Employee.findOne({ username });
    const status = employee ? 200 : 404;
    res.status(status).json(employee);
  },

  putEmployeeInfo: async function (req, res) {
    const { username } = req.params;
    const {
      contactNum,
      emergencyContactName,
      emergencyContactNum,
      newPassword,
      reenteredPassword,
    } = req.body;
  /**
   * Returns the information of the employee
   * associated with the id in the url
   * @name get/admin/employee/:username
   * @param {express.request} req request object, must have id in its params
   * @param {express.response} res response object
   */
  getEmployee: async function (req, res, next) {
    try {
      const { username } = req.params;
      const employee = await Employee.findOne({ username }).lean();
      const status = employee ? 200 : 404;
      res.status(status).json(employee);
    } catch (err) {
      console.error("[ADMIN][GET_EMPLOYEE][ERROR]", err);
      return next(err);
    }
  },

  /**
   * PUT /admin/employee/:username
   * Update employee contact + role + optional password
   * Body: { contactNum, emergencyContactName, emergencyContactNum, newPassword, reenteredPassword, role }
   */
  putEmployeeInfo: async function (req, res, next) {
    try {
      const { username } = req.params;
      const {
        contactNum,
        emergencyContactName,
        emergencyContactNum,
        newPassword,
        reenteredPassword,
        role,
      } = req.body;

    if (newPassword != "") {
      var isValidNewPassword = await isValidPassword(newPassword, username);

      if (!isValidNewPassword) {
        res.status(406).json({
          message: "New password is not valid",
        });
        return;
      }

      if (reenteredPassword != newPassword) {
        res.status(406).json({
          message: "New password and re-entered password do not match",
        });
        return;
      }

      var hash = await bcrypt.hash(newPassword, saltRounds);
    }

    const result = await Employee.findOneAndUpdate(
      { username },
      {
        contactNum,
        emergencyContactName,
        emergencyContactNum,
        password: hash,
      },
      { new: true },
    );
    res.json(result);
  },

  getEmployeeActivity: async function (req, res) {
    const { username } = req.params;
    const activity = await Activity.find({ username });
    res.json(activity);
  },

  getRecentActivity: async function (req, res) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0); //set to midnight
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const adminUsername = req.session?.user?.username || "unknown";

      const employee = await Employee.findOne({ username });
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const update = {};
      let roleChanged = false;
      let passwordChanged = false;

      if (typeof contactNum === "string" && contactNum.trim() !== "") {
        const cleanContact = sanitizeString(contactNum);
        if (!isValidPhone(cleanContact)) {
          return res.status(400).json({ message: "Invalid input" });
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
          return res.status(400).json({ message: "Invalid input" });
        }
        update.emergencyContactNum = cleanEC;
      }

      // role change
      if (typeof role === "string" && ALLOWED_ROLES.includes(role)) {
        if (employee.role !== role) {
          await ensureNotLastAdmin(employee, role, undefined);
          update.role = role;
          roleChanged = true;
        }
      }

      // password change
      const wantsPasswordChange =
        typeof newPassword === "string" && newPassword.trim() !== "";

      if (wantsPasswordChange) {
        if (!reenteredPassword || newPassword !== reenteredPassword) {
          return res.status(400).json({ message: "Invalid input" });
        }

        const passwordOK = await isValidPassword(newPassword, username);
        if (!passwordOK) {
          return res.status(400).json({ message: "Invalid input" });
        }

        const hash = await bcrypt.hash(newPassword, saltRounds);
        update.password = hash;
        passwordChanged = true;
      }

      await Employee.updateOne({ username }, update);

      let activityDesc = `Updated employee ${username}`;
      if (roleChanged) {
        activityDesc += ` (role: ${employee.role} -> ${update.role})`;
      }
      if (passwordChanged) {
        activityDesc += " (password changed)";
      }

      await activityLogger(adminUsername, activityDesc);

      return res.json({ success: true });
    } catch (err) {
      console.error("[ADMIN][PUT_EMPLOYEE][ERROR]", err);
      if (err.message === "Cannot modify last active admin") {
        return res.status(400).json({ message: "Could not update employee" });
      }
      return next(err);
    }
  },

  getEmployeeActivity: async function (req, res, next) {
    try {
      const { username } = req.params;
      const activities = await Activity.find({ username })
        .sort({ timestamp: -1 })
        .lean();
      res.json(activities);
    } catch (err) {
      console.error("[ADMIN][EMP_ACTIVITY][ERROR]", err);
      return next(err);
    }
  },

  getRecentActivity: async function (req, res, next) {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setHours(0, 0, 0, 0);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activity = await Activity.find({
      timestamp: { $gte: sevenDaysAgo },
    });
    res.json(activity);
  },

  putGiveEmployeeAccess: async function (req, res) {
    const username = req.body.username;
    console.log(username);
    const doc = await Employee.findOneAndUpdate(
      { username: username },
      { hasAccess: true },
      { returnDocument: "after" },
    );

    res.json(doc);
  },

  putRemoveEmployeeAccess: async function (req, res) {
    const username = req.body.username;
    console.log(username);
    const doc = await Employee.findOneAndUpdate(
      { username: username },
      { hasAccess: false },
      { returnDocument: "after" },
    );

    res.json(doc);
  },

  getDiscounts: async function (req, res) {
    const discounts = await Discount.find();
    res.json(discounts);
  },
      const activities = await Activity.find({
        timestamp: { $gte: sevenDaysAgo },
      })
        .sort({ timestamp: -1 })
        .lean();
      res.json(activities);
    } catch (err) {
      console.error("[ADMIN][RECENT_ACTIVITY][ERROR]", err);
      return next(err);
    }
  },

  putGiveEmployeeAccess: async function (req, res, next) {
    try {
      const { username } = req.body;
      const adminUsername = req.session?.user?.username || "unknown";

      const employee = await Employee.findOne({ username });
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      if (!employee.hasAccess) {
        employee.hasAccess = true;
        await employee.save();
        await activityLogger(
          adminUsername,
          `Enabled access for ${employee.username}`,
        );
      }

      return res.json({ success: true });
    } catch (err) {
      console.error("[ADMIN][GIVE_ACCESS][ERROR]", err);
      return next(err);
    }
  },

  putRemoveEmployeeAccess: async function (req, res, next) {
    try {
      const { username } = req.body;
      const adminUsername = req.session?.user?.username || "unknown";

      const employee = await Employee.findOne({ username });
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      await ensureNotLastAdmin(employee, undefined, false);

      if (employee.hasAccess) {
        employee.hasAccess = false;
        await employee.save();
        await activityLogger(
          adminUsername,
          `Disabled access for ${employee.username}`,
        );
      }

      return res.json({ success: true });
    } catch (err) {
      console.error("[ADMIN][REMOVE_ACCESS][ERROR]", err);
      if (err.message === "Cannot modify last active admin") {
        return res.status(400).json({ message: "Could not update employee" });
      }
      return next(err);
    }
  },

  getEventSettings: async function (req, res, next) {
    try {
      const discounts = await Discount.find().lean();
      const data = {
        discounts,
        username: req.session.user.username,
        isAdmin: req.session.user.role === "admin",
      };

      res.render("event-tracker-settings", data);
    } catch (err) {
      console.error("[ADMIN][EVENT_SETTINGS][ERROR]", err);
      return next(err);
    }
  },

  //might relocate to another controller later
  getDiscounts: async function (req, res) {
    const discounts = await Discount.find();
    res.json(discounts);
  },

  postRegisterDiscount: async function (req, res) {
    const { description, rate, minimumPax } = req.body;
    const result = await Discount.create({ description, rate, minimumPax });
    res.json(result);
  },
};

module.exports = controller;
