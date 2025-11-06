$(document).ready(function () {
    $('[data-bs-toggle="tooltip"]').tooltip({
        placement: 'left'
    });

    $('[data-toggle="popover"]').popover();

    filterEmployees();
});

function filterEmployees() {
    $('#current-employee-switch').change(function () {
        if ($(this).prop('checked'))
            $('.noaccess').addClass('d-none');
        else $('.noaccess').removeClass('d-none');
    });
}

function giveAccess(username) {
    let json = JSON.stringify({
        username: username,
    });
    $.ajax({
        type: 'PUT',
        url: '/admin/give',
        data: json,
        contentType: 'application/json',
        success: function (result) {
            window.location.href = '/admin';
        },
    });
}

function removeAccess(username) {
    let json = JSON.stringify({
        username: username,
    });
    $.ajax({
        type: 'PUT',
        url: '/admin/remove',
        data: json,
        contentType: 'application/json',
        success: function (result) {
            window.location.href = '/admin';
        },
    });
}