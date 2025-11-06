$(document).ready(function () {
    $('[data-bs-toggle="tooltip"]').tooltip({
        placement: 'left'
    });

    $('[data-toggle="popover"]').popover();

    highlightEventDays();
});

function highlightEventDays() {
    $('.done').parent().addClass('withEvent');
}