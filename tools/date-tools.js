const clc = require('cli-color');
const arguments = require('./process-args').arguments;
const constants = require('../constants');
const COLOR = constants.GETCOLORS(clc, arguments);

// SO to the rescue: https://stackoverflow.com/a/17415677
const pad = ((num, char) => {
	var norm = Math.floor(Math.abs(num));
	return (norm < 10 ? (char ? char : '0') : '') + norm;
});

Date.prototype.toIsoArr = function(precision) {
    var tzo = -this.getTimezoneOffset();
    var col;
    const dif = tzo >= 0 ? ' +' : ' -';
    const bw = [
                    this.getFullYear(),
            '-', pad(this.getMonth() + 1),
            '-', pad(this.getDate()),
            'T', pad(this.getHours(),''),
            ':', pad(this.getMinutes()),
            ':', pad(this.getSeconds()),
            dif + pad(tzo / 60) +
            ':' + pad(tzo % 60)
        ];
    if (precision) {
        const color = {
            month:  (['half','quarter'].includes(precision) ? COLOR.WARNING : ( ['month','day','hour'].includes(precision) ? COLOR.SUCCESS : COLOR.INVALID )),
            day:    ['day','hour'].includes(precision) ? COLOR.SUCCESS : COLOR.INVALID,
            hour:   (precision == "hour") ? COLOR.SUCCESS : COLOR.INVALID
        };
        col = [
                                COLOR.SUCCESS(this.getFullYear()),
            color.month('-'),   color.month(pad(this.getMonth() + 1)),
            color.day('-'),     color.day(pad(this.getDate())),
            color.hour('T'),    color.hour(pad(this.getHours(),'')),
            color.hour(':'),    color.hour(pad(this.getMinutes())),
            color.hour(':'),    color.hour(pad(this.getSeconds())),
            COLOR.GENERIC(dif + pad(tzo / 60) +
                          ':' + pad(tzo % 60))
        ];
    } else {
        col = bw;
    };
    return {
        col:col,
        bw: bw
    };
};

this.secondsHumanReadable = ((t, precision) => {
    var seconds = parseInt(t, 10); // Convert float to int
	var days	= Math.floor(seconds / 86400);
	if (precision == "days") { return days+" days" };
	var str = 	(days != 0 ? days+" days, " : "");
    seconds  	-= days*86400;
	var hours   = Math.floor(seconds / 3600);
	str 		+= (hours+" hours")
	if (precision == "hours") { return str };
    seconds  	-= hours*3600;
	var minutes = Math.floor(seconds / 60);
	str 		+= (", "+pad(minutes, " ")+" minutes")
	if (precision == "minutes") { return str };
    seconds  	-= minutes*60;
    return str+", "+pad(seconds, " ")+" seconds"	//Let's not worry about padding the hours.. Doesn't change that much.
});
