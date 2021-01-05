const clc = require('cli-color');
const notifier = require('node-notifier');
const blessed = require('neo-blessed');
const path = require('path');

const arguments = require('./tools/process-args').arguments;
const cli_elem = require('./tools/cli-elements');
const date_tools = require('./tools/date-tools');
const net_tools = require('./tools/net-tools');
const format_tools = require('./tools/format-tools');
const constants = require('./constants');

const COLOR = constants.GETCOLORS(clc);
const STRING = constants.GETSTRING(COLOR);
const CONSTANT_VALUES = constants.CONSTANT_VALUES;

var screen = cli_elem.screen;
var table_element = cli_elem.table_element;
var status_element = cli_elem.status_element;
var countdown_element = cli_elem.countdown_element;
var controls_element = cli_elem.controls_element;
var information_element = cli_elem.information_element;

const secondsHumanReadable = date_tools.secondsHumanReadable;

const getData = net_tools.getData;
const formatErr = net_tools.formatErr;

const prettyPrintData = format_tools.prettyPrintData;

//  =====================================

//TODO: archive data option
//TODO: better viewer (than json and the crappy one I made using only string manipulation.)

process.env.FORCE_COLOR = true;

// const SCREEN_REFRESH = 1000; //ms
// const API_REFRESH = 10*60*1000; //ms
const SCREEN_REFRESH = arguments.screen_refresh; //ms
const API_REFRESH = arguments.api_refresh; //ms
const API_REFRESH_CYCLES = API_REFRESH/SCREEN_REFRESH;
const NONINTERACTIVE = arguments.dump;
//

var notified_1h = [];
var notifying_1h = [];

async function formatData(arr) {
	const LUNCHPADS_RESP = arr[0];
	const LUNCHES_RESP = arr[1];
    const ROCKETS_RESP = arr[2];
    const PAYLOADS_RESP = arr[3];
    const CORES_RESP = arr[4];

    var ROCKETS = {};
    ROCKETS_RESP.forEach(rocket => {
        ROCKETS[rocket.id] = rocket.name
    });
    var LUNCHPADS = {};
    LUNCHPADS_RESP.forEach(lunchpad => {
        LUNCHPADS[lunchpad.id] = {
            name:   lunchpad.name,
            region: lunchpad.region
        }
    });
    var PAYLOADS = {}
    PAYLOADS_RESP.forEach(payload => {
        PAYLOADS[payload.id] = {
            name:       payload.name,
            customers:  payload.customers.join(', ')
        }
    });
    var CORES = {};
    CORES_RESP.forEach(core => {
       CORES[core.id] = {
           serial:      core.serial,
           reuse_count: core.reuse_count
       }
    });
    
    var LUNCHES = LUNCHES_RESP.map(lunch => {
        const lunchpad = LUNCHPADS[lunch.launchpad];
        var precision = lunch.date_precision;
        const t_s = lunch.date_unix;
        const date_arr = new Date(t_s*1000).toIsoArr(precision);

        var payload_names_str = '';
        var payload_customers_str = '';
        lunch.payloads.forEach(id => {
            payload_names_str += (PAYLOADS[id].name + ' | ')
            payload_customers_str += (PAYLOADS[id].customers + ' | ')
        });
        payload_names_str = payload_names_str.substr(0, payload_names_str.length-3)
        payload_customers_str = payload_customers_str.substr(0, payload_customers_str.length-3)

        var cores_str = "";
        lunch.cores.forEach(core_ => {
            cores_str += CORES[core_["core"]] ? (CORES[core_["core"]]["serial"] + '(' + CORES[core_["core"]]["reuse_count"] + ') ') : STRING.CORE_UNASSIGNED + '  ';
        });
        cores_str = cores_str.substr(0, cores_str.length-1)

        var time_style = {
            hour:       { p:"minutes",  c: COLOR.TIME.LT1 },
            day:        { p:"hours",    c: COLOR.TIME.LTD },
            month:      { p:"hours",    c: COLOR.TIME.LTM },
            quarter:    { p:"days",     c: COLOR.TIME.LTQ }, // use this symbol? ◔ ◑
            half:       { p:"days",     c: COLOR.TIME.LTH }
        }[precision]
        const dt_s = t_s - new Date().getTime() / 1000;
        var dt_str = secondsHumanReadable(dt_s,time_style.p);
        if (dt_s <= CONSTANT_VALUES.TIME_NOTIFY && precision == "hour" && !lunch.tbd && !lunch.net && !notified_1h.includes(lunch.flight_number)) { //Notify user.
            notified_1h.push(lunch.flight_number)
            notifying_1h.push(lunch.name)
        }

        if (dt_s <= CONSTANT_VALUES.TIME_BLINK && precision == "hour" && !lunch.tbd && !lunch.net) {
            dt_str = COLOR.HUGE_SUCCESS("! "+clc.blink(dt_str))+COLOR.HUGE_SUCCESS(" !");
            date_h = COLOR.HUGE_SUCCESS(date_arr.bw.join(''));
        } else if (dt_s < 0) {
            dt_str = COLOR.INVALID(dt_str);
            date_h = COLOR.INVALID(date_arr.bw.join(''))+'{/}';
        } else {
            dt_str = time_style.c(dt_str)
            date_h = date_arr.col.join('');
        }
        precision = time_style.c(precision)
        
        return {
            name:           lunch.name,
            flight_number:  lunch.flight_number,
            date_precision: precision,
            tbd:            lunch.tbd,
            net:            lunch.net,
            date_h:         date_h,
            rocket:         ROCKETS[lunch.rocket],
            cores:          cores_str,
            launchpad:      lunchpad.name,
            launchpad_reg:  lunchpad.region,
            dt:             dt_str,
            payloads: {
                names_str: payload_names_str,
                customers_str: payload_customers_str
            }
        }
    });


    LUNCHES = LUNCHES.map(lunch => [
        COLOR.GENERIC(lunch.flight_number),
        COLOR.GENERIC(lunch.name),
        lunch.date_h,
        lunch.dt,
        String(lunch.date_precision),
        COLOR.DANGER((lunch.tbd ? "tbd" : "")+(lunch.net && lunch.tbd ? ", " : "")+(lunch.net ? "net" : "")),
        COLOR.GENERIC(lunch.rocket),
        COLOR.GENERIC(lunch.cores),
        COLOR.GENERIC(lunch.launchpad),
        // lunch.launchpad_reg
        COLOR.GENERIC(lunch.payloads.names_str),
        COLOR.GENERIC(lunch.payloads.customers_str)
    ])
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
    ],[ ' ', ' ', ' ', ' ', ' ', ' ', ' ',' ', ' ', ' ', ' '])
	return LUNCHES
}

var json_view = false;
//Keep these keybind listeners in main // Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', '', 'C-c', 'left'], (ch, key) => {
    if (screen.focused.name == "table" && key.name != 'left') {
        console.log('\033[?25h');
        return process.exit(0);
    } else if (screen.focused.name == "detailed_information") {
        table_element.setFront();
        table_element.focus();
        controls_element.setContent(STRING.CONTROLS.TABLE);
        screen.render();
    };
});
screen.key(['j'], (ch, key) => {
    json_view = (json_view ? false : true);
    information_element.setData(prettyPrintData(data_cache, idx, json_view));
    screen.render();
});
screen.key(['enter', 'right'], (ch, key) => {
    if (screen.focused.name == "table") {
        idx = table_element.getScroll()-2;
        if (idx >= 0) {
            status_element.setContent(String(data_cache[1][idx].name));
            information_element.setFront();
            information_element.focus();
            information_element.enableInput();
            information_element.setData(prettyPrintData(data_cache, idx, json_view));
            controls_element.setContent(STRING.CONTROLS.INFORMATION);
        };
    } else if (screen.focused.name == "detailed_information") {
        table_element.setFront();
        table_element.focus();
        controls_element.setContent(STRING.CONTROLS.TABLE);
    };
    screen.render();
});
screen.key(['r'], (ch, key) => {
    api_counter = 1;
});

var data_cache;
var api_counter = 1;

(async function(){
	// data_cache = await getData()
	// const TABLE = await formatData(await data_cache);
	// table_element.setData(TABLE);
    table_element.select(1);
    status_element.setContent(STRING.DOWNLOADING);
    countdown_element.setContent(STRING.DOWNLOADING_STAR);
    screen.render();
})()


async function main() {
    api_counter--;
	if (api_counter == 0) {
        status_element.setContent(STRING.DOWNLOADING);
        countdown_element.setContent(STRING.DOWNLOADING_STAR);
        screen.render();
        api_counter = API_REFRESH_CYCLES;
        data_cache = await getData();
    }
	if (data_cache) {
        var err_message = await formatErr(await data_cache);
        if (err_message == true) {            
            const TABLE = await formatData(await data_cache);
            const SCROLL = table_element.getScroll();
            table_element.setData(TABLE);
            table_element.select(SCROLL);
            err_message = [( (data_cache[1].length - (table_element.height - 4)) > 0 ? STRING.OK_SCROLL : STRING.OK_GENERIC)];
            if (notifying_1h.length > 0) {
                notifier.notify({
                    title:      STRING.H_WARNING,
                    message:    notifying_1h.join(' │ '),
                    icon:       path.join(__dirname, 'spacex.ico'),
                    appID:      STRING.APPID
                });
                notifying_1h = [];
            }
        }
        if (NONINTERACTIVE) {
            screen.remove(status_element);
            screen.remove(countdown_element);
            screen.remove(controls_element);
            const snip = 2; //Add offset incase you want to add in a line in a bash script (Press any key to continue thing.)
            table_element.height = screen.height-snip;
            screen.render();
            const screenshot = screen.screenshot().split('\n');
            screen.destroy();
            console.log('\x1b[H\x1b[J'+screenshot.slice(0,screenshot.length-snip-1).join('\n'));
            process.exit(0);
        }
        status_element.setContent(err_message[api_counter%err_message.length]);
        countdown_element.setContent("Next update in "+secondsHumanReadable(api_counter*SCREEN_REFRESH/1000));
    }
    screen.render();
};

console.log('\033[?25l');    //ANSI code - hide cursor
setInterval(main, SCREEN_REFRESH);



function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
} 