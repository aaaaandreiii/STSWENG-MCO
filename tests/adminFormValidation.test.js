const isPasswordInvalid = require("../public/js/admin-employee-form.js");

describe("check password validation", () => {
  it("password is less than 8 characters", () => {
    //arrange
    const password = "1234567";

    //act
    const result = isPasswordInvalid(password);

    //expect
    expect(result).toEqual(true);
  });

  it("password is 8 characters", () => {
    //arrange
    const password = "12345678";

    //act
    const result = isPasswordInvalid(password);

    //expect
    expect(result).toEqual(false);
  });

  it("password is more than 8 characters", () => {
    //arrange
    const password = "123456789";

    //act
    const result = isPasswordInvalid(password);

    //expect
    expect(result).toEqual(false);
  });
});