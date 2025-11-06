//returns the previous month
const hbs = require('hbs');

hbs.registerHelper('formatDate', function (date) {
    if (date) {
        date = new Date(date);
        let month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][date.getMonth()];
        let day = date.getDate().toString().padStart(2, 0);
        let year = date.getFullYear().toString();
        return `${month} ${day}, ${year}`;
    } else {
        return '';
    }
});

hbs.registerHelper('formatDateShort', function (date) {
    if (date) {
        date = new Date(date);
        let month = (date.getMonth()+1).toString().padStart(2, 0);
        let day = date.getDate().toString().padStart(2, 0);
        let year = date.getFullYear().toString();
        return `${month}/${day}/${year}`;
    } else {
        return '';
    }
});

hbs.registerHelper('formatTimestamp', function (date) {
    if (date) {
        date = new Date(date);
        let timestamp = new Intl.DateTimeFormat('en', {
            timeStyle: 'medium',
            dateStyle: 'short'
        });
        return timestamp.format(date);
    } else {
        return '';
    }
});

hbs.registerHelper('formatMoney', function (money) {
    return Number(parseFloat(money).toFixed(2)).toLocaleString('en', {
        minimumFractionDigits: 2
    });
});

hbs.registerHelper('formatArray', function (array) {
    return array.join(', ');
});

hbs.registerHelper('ifEquals', function (arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper('ifNotEquals', function (arg1, arg2, options) {
    return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper('checkIfFutureDate', function (date, options) {
    date = new Date(date);
    today = new Date();
    return (date <= today) ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper('checkIfFinalPayment', function (payment, options) {
    return (payment != null) ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper('multiply', function (a, b) {
    return Number(a) * Number(b);
});


hbs.registerHelper('getPrevMonth', function (date) {
    let current;
    if (date.getMonth() == 0) {
        current = new Date(date.getFullYear() - 1, 11, 1);
    } else {
        current = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    }
    return `${current.getFullYear()}/${(current.getMonth() + 1).toString().padStart(2, 0)}`;
});

//returns the next month
hbs.registerHelper('getNextMonth', function (date) {
    let current;
    if (date.getMonth() == 11) {
        current = new Date(date.getFullYear() + 1, 0, 1);
    } else {
        current = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    }

    return `${current.getFullYear()}/${(current.getMonth() + 1).toString().padStart(2, 0)}`;
});

//returns the next month
hbs.registerHelper('getToday', function () {
    let today = new Date();
    return `${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, 0)}`;
});

hbs.registerHelper('json', function (context) {
    return JSON.stringify(context);
});