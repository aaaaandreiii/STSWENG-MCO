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
jest.mock("../helpers/newPasswordValidator.js");

describe("Admin Controller", () => {
  let req, res;
  beforeEach(() => {
    req = {
      body: {},
      params: {},
      session: { user: { username: "admin" }, isAdmin: true },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn(),
      render: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // ------------------ getAdminHome ------------------ //
  describe("getAdminHome", () => {
    it("should render admin home page", async () => {
      const now = new Date();
      Employee.aggregate.mockResolvedValue([
        //returns
        {
          username: "admin",
          dateRegistered: new Date("2025-01-01"),
          activities: [
            { timestamp: now },
            { timestamp: new Date("2020-01-01") },
          ],
        },
      ]);
      Activity.find.mockResolvedValue([{ username: "admin", timestamp: now }]);

      await adminController.getAdminHome(req, res);

      expect(res.render).toHaveBeenCalledWith(
        "admin-home",
        expect.objectContaining({
          employees: expect.arrayContaining([
            expect.objectContaining({
              username: "admin",
              activities: expect.arrayContaining([
                expect.objectContaining({ timestamp: now }),
              ]),
            }),
          ]),
          activities: expect.arrayContaining([
            expect.objectContaining({ username: "admin" }),
          ]),
          username: "admin",
          isAdmin: true,
        }),
      );
    });

    it("filters out old activities", async () => {
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setHours(0, 0, 0, 0);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentActivity = { username: "admin", timestamp: now };
      const oldActivity = {
        username: "admin",
        timestamp: new Date("2000-01-01"),
      };
      Employee.aggregate.mockResolvedValue([
        {
          username: "admin",
          dateRegistered: new Date(),
          activities: [recentActivity, oldActivity],
        },
      ]);
      Activity.find.mockResolvedValue([recentActivity]);

      await adminController.getAdminHome(req, res);

      const renderedData = res.render.mock.calls[0][1]; // get the data that was passed to render in first call

      expect(renderedData.employees[0].activities).toHaveLength(1); //1 match
      expect(renderedData.employees[0].activities[0].timestamp).toEqual(now);
      expect(renderedData.activities).toEqual([recentActivity]);
    });
  });

  // ------------------ getRegisterEmployee ------------------ //
  describe("getRegisterEmployee", () => {
    it("should render the admin employee form", () => {
      adminController.getRegisterEmployee(req, res);
      expect(res.render).toHaveBeenCalledWith("admin-employee-form");
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
      };
    });

    it("creates a new employee if username does not exist", async () => {
      Employee.findOne.mockResolvedValue(null); // username not found
      Employee.create.mockResolvedValue({ ...req.body, role: "employee" });
      bcrypt.hash.mockResolvedValue("hashedPassword");

      await adminController.postRegisterEmployee(req, res);

      expect(Employee.findOne).toHaveBeenCalledWith({ username: "ano" });
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(Employee.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: "ano",
          password: "hashedPassword",
          role: "employee",
          hasAccess: true,
        }),
      );
      expect(res.redirect).toHaveBeenCalledWith("/admin");
    });

    it("returns 406 if username already exists", async () => {
      Employee.findOne.mockResolvedValue({ username: "ano" }); // username exists

      await adminController.postRegisterEmployee(req, res);

      expect(res.status).toHaveBeenCalledWith(406);
      expect(res.json).toHaveBeenCalledWith({
        msg: "Account already exists for username: ano",
      });
    });
  });

  // ------------------ getAllEmployees ------------------ //
  describe("getAllEmployees", () => {
    it("returns all employees", async () => {
      const employees = [{ username: "they" }, { username: "them" }];
      Employee.find.mockResolvedValue(employees);

      await adminController.getAllEmployees(req, res);

      expect(Employee.find).toHaveBeenCalledWith({ role: "employee" });
      expect(res.json).toHaveBeenCalledWith(employees);
    });
  });

  // ------------------ getAllCurrentEmployees ------------------ //
  describe("getAllCurrentEmployees", () => {
    it("returns all employees with hasAccess true", async () => {
      const currentEmployees = [{ username: "fish", hasAccess: true }];
      Employee.find.mockResolvedValue(currentEmployees);

      await adminController.getAllCurrentEmployees(req, res);

      expect(Employee.find).toHaveBeenCalledWith({
        role: "employee",
        hasAccess: true,
      });
      expect(res.json).toHaveBeenCalledWith(currentEmployees);
    });
  });

  // ------------------ getAllFormerEmployees ------------------ //
  describe("getAllFormerEmployees", () => {
    it("returns all employees with hasAccess false", async () => {
      const formerEmployees = [{ username: "jane", hasAccess: false }];
      Employee.find.mockResolvedValue(formerEmployees);

      await adminController.getAllFormerEmployees(req, res);

      expect(Employee.find).toHaveBeenCalledWith({
        role: "employee",
        hasAccess: false,
      });
      expect(res.json).toHaveBeenCalledWith(formerEmployees);
    });
  });

  // ------------------ getEmployee ------------------ //
  describe("getEmployee", () => {
    it("returns the employee if found", async () => {
      req.params.username = "john";
      const employee = { username: "john", name: "John Doe" };
      Employee.findOne.mockResolvedValue(employee);

      await adminController.getEmployee(req, res);

      expect(Employee.findOne).toHaveBeenCalledWith({ username: "john" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(employee);
    });

    it("returns 404 if employee not found", async () => {
      req.params.username = "doesnotexist";
      Employee.findOne.mockResolvedValue(null);

      await adminController.getEmployee(req, res);

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
      isValidPassword.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue("hashedNewPass");
      const updatedEmployee = { username: "ano", password: "hashedNewPass" };
      Employee.findOneAndUpdate.mockResolvedValue(updatedEmployee);

      await adminController.putEmployeeInfo(req, res);

      expect(isValidPassword).toHaveBeenCalledWith("newPass123", "ano");
      expect(bcrypt.hash).toHaveBeenCalledWith("newPass123", 10);
      expect(Employee.findOneAndUpdate).toHaveBeenCalledWith(
        { username: "ano" },
        expect.objectContaining({
          contactNum: "09123456789",
          emergencyContactName: "What Ong",
          emergencyContactNum: "09987654321",
          password: "hashedNewPass",
        }),
        { new: true },
      );
      expect(res.json).toHaveBeenCalledWith(updatedEmployee);
    });

    it("returns 406 if passwords do not match", async () => {
      req.body.reenteredPassword = "wrongPass";

      await adminController.putEmployeeInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(406);
      expect(res.json).toHaveBeenCalledWith({
        message: "New password and re-entered password do not match",
      });
    });

    it("returns 406 if password is not valid", async () => {
      req.body.newPassword = "invalidPass";
      isValidPassword.mockResolvedValue(false);

      await adminController.putEmployeeInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(406);
      expect(res.json).toHaveBeenCalledWith({
        message: "New password is not valid",
      });
    });
  });

  // ------------------ getEmployeeActivity ------------------ //
  describe("getEmployeeActivity", () => {
    it("should return activities for a specific employee", async () => {
      req.params.username = "they";
      const activities = [
        { username: "they", timestamp: new Date("2025-01-01") },
        { username: "they", timestamp: new Date("2025-01-01") },
        { username: "them", timestamp: new Date("2025-01-01") },
      ];
      Activity.find.mockResolvedValue(activities);

      await adminController.getEmployeeActivity(req, res);

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

      Activity.find.mockResolvedValue(activities);

      await adminController.getRecentActivity(req, res);

      expect(Activity.find).toHaveBeenCalledWith({
        timestamp: { $gte: sevenDaysAgo },
      });
      expect(res.json).toHaveBeenCalledWith(activities);
    });
  });

  // ------------------ putGiveEmployeeAccess ------------------ //
  describe("putGiveEmployeeAccess", () => {
    it("gives employee access", async () => {
      req.body.username = "they";
      const updatedEmployee = { username: "they", hasAccess: true };
      Employee.findOneAndUpdate.mockResolvedValue(updatedEmployee);

      await adminController.putGiveEmployeeAccess(req, res);

      expect(Employee.findOneAndUpdate).toHaveBeenCalledWith(
        { username: "they" },
        { hasAccess: true },
        { returnDocument: "after" },
      );
      expect(res.json).toHaveBeenCalledWith(updatedEmployee);
    });
  });

  // ------------------ putRemoveEmployeeAccess ------------------ //
  describe("putRemoveEmployeeAccess", () => {
    it("removes employee access", async () => {
      req.body.username = "them";
      const updatedEmployee = { username: "them", hasAccess: false };
      Employee.findOneAndUpdate.mockResolvedValue(updatedEmployee);

      await adminController.putRemoveEmployeeAccess(req, res);

      expect(Employee.findOneAndUpdate).toHaveBeenCalledWith(
        { username: "them" },
        { hasAccess: false },
        { returnDocument: "after" },
      );
      expect(res.json).toHaveBeenCalledWith(updatedEmployee);
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
  });

  // ------------------ getEventSettings ------------------ //
  describe("getEventSettings", () => {
    it("renders the event tracker settings page", async () => {
      const discounts = [{ description: "VIP", rate: 10 }];
      Discount.find.mockResolvedValue(discounts);

      await adminController.getEventSettings(req, res);

      expect(Discount.find).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith("event-tracker-settings", {
        discounts: discounts,
        username: "admin",
        isAdmin: true,
      });
    });
  });
});
