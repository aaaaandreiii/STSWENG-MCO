if (typeof window != "undefined") {
  $(document).ready(function () {
    //$('#submit').attr("disabled", true);
    setRequiredFields();
    initializeTooltips();

    initializeEmployeeFields();
    initializeAccountFields();

    initializeRealTimeValidation();
    submitForm();
    submitEditForm();
  });
} else {
  module.exports = isPasswordInvalid;
}

function initializeTooltips() {
  $('[data-bs-toggle="tooltip"]').tooltip({
    placement: "left",
  });
  $('[data-toggle="popover"]').popover();
}

function initializeEmployeeFields() {
  // initialize contact number fields
  let settings = {
    autoPlaceholder: "aggressive",
    preferredCountries: ["ph"],
    separateDialCode: true,
    utilsScript: "/js/utils.js",
  };
  $("#employee-mobile-number").intlTelInput(settings);
  $("#emergency-contact-mobile-number").intlTelInput(settings);
  $(".employee-mobile-number").intlTelInput(settings);
  $(".emergency-contact-mobile-number").intlTelInput(settings);
}

function initializeAccountFields() {}

/**
 * Adds the required class to required fields.
 */
function setRequiredFields() {
  $("input[required]").siblings("label").addClass("required");
  $("select[required]").siblings("label").addClass("required");
}

function checkStringInput(input) {
  const blacklist = [
    "~",
    "`",
    "!",
    "@",
    "#",
    "$",
    "%",
    "^",
    "&",
    "*",
    "(",
    ")",
    "_",
    "=",
    "+",
    "{",
    "}",
    "[",
    "]",
    "|",
    "\\",
    ";",
    ":",
    "'",
    '"',
    ".",
    ",",
    "<",
    ">",
    "/",
    "?",
  ];
  var flag = false;

  for (const item of blacklist) if (input.indexOf(item) != -1) flag = true;

  $("input[required]").siblings("label").addClass("required");
  $("select[required]").siblings("label").addClass("required");
}

function initializeRealTimeValidation() {
  /* TODO: Add validation */
  initializeUsernameRealTimeValidation();
  initializePasswordRealTimeValidation();
  initializeEmployeeNameRealTimeValidation();
  initializeEmployeeNumberRealTimeValidation();
  initializeEmergencyNumberRealTimeValidation();
  initializeEditEmployeeRealTimeValidation();
}

function displayError(inputField, errorField, errorText) {
  errorField.text(errorText);
  inputField.addClass("is-invalid");
}

function resetField(inputField, errorField) {
  errorField.text("");
  inputField.removeClass("is-invalid");
}

function initializeUsernameRealTimeValidation() {
  $("#username").keyup(() => {
    console.log("keyup");
    checkUsernameAvailability($("#username"));
  });
  $(".username").keyup(() => {
    console.log("keyup");
    checkUsernameAvailability($(".username"));
  });
}

async function isUsernameTaken(currentUsername) {
  const response = await fetch("./employee");
  const employees = await response.json();
  const usernames = employees.map((employee) => employee.username);

  return usernames.some((username) => username === currentUsername);
}

async function checkUsernameAvailability(usernameField) {
  const username = usernameField.val().trim();
  if (await isUsernameTaken(username)) {
    displayError($("#username"), $("#username-error"), "Username is taken.");
  } else if (username === "") {
    displayError(
      $("#username"),
      $("#username-error"),
      "Username cannot be empty.",
    );
  } else {
    resetField(usernameField, $("#username-error"));
  }
}

function isPasswordInvalid(password) {
  return password.length < 8;
}

function initializePasswordRealTimeValidation() {
  $("#password").keyup(() => {
    const password = $("#password").val();
    if (isPasswordInvalid(password)) {
      displayError(
        $("#password"),
        $("#password-error"),
        "Password must be at least 8 characters long. ",
      );
    } else {
      resetField($("#password"), $("#password-error"));
    }
  });
  $(".password").keyup(() => {
    const password = $(".password").val();
    if (isPasswordInvalid(password)) {
      displayError(
        $(".password"),
        $("#password-error"),
        "Password must be at least 8 characters long. ",
      );
    } else {
      resetField($(".password"), $("#password-error"));
    }
  });
}

