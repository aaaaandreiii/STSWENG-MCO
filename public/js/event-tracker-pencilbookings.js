$(document).ready(function () {
  $('[data-bs-toggle="tooltip"]').tooltip({
    placement: "left",
  });

  $('[data-toggle="popover"]').popover();
});

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
