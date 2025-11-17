if (typeof window != "undefined") {
  $(document).ready(function () {
    validateDiscountModal();
    submitAddDiscount();
  });
}

function validateDiscountModal() {
  $("#discount-name").keyup(function () {
    var result = isValidDiscountName($(this).val().trim());
    if (!result[0])
      displayError($("#discount-name"), $("#discount-error"), result[1]);
    else resetField($("#discount-name"), $("#discount-error"));
  });
  $("#discount-name, #pax, #percentage").change(function () {
    var dname = $("#discount-name").val().trim();
    var pax = $("#pax").val().trim();
    var percentage = $("#percentage").val().trim();

    var result = isValidDiscount(dname, pax, percentage);

    $("#discount-create-btn").attr("disabled", !result[0]);

    if (!result[0]) {
      if (
        result[1] == "Discount name cannot be empty." ||
        result[1] == "Discount name is only up to 30 characters."
      ) {
        displayError($("#discount-name"), $("#discount-error"), result[1]);
        resetField($("#pax"), $("#pax-error"));
        resetField($("#percentage"), $("#percentage-error"));
      } else if (result[1] == "Invalid pax.") {
        displayError($("#pax"), $("#pax-error"), result[3]);
        resetField($("#percentage"), $("#percentage-error"));
        //resetField($('#discount-name'), $('#discount-error'));
      } else {
        displayError($("#percentage"), $("#percentage-error"), result[5]);
        //resetField($('#discount-name'), $('#discount-error'));
        resetField($("#pax"), $("#pax-error"));
      }
    } else {
      resetField($("#pax"), $("#pax-error"));
      resetField($("#percentage"), $("#percentage-error"));
      resetField($("#discount-name"), $("#discount-error"));
      if (!dname) $(".discount-create-button").attr("disabled", result[0]);
    }
  });
}

// Discount Modal
function isValidDiscount(discountname, pax, percentage) {
  var resultpax = isValidPaxNum(pax);
  var resultpercent = isValidPercentage(percentage);
  var resultname = isValidDiscountName(discountname);
  if (
    (discountname && resultpax[0] && resultpercent[0]) ||
    (discountname == pax && pax == percentage)
  ) {
    if (resultname[1] == "Discount name is only up to 30 characters.")
      return [
        false,
        "Discount name is only up to 30 characters.",
        resultpax[0],
        resultpax[1],
        resultpercent[0],
        resultpercent[1],
      ];
    else return [true, ""];
  } else {
    if (!discountname) {
      if (!resultpercent[0]) {
        if (!resultpax[0]) {
          if (
            resultpercent[1] == "Percentage cannot be negative." ||
            percentage != ""
          )
            return [
              false,
              "Invalid percentage.",
              resultpax[0],
              resultpax[1],
              resultpercent[0],
              resultpercent[1],
            ];
          else
            return [
              false,
              "Invalid pax.",
              resultpax[0],
              resultpax[1],
              resultpercent[0],
              resultpercent[1],
            ];
        } else {
          if (percentage == "")
            return [
              false,
              resultname[1],
              resultpax[0],
              resultpax[1],
              resultpercent[0],
              resultpercent[1],
            ];
          else
            return [
              false,
              "Invalid percentage.",
              resultpax[0],
              resultpax[1],
              resultpercent[0],
              resultpercent[1],
            ];
        }
      } else {
        return [
          false,
          resultname[1],
          resultpax[0],
          resultpax[1],
          resultpercent[0],
          resultpercent[1],
        ];
      }
    } else {
      if (!resultpax[0])
        return [
          false,
          "Invalid pax.",
          resultpax[0],
          resultpax[1],
          resultpercent[0],
          resultpercent[1],
        ];
      else
        return [
          false,
          "Invalid percentage.",
          resultpax[0],
          resultpax[1],
          resultpercent[0],
          resultpercent[1],
        ];
    }
  }
}

// Discount Name
function isValidDiscountName(input) {
  console.log(input.length);
  if (input == "") return [false, "Discount name cannot be empty."];
  else if (input.length > 30)
    return [false, "Discount name is only up to 30 characters."];
  else return [true, ""];
}

// Number of Pax
function isValidPaxNum(input) {
  if (input < 0) return [false, "Number of pax cannot be negative."];
  else if (input == 0) return [false, "Number of pax cannot be zero."];
  else if (input > 120)
    return [false, "Number of pax cannot be more than 120."];
  else return [true, ""];
}

// Percentage
function isValidPercentage(input) {
  if (input == undefined || input == 0 || Number.isNaN(Number(input)))
    return [false, "Percentage cannot be zero.", ""];
  else if (input < 0) return [false, "Percentage cannot be negative.", ""];
  else if (input > 100)
    return [false, "Percentage cannot be greater than 100%.", ""];
  else return [true, "", input];
}

// Error Visuals
function displayError(inputField, errorField, errorText) {
  errorField.text(errorText);
  inputField.addClass("is-invalid");
}

function resetField(inputField, errorField) {
  errorField.text("");
  inputField.removeClass("is-invalid");
}

// Submit Add Discount Form
function submitAddDiscount() {
  $("#add-discount").on("submit", function (event) {
    event.preventDefault();

    // stores all information as an object
    let data = {
      description: $("#discount-name").val(),
      minimumPax: $("#pax").val(),
      rate: $("#percentage").val(),
    };

    // makes a POST request using AJAX to add the discount to the database
    $.post("/settings/event/discount", data, function (result) {
      window.location.href = "/settings/event";
    });
  });
}

if (typeof window == "undefined") {
  module.exports = {
    isValidDiscountName,
    isValidPaxNum,
    isValidPercentage,
    isValidDiscount,
  };
}
