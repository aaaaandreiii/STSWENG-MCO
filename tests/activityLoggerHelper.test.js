const Activity = require("../models/activity.js");
const activityLogger = require("../helpers/activityLogger.js");

jest.mock("../models/activity.js");
//check if Activity.create is called correctly
describe("activityLogger", () => {
  it("should call Activity.create with correct fields", () => {
    activityLogger("admin", "login_success");

    expect(Activity.create).toHaveBeenCalledWith({
      username: "admin",
      activityName: "login_success",
    });
  });
});