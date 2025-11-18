const Employee = require("../models/employee.js");
const bcrypt = require("bcrypt");
const controller = require("../controllers/auth-controller.js");

jest.mock("../models/employee.js");
jest.mock("bcrypt");
jest.mock("../helpers/activityLogger.js");

describe("Auth Controller", () => {
  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {}); //silence console.log
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "info").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      session: {},
      ip: "127.0.0.1",
      headers: { "user-agent": "jest-test" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
      redirect: jest.fn(),
    };

    jest.clearAllMocks();
  });

  // ------------------ authenticate ------------------ //
  describe("authenticate", () => {
    it("should return 401 if user does not exist", async () => {
      Employee.findOne.mockResolvedValue(null);

      req.body = { username: "admin", password: "123" };

      await controller.authenticate(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.render).toHaveBeenCalledWith("login", { error: "Invalid credentials" });
    });

    it("should return 401 if password mismatch", async () => {
      Employee.findOne.mockResolvedValue({ username: "admin", password: "hashed" });
      bcrypt.compare.mockResolvedValue(false);

      req.body = { username: "admin", password: "wrong" };

      await controller.authenticate(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.render).toHaveBeenCalledWith("login", { error: "Invalid credentials" });
    });

    it("should return 403 if account disabled", async () => {
      Employee.findOne.mockResolvedValue({
        username: "admin",
        password: "hashed",
        hasAccess: false,
      });

      bcrypt.compare.mockResolvedValue(true);

      req.body = { username: "admin", password: "correct" };

      await controller.authenticate(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.render).toHaveBeenCalledWith("login", { error: "Account disabled" });
    });

    it("should login and redirect to home when successful", async () => {
      const user = {
        username: "admin",
        password: "hashed",
        hasAccess: true,
        role: "admin",
      };

      Employee.findOne.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);

      req.body = { username: "admin", password: "correct" };

      await controller.authenticate(req, res);

      expect(req.session.user).toEqual(user);
      expect(req.session.loggedIn).toBe(true);
      expect(req.session.isAdmin).toBe(true);
      expect(res.redirect).toHaveBeenCalledWith("/event-tracker/home");
    });

    it("should return 500 on server error", async () => {
      Employee.findOne.mockRejectedValue(new Error("Server error"));

      req.body = { username: "admin", password: "123" };

      await controller.authenticate(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.render).toHaveBeenCalledWith("login", { error: "Server error" });
    });
  });

  // ------------------ getLogin ------------------ //
  describe("getLogin", () => {
    it("should redirect if user already logged in", () => {
      req.session.user = { username: "admin" };

      controller.getLogin(req, res);

      expect(res.redirect).toHaveBeenCalledWith("/event-tracker/home");
    });

    it("should render login page if not logged in", () => {
      controller.getLogin(req, res);

      expect(res.render).toHaveBeenCalledWith("login");
    });
  });

  // ------------------ getLogout ------------------ //
  describe("getLogout", () => {
    it("should destroy session and redirect to login", () => {
      req.session.destroy = jest.fn((cb) => cb(null));

      controller.getLogout(req, res);

      expect(res.redirect).toHaveBeenCalledWith("/login");
    });

    it("should return 500 if session destroy fails", () => {
      req.session.destroy = jest.fn((cb) => cb(new Error("destroy error")));

      controller.getLogout(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.redirect).toHaveBeenCalledWith("/login");
    });
  });
});