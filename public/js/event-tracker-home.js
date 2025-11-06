$(document).ready(function () {
  $("#sidenav-link-today").addClass("sidenav-active");
  setDate();

  $('[data-bs-toggle="tooltip"]').tooltip({
    placement: "left",
  });

  $('[data-toggle="popover"]').popover();
});

function setDate() {
  let date = new Date();
  let options = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  $("#today-date-text").text(date.toLocaleDateString("en-US", options));
}

function deleteReservation(id) {
  let json = JSON.stringify({
    id: id,
  });
  $.ajax({
    type: "PUT",
    url: "/event-tracker/cancel",
    data: json,
    contentType: "application/json",
    success: function (result) {
      window.location.href = "/event-tracker/cancelled";
    },
  });
}