function initializeEmployeeNameRealTimeValidation() {
  const employeeNameField = $("#employee-name");

  employeeNameField.keyup(() => {
    const employeeName = employeeNameField.val().trim();
    if (employeeName.length === 0) {
      displayError(
        employeeNameField,
        $("#employee-name-error"),
        "Employee name must not be empty. ",
      );
    } else {
      resetField(employeeNameField, $("#employee-name-error"));
    }
  });
}

function initializeEmployeeNumberRealTimeValidation() {
  $("#employee-mobile-number").keyup(function () {
    if (validator.isEmpty($(this).val()))
      displayError(
        $("#employee-mobile-number"),
        $("#employee-number-error"),
        "Employee mobile number should be filled.",
      );
    else if ($(this).intlTelInput("isValidNumber"))
      resetField($("#employee-mobile-number"), $("#employee-number-error"));
    else
      displayError(
        $("#employee-mobile-number"),
        $("#employee-number-error"),
        "Invalid employee mobile number.",
      );
  });
}

function initializeEmergencyNumberRealTimeValidation() {
  $("#emergency-contact-mobile-number").keyup(function () {
    if ($(this).intlTelInput("isValidNumber"))
      resetField($("#emergency-contact-mobile-number"), $("#ec-number-error"));
    else
      displayError(
        $("#emergency-contact-mobile-number"),
        $("#ec-number-error"),
        "Invalid emergency contact mobile number.",
      );
  });
}

function initializeEditEmployeeRealTimeValidation() {
  let currentEmployeeId = "";
  const employeeList = $('div[data-bs-toggle="modal"]');
  const employeeNumberList = $(".employee-mobile-number");
  const emergencyNumberList = $(".emergency-contact-mobile-number");
  const newPasswordList = $(".new-password");
  const confirmNewPasswordList = $(".reenter-password");

  employeeList.each((_, employee) =>
    employee.addEventListener("click", changeCurrentEmployeeId),
  );

  employeeNumberList.keyup(validateAllFields);
  emergencyNumberList.keyup(validateAllFields);
  newPasswordList.keyup(validateAllFields);
  confirmNewPasswordList.keyup(validateAllFields);

  function validateAllFields() {
    const isValidEmployeeNumber = validateEmployeeNumber(
      $(`#employee-mobile-number-${currentEmployeeId}`),
    );
    const isValidEmergencyNumber = validateEmergencyContactNumber(
      $(`#emergency-contact-mobile-number-${currentEmployeeId}`),
    );
    const isValidReenterPassword = validateReenterPassword(
      $(`#reenter-password-${currentEmployeeId}`),
    );
    const isValidNewPassword = validateNewPassword(
      $(`#new-password-${currentEmployeeId}`),
    );

    if (
      isValidEmployeeNumber &&
      isValidEmergencyNumber &&
      isValidNewPassword &&
      isValidReenterPassword
    ) {
      enableButton($(`#edit-btn-${currentEmployeeId}`));
    } else {
      disableButton($(`#edit-btn-${currentEmployeeId}`));
    }
  }

  function validateEmployeeNumber(field) {
    if (validator.isEmpty(field.val())) {
      displayError(
        field,
        $(`#employee-number-error-${currentEmployeeId}`),
        "Employee mobile number should be filled.",
      );
      return false;
    } else if (field.intlTelInput("isValidNumber")) {
      resetField(field, $(`#employee-number-error-${currentEmployeeId}`));
      return true;
    } else {
      displayError(
        field,
        $(`#employee-number-error-${currentEmployeeId}`),
        "Invalid employee mobile number.",
      );
      return false;
    }
  }

  function validateEmergencyContactNumber(field) {
    if (field.intlTelInput("isValidNumber") || validator.isEmpty(field.val())) {
      resetField(field, $(`#ec-number-error-${currentEmployeeId}`));
      return true;
    } else {
      displayError(
        field,
        $(`#ec-number-error-${currentEmployeeId}`),
        "Invalid emergency contact mobile number.",
      );
      return false;
    }
  }

  function validateNewPassword(field) {
    const confirmNewPassword = $(`#reenter-password-${currentEmployeeId}`);
    if (
      !isPasswordInvalid(field.val()) &&
      field.val() === confirmNewPassword.val()
    ) {
      resetField(confirmNewPassword, $(`#password-error-${currentEmployeeId}`));
      resetField(field, $(`#password-error-${currentEmployeeId}`));
      return true;
    } else {
      displayError(
        field,
        $(`#password-error-${currentEmployeeId}`),
        isPasswordInvalid(field.val())
          ? "Password too short."
          : "Password does not match.",
      );
      return false;
    }
  }

  function validateReenterPassword(field) {
    const newPassword = $(`#new-password-${currentEmployeeId}`);
    if (field.val() === newPassword.val()) {
      resetField(field, $(`#password-error-${currentEmployeeId}`));
      resetField(newPassword, $(`#password-error-${currentEmployeeId}`));
      return true;
    } else {
      displayError(
        field,
        $(`#password-error-${currentEmployeeId}`),
        "Password does not match.",
      );
      return false;
    }
  }

  function changeCurrentEmployeeId(event) {
    const employee = event.target;
    const bs_target = employee.dataset["bsTarget"];
    const [_, employeeId] = bs_target.split("-");

    currentEmployeeId = employeeId;
  }
}

function disableButton(button) {
  button.prop("disabled", true);
}

function enableButton(button) {
  button.prop("disabled", false);
}

function submitForm() {
  $("#create").on("submit", function (event) {
    event.preventDefault();

    // stores all information as an object
    let data = {
      username: $("#username").val(),
      password: $("#password").val(),
      role: $("#role").val(),
      name: $("#employee-name").val(),
      contactNum: $("#employee-mobile-number").intlTelInput("getNumber"),
      emergencyContactName: $("#emergency-contact-name").val(),
      emergencyContactNum: $("#emergency-contact-mobile-number").intlTelInput(
        "getNumber",
      ),
    };

    // makes a POST request using AJAX to add the employee to the database
    $.ajax({
      type: "POST",
      url: "/admin/register",
      data: data,
      headers: {
        "X-CSRF-Token": window.CSRF_TOKEN_FROM_TEMPLATE,
      },
      success: function () {
        window.location.href = "/admin";
      },
      error: function () {
        // generic error message – we don't expose server details
        alert("Could not create account. Please check the form and try again.");
      },
    });
  });
}

function submitEditForm() {
  $(".edit").on("submit", function (event) {
    event.preventDefault();
    const id = $(this).children(".id").text();
    const username = $(this).children(".username").text();

    // stores all information as an object
    let data = {
      contactNum: $("#employee-mobile-number-" + id).intlTelInput("getNumber"),
      emergencyContactName: $("#emergency-contact-name-" + id).val(),
      emergencyContactNum: $(
        "#emergency-contact-mobile-number-" + id,
      ).intlTelInput("getNumber"),
      newPassword: $("#new-password-" + id).val(),
      reenteredPassword: $("#reenter-password-" + id).val(),
      role: $("#role-" + id).val(),
    };

    $.ajax({
      type: "PUT",
      url: "/admin/employee/" + username,
      headers: {
        "X-CSRF-Token": window.CSRF_TOKEN_FROM_TEMPLATE,
      },
      data: JSON.stringify(data),
      contentType: "application/json",
      success: function () {
        window.location.href = "/admin";
      },
      error: function () {
        alert("Could not update employee. Please try again.");
      },
    });
  });
}
