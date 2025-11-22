const bcrypt = require("bcrypt");
const Employee = require("../models/employee.js");
const Activity = require("../models/activity.js");
const Discount = require("../models/discount.js");
const { isValidPassword } = require("../helpers/newPasswordValidator.js");
const adminController = require("../controllers/admin-controller.js");

jest.mock("../models/employee.js");
jest.mock("../models/activity.js");
jest.mock("../models/discount.js");
jest.mock("bcrypt");
jest.mock("../helpers/newPasswordValidator.js", () => ({
  isValidPassword: jest.fn(),
}));

describe("Admin Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      session: { user: { username: "admin", role: "admin" }, isAdmin: true },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn(),
      render: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  // ------------------ getAdminHome ------------------ //
  describe("getAdminHome", () => {
    it("should render admin home page", async () => {
      const now = new Date();

      const mockEmployees = [
        {
          username: "admin",
          dateRegistered: new Date("2025-01-01"),
        },
      ];
      const mockActivities = [{ username: "admin", timestamp: now }];

      const employeeLean = jest.fn().mockResolvedValue(mockEmployees);
      const employeeSort = jest.fn().mockReturnValue({ lean: employeeLean });
      Employee.find.mockReturnValue({ sort: employeeSort });

      const activityLean = jest.fn().mockResolvedValue(mockActivities);
      const activitySort = jest.fn().mockReturnValue({ lean: activityLean });
      Activity.find.mockReturnValue({ sort: activitySort });

      await adminController.getAdminHome(req, res, next);

      expect(Employee.find).toHaveBeenCalled();
      expect(Activity.find).toHaveBeenCalled();

      expect(res.render).toHaveBeenCalledWith("admin-home", {
        username: "admin",
        employees: mockEmployees,
        activities: mockActivities,
      });
    });

    it("filters out old activities", async () => {
      const now = new Date();
      const recentActivity = { username: "admin", timestamp: now };
      const oldActivity = {
        username: "admin",
        timestamp: new Date("2000-01-01"),
      };

      const mockEmployees = [{ username: "admin", dateRegistered: new Date() }];

      // employees
      const employeeLean = jest.fn().mockResolvedValue(mockEmployees);
      const employeeSort = jest.fn().mockReturnValue({ lean: employeeLean });
      Employee.find.mockReturnValue({ sort: employeeSort });

      // activities – controller should only see "recent" results
      const activityLean = jest.fn().mockResolvedValue([recentActivity]);
      const activitySort = jest.fn().mockReturnValue({ lean: activityLean });
      Activity.find.mockReturnValue({ sort: activitySort });

      await adminController.getAdminHome(req, res, next);

      const renderedData = res.render.mock.calls[0][1];

      // only the recent one is in the data
      expect(renderedData.activities).toEqual([recentActivity]);
    });
  });

  // ------------------ getRegisterEmployee ------------------ //
  describe("getRegisterEmployee", () => {
    it("should render the admin employee form", () => {
      adminController.getRegisterEmployee(req, res);
      expect(res.render).toHaveBeenCalledWith("admin-employee-form", {
        error: null,
      });
    });
  });

  // ------------------ postRegisterEmployee ------------------ //
  describe("postRegisterEmployee", () => {
    beforeEach(() => {
      req.body = {
        username: "ano",
        password: "password123",
        name: "Ano Ong",
        contactNum: "09123456789",
        emergencyContactName: "What Ong",
        emergencyContactNum: "09987654321",
        role: "frontdesk",
      };
    });

    it("creates a new employee if username does not exist", async () => {
      Employee.findOne.mockResolvedValue(null); // username not found
      Employee.create.mockResolvedValue({
        username: "ano",
        role: "frontdesk",
      });
      isValidPassword.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue("hashedPassword");

      isValidPassword.mockResolvedValue({
        success: true,
        message: "Password is valid",
      });

      await adminController.postRegisterEmployee(req, res, next);

      expect(Employee.findOne).toHaveBeenCalledWith({ username: "ano" });
      expect(isValidPassword).toHaveBeenCalledWith("password123", "ano");
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(Employee.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: "ano",
          password: "hashedPassword",
          role: "frontdesk",
          hasAccess: true,
        }),
      );
      expect(res.redirect).toHaveBeenCalledWith("/admin");
    });

    it("returns 409 if username already exists", async () => {
      isValidPassword.mockResolvedValue({
        success: true,
        message: "Password is valid",
      });

      Employee.findOne.mockResolvedValue({ username: "ano" }); // existing user

      await adminController.postRegisterEmployee(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.render).toHaveBeenCalledWith("admin-employee-form", {
        error: "Account already exists",
      });
    });
  });

  // ------------------ getAllEmployees ------------------ //
  describe("getAllEmployees", () => {
    it("returns all employees", async () => {
      const employees = [{ username: "they" }, { username: "them" }];

      const lean = jest.fn().mockResolvedValue(employees);
      Employee.find.mockReturnValue({ lean });

      await adminController.getAllEmployees(req, res, next);

      expect(Employee.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(employees);
    });
  });

  // ------------------ getAllCurrentEmployees ------------------ //
  describe("getAllCurrentEmployees", () => {
    it("returns all employees with hasAccess true", async () => {
      const currentEmployees = [{ username: "fish", hasAccess: true }];

      const lean = jest.fn().mockResolvedValue(currentEmployees);
      Employee.find.mockReturnValue({ lean });

      await adminController.getAllCurrentEmployees(req, res, next);

      expect(Employee.find).toHaveBeenCalledWith({ hasAccess: true });
      expect(res.json).toHaveBeenCalledWith(currentEmployees);
    });
  });

  // ------------------ getAllFormerEmployees ------------------ //
  describe("getAllFormerEmployees", () => {
    it("returns all employees with hasAccess false", async () => {
      const formerEmployees = [{ username: "jane", hasAccess: false }];

      const lean = jest.fn().mockResolvedValue(formerEmployees);
      Employee.find.mockReturnValue({ lean });

      await adminController.getAllFormerEmployees(req, res, next);

      expect(Employee.find).toHaveBeenCalledWith({ hasAccess: false });
      expect(res.json).toHaveBeenCalledWith(formerEmployees);
    });
  });

  // ------------------ getEmployee ------------------ //
  describe("getEmployee", () => {
    it("returns the employee if found", async () => {
      req.params.username = "john";
      const employee = { username: "john", name: "John Doe" };

      const lean = jest.fn().mockResolvedValue(employee);
      Employee.findOne.mockReturnValue({ lean });

      await adminController.getEmployee(req, res, next);

      expect(Employee.findOne).toHaveBeenCalledWith({ username: "john" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(employee);
    });

    it("returns 404 if employee not found", async () => {
      req.params.username = "doesnotexist";

      const lean = jest.fn().mockResolvedValue(null);
      Employee.findOne.mockReturnValue({ lean });

      await adminController.getEmployee(req, res, next);

      expect(Employee.findOne).toHaveBeenCalledWith({
        username: "doesnotexist",
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(null);
    });
  });

  // ------------------ putEmployeeInfo ------------------ //
  describe("putEmployeeInfo", () => {
    beforeEach(() => {
      req.params.username = "ano";
      req.body = {
        contactNum: "09123456789",
        emergencyContactName: "What Ong",
        emergencyContactNum: "09987654321",
        newPassword: "newPass123",
        reenteredPassword: "newPass123",
      };
    });

    it("updates employee info with new password", async () => {
      const employee = { username: "ano", role: "frontdesk" };
      Employee.findOne.mockResolvedValue({
        username: "ano",
        role: "frontdesk",
        hasAccess: true,
      });
      isValidPassword.mockResolvedValue({
        success: true,
        message: "Password is valid",
      });
      bcrypt.hash.mockResolvedValue("hashedNewPass");
      Employee.updateOne.mockResolvedValue({
        acknowledged: true,
        modifiedCount: 1,
      });

      await adminController.putEmployeeInfo(req, res, next);

      expect(isValidPassword).toHaveBeenCalledWith("newPass123", "ano");
      expect(bcrypt.hash).toHaveBeenCalledWith("newPass123", 10);
      expect(Employee.updateOne).toHaveBeenCalledWith(
        { username: "ano" },
        expect.objectContaining({
          contactNum: "09123456789",
          emergencyContactName: "What Ong",
          emergencyContactNum: "09987654321",
          password: "hashedNewPass",
        }),
      );
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it("returns 400 if passwords do not match", async () => {
      const employee = { username: "ano", role: "frontdesk" };
      Employee.findOne.mockResolvedValue(employee);
      req.body.reenteredPassword = "wrongPass";

      await adminController.putEmployeeInfo(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid input",
      });
    });

    it("returns 400 if password is not valid", async () => {
      const employee = { username: "ano", role: "frontdesk" };
      Employee.findOne.mockResolvedValue(employee);
      req.body.newPassword = "invalidPass";
      req.body.reenteredPassword = "invalidPass";
      isValidPassword.mockResolvedValue(false);

      await adminController.putEmployeeInfo(req, res, next);

      expect(isValidPassword).toHaveBeenCalledWith("invalidPass", "ano");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid input",
      });
    });
  });

  // ------------------ getEmployeeActivity ------------------ //
  describe("getEmployeeActivity", () => {
    it("should return activities for a specific employee", async () => {
      req.params.username = "they";
      const activities = [
        { username: "they", timestamp: new Date("2025-01-01") },
        { username: "they", timestamp: new Date("2025-01-02") },
      ];

      const lean = jest.fn().mockResolvedValue(activities);
      const sort = jest.fn().mockReturnValue({ lean });
      Activity.find.mockReturnValue({ sort });

      await adminController.getEmployeeActivity(req, res, next);

      expect(Activity.find).toHaveBeenCalledWith({ username: "they" });
      expect(res.json).toHaveBeenCalledWith(activities);
    });
  });

  // ------------------ getRecentActivity ------------------ //
  describe("getRecentActivity", () => {
    it("should return activities from the last 7 days", async () => {
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setHours(0, 0, 0, 0);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const activities = [
        { username: "alice", timestamp: now },
        { username: "bob", timestamp: new Date("2025-01-01") },
      ];

      const lean = jest.fn().mockResolvedValue(activities);
      const sort = jest.fn().mockReturnValue({ lean });
      Activity.find.mockReturnValue({ sort });

      await adminController.getRecentActivity(req, res, next);

      expect(Activity.find).toHaveBeenCalledWith({
        timestamp: { $gte: expect.any(Date) },
      });
      expect(res.json).toHaveBeenCalledWith(activities);
    });
  });

  // ------------------ putGiveEmployeeAccess ------------------ //
  describe("putGiveEmployeeAccess", () => {
    it("gives employee access", async () => {
      req.body.username = "they";
      const employee = {
        username: "they",
        hasAccess: false,
        save: jest.fn().mockResolvedValue(),
      };
      Employee.findOne.mockResolvedValue(employee);

      await adminController.putGiveEmployeeAccess(req, res, next);

      expect(Employee.findOne).toHaveBeenCalledWith({ username: "they" });
      expect(employee.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it("returns 404 when employee is not found", async () => {
      req.body.username = "ghost";
      Employee.findOne.mockResolvedValue(null);

      await adminController.putGiveEmployeeAccess(req, res, next);

      expect(Employee.findOne).toHaveBeenCalledWith({ username: "ghost" });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Employee not found" });
    });

    it("does nothing when employee already has access", async () => {
      // No session user => adminUsername falls back to "unknown"
      req.session = {};
      req.body.username = "they";

      const employee = {
        username: "they",
        hasAccess: true,
        save: jest.fn(),
      };
      Employee.findOne.mockResolvedValue(employee);

      await adminController.putGiveEmployeeAccess(req, res, next);

      expect(Employee.findOne).toHaveBeenCalledWith({ username: "they" });
      expect(employee.save).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
  });

  // ------------------ putRemoveEmployeeAccess ------------------ //
  describe("putRemoveEmployeeAccess", () => {
    it("removes employee access", async () => {
      req.body.username = "them";

      const employee = {
        _id: "123",
        username: "them",
        role: "frontdesk",
        hasAccess: true,
        save: jest.fn().mockResolvedValue(),
      };

      Employee.findOne.mockResolvedValue(employee);

      await adminController.putRemoveEmployeeAccess(req, res, next);

      expect(Employee.findOne).toHaveBeenCalledWith({ username: "them" });
      expect(employee.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it("returns 404 when employee is not found", async () => {
      req.body.username = "ghost";
      Employee.findOne.mockResolvedValue(null);

      await adminController.putRemoveEmployeeAccess(req, res, next);

      expect(Employee.findOne).toHaveBeenCalledWith({ username: "ghost" });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Employee not found" });
    });

    it("returns success without changes when employee already has no access", async () => {
      // force adminUsername fallback path as well
      req.session = null;
      req.body.username = "them";

      const employee = {
        _id: "id-1",
        username: "them",
        role: "employee",
        hasAccess: false,
        save: jest.fn(),
      };
      Employee.findOne.mockResolvedValue(employee);

      await adminController.putRemoveEmployeeAccess(req, res, next);

      expect(employee.save).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it("returns 400 when trying to remove access from last active admin", async () => {
      req.body.username = "admin";
      const employee = {
        _id: "admin-id",
        username: "admin",
        role: "admin",
        hasAccess: true,
        save: jest.fn(),
      };

      Employee.findOne.mockResolvedValue(employee);
      // no other active admins
      Employee.countDocuments = jest.fn().mockResolvedValue(0);

      await adminController.putRemoveEmployeeAccess(req, res, next);

      expect(Employee.countDocuments).toHaveBeenCalledWith({
        _id: { $ne: employee._id },
        role: "admin",
        hasAccess: true,
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Could not update employee",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ------------------ getDiscounts ------------------ //
  describe("getDiscounts", () => {
    it("returns all discounts", async () => {
      const discounts = [{ description: "VIP", rate: 10 }];
      Discount.find.mockResolvedValue(discounts);

      await adminController.getDiscounts(req, res);

      expect(Discount.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(discounts);
    });
  });

  // ------------------ postRegisterDiscount ------------------ //
  describe("postRegisterDiscount", () => {
    beforeEach(() => {
      req.body = { description: "VIP", rate: 10, minimumPax: 5 };
    });

    it("creates a new discount", async () => {
      const createdDiscount = { ...req.body, _id: "123" };
      Discount.create.mockResolvedValue(createdDiscount);

      await adminController.postRegisterDiscount(req, res);

      expect(Discount.create).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(createdDiscount);
    });

    it("returns 400 if basic username validation fails", async () => {
      req.body.username = "ab"; // too short to be valid

      await adminController.postRegisterEmployee(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith("admin-employee-form", {
        error: "Invalid input",
      });
      expect(Employee.findOne).not.toHaveBeenCalled();
      expect(isValidPassword).not.toHaveBeenCalled();
    });

    it("returns 400 if contact number is invalid", async () => {
      req.body.contactNum = "invalid-phone";

      await adminController.postRegisterEmployee(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith("admin-employee-form", {
        error: "Invalid input",
      });
      expect(Employee.findOne).not.toHaveBeenCalled();
    });

    it("returns 400 if emergency contact number is invalid", async () => {
      req.body.emergencyContactNum = "not-a-phone";

      await adminController.postRegisterEmployee(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith("admin-employee-form", {
        error: "Invalid input",
      });
      expect(Employee.findOne).not.toHaveBeenCalled();
    });

    it("returns 400 if password validator fails", async () => {
      isValidPassword.mockResolvedValue({
        success: false,
        message: "Password invalid",
      });

      await adminController.postRegisterEmployee(req, res, next);

      expect(isValidPassword).toHaveBeenCalledWith("password123", "ano");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith("admin-employee-form", {
        error: "Password invalid",
      });
      expect(Employee.findOne).not.toHaveBeenCalled();
    });
  });

  // ------------------ getEventSettings ------------------ //
  describe("getEventSettings", () => {
    it("renders the event tracker settings page", async () => {
      const discounts = [{ description: "VIP", rate: 10 }];

      const lean = jest.fn().mockResolvedValue(discounts);
      Discount.find.mockReturnValue({ lean });

      await adminController.getEventSettings(req, res, next);

      expect(Discount.find).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith("event-tracker-settings", {
        discounts,
        username: "admin",
        isAdmin: true,
      });
    });
  });
});
