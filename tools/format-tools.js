const clc = require('cli-color');
const constants = require('../constants');

const COLOR = constants.GETCOLORS(clc);
const STRING = constants.GETSTRING(COLOR);

this.prettyPrintData = ((data_cache, idx, json_view) => {
    var data = Object.assign({},data_cache[1][idx]);
    if (json_view) {
        var output = [[STRING.HEADERS.JSON]];
        JSON.stringify(data,null,2)
            .split('\n')
            .forEach(u => {output.push([COLOR.GENERIC(u)])});
        return output;
    }
    // data.rocket = data_cache[2].filter((rocket) => rocket.id == data.rocket) //I'm lazy right now - was going to add in some features to view the 'hashes' (other elements such as cores, rocket type, etc.), but holding off on it.
    // console.log(JSON.stringify(data,null,2))
    var output = [[STRING.HEADERS.KEY,STRING.HEADERS.VALUE]];
    JSON.stringify(data,null,2)
        .split('\n')
        .forEach(u => {
            const val = u.replace('[]','<empty>')
                         .replace('null','<null>')
                         .replace('[','')
                         .replace('],','')
                         .replace(']','')
                         .replace('},','')
                         .replace('}','')
                         .replace('{','')
                         .split(/:(.+)/);
            output.push([COLOR.WARNING(val[0]),COLOR.GENERIC(val[1] ? val[1].replace(/,$/, '') : '')]);
        });
    return output;
});

this.deepCompare = ((A,B) => {
    if (A.length === B.length) {
        for ( var i = 0; i < A.length; i++ ) {
            if (Array.isArray(A[i])) {
                if (Array.isArray(B[i])) {
                    if (!this.deepCompare(A[i],B[i])) {
                        return false
                    };
                } else {
                    return false;
                };
            } else {
                if (A[i] !== B[i]) {
                    return false;
                };
            };
        };
        return true;
    } else {
        return false;
    };
});

this.diffTable = ((A,B) => {
    var diff_table = [
            [
                '',
                STRING.HEADERS.FLIGHT_NUMBER,
                STRING.HEADERS.NAME,
                STRING.HEADERS.DATE_H,
                STRING.HEADERS.PRECISION,
                STRING.HEADERS.FLAGS,
                STRING.HEADERS.ROCKET,
                STRING.HEADERS.CORE,
                STRING.HEADERS.LAUNCHPAD,
                // STRING.HEADERS.LAUNCHPAD_REG
                STRING.HEADERS.PAYLOAD_NAME,
                STRING.HEADERS.PAYLOAD_CUSTOMERS,
            ],
            [ ' ', ' ', ' ', ' ', ' ', ' ', ' ',' ', ' ', ' ', ' ']
        ];

    for ( var i = 0; i < B.length; i++ ) {
        var row = [[''],[''],Array(B[i].length).fill('')];
        var mod = false;
        for ( var j = 0; j < B[i].length; j++ ) {
            var a = A[i][j];
            var b = B[i][j];
            if (a !== b) {
                a = COLOR.DANGER(a);
                b = COLOR.SUCCESS(b);
                mod = true;
            } else {
                a = COLOR.GENERIC(a);
                b = COLOR.GENERIC(b);
            };
            row[0].push(a);
            row[1].push(b);
        };
        if (mod) {
            row[0][0] = COLOR.DANGER(STRING.DIFF.PREVIOUS_SYMBOL + STRING.DIFF.PREVIOUS);
            row[1][0] = COLOR.SUCCESS(STRING.DIFF.CURRENT_SYMBOL + STRING.DIFF.CURRENT);
        } else {
            row[0][0] = COLOR.WARNING(STRING.DIFF.UNCHANGED_SYMBOL + STRING.DIFF.PREVIOUS);
            row[1][0] = COLOR.WARNING(STRING.DIFF.UNCHANGED_SYMBOL + STRING.DIFF.CURRENT);
        };
        diff_table = diff_table.concat(row);
    };
    return diff_table;
});

this.tabularizeDiffData = (LUNCHES => {
    LUNCHES = LUNCHES.map(lunch => [
        String(lunch.flight_number),
        lunch.name,
        lunch.date_h_,
        lunch.date_precision_,
        (lunch.tbd ? "tbd" : "")+(lunch.net && lunch.tbd ? ", " : "")+(lunch.net ? "net" : ""),
        lunch.rocket,
        lunch.cores_,
        lunch.launchpad,
        // lunch.launchpad_reg
        lunch.payloads.names_str,
        lunch.payloads.customers_str
    ]);
    // LUNCHES.unshift([
    //     STRING.HEADERS.FLIGHT_NUMBER,
    //     STRING.HEADERS.NAME,
    //     STRING.HEADERS.DATE_H,
    //     STRING.HEADERS.DT,
    //     STRING.HEADERS.PRECISION,
    //     STRING.HEADERS.FLAGS,
    //     STRING.HEADERS.ROCKET,
    //     STRING.HEADERS.CORE,
    //     STRING.HEADERS.LAUNCHPAD,
    //     // STRING.HEADERS.LAUNCHPAD_REG
    //     STRING.HEADERS.PAYLOAD_NAME,
    //     STRING.HEADERS.PAYLOAD_CUSTOMERS,
    // ],[ ' ', ' ', ' ', ' ', ' ', ' ', ' ',' ', ' ', ' ', ' ']);
    return LUNCHES;
})

this.tabularizeData = (LUNCHES => {
     LUNCHES = LUNCHES.map(lunch => [
        COLOR.GENERIC(String(lunch.flight_number)),
        COLOR.GENERIC(lunch.name),
        lunch.date_h,
        lunch.dt,
        lunch.date_precision,
        COLOR.DANGER((lunch.tbd ? "tbd" : "")+(lunch.net && lunch.tbd ? ", " : "")+(lunch.net ? "net" : "")),
        COLOR.GENERIC(lunch.rocket),
        COLOR.GENERIC(lunch.cores),
        COLOR.GENERIC(lunch.launchpad),
        // lunch.launchpad_reg
        COLOR.GENERIC(lunch.payloads.names_str),
        COLOR.GENERIC(lunch.payloads.customers_str)
    ]);
    LUNCHES.unshift([
        STRING.HEADERS.FLIGHT_NUMBER,
        STRING.HEADERS.NAME,
        STRING.HEADERS.DATE_H,
        STRING.HEADERS.DT,
        STRING.HEADERS.PRECISION,
        STRING.HEADERS.FLAGS,
        STRING.HEADERS.ROCKET,
        STRING.HEADERS.CORE,
        STRING.HEADERS.LAUNCHPAD,
        // STRING.HEADERS.LAUNCHPAD_REG
        STRING.HEADERS.PAYLOAD_NAME,
        STRING.HEADERS.PAYLOAD_CUSTOMERS,
    ],[ ' ', ' ', ' ', ' ', ' ', ' ', ' ',' ', ' ', ' ', ' ']);
	return LUNCHES;
});