#!/usr/bin/env node
const clc = require('cli-color');
const notifier = require('node-notifier');
const Diff = require('diff');
const path = require('path');
const isWsl = require('is-wsl');

const arguments = require('./tools/process-args').arguments;
const cli_elem = require('./tools/cli-elements');   //Idk js package structure/conventions...
const date_tools = require('./tools/date-tools');
const net_tools = require('./tools/net-tools');
const format_tools = require('./tools/format-tools');
const constants = require('./constants');

const COLOR = constants.GETCOLORS(clc);
const STRING = constants.GETSTRING(COLOR);
const CONSTANT_VALUES = constants.CONSTANT_VALUES;

var screen = cli_elem.screen;
var table_element = cli_elem.table_element;
var diff_table_element = cli_elem.diff_table_element;
var diff_json_element = cli_elem.diff_json_element;
var status_element = cli_elem.status_element;
var countdown_element = cli_elem.countdown_element;
var controls_element = cli_elem.controls_element;
var information_element = cli_elem.information_element;

const secondsHumanReadable = date_tools.secondsHumanReadable;

const getData = net_tools.getData;
const formatErr = net_tools.formatErr;

const prettyPrintData = format_tools.prettyPrintData;

//  =====================================

//TODO: better viewer (than json and the crappy one I made using only string manipulation.)

process.env.FORCE_COLOR = true;

// const SCREEN_REFRESH = 1000; //ms
// const API_REFRESH = 10*60*1000; //ms
const SCREEN_REFRESH = arguments.screen_refresh; //ms
const API_REFRESH = arguments.api_refresh; //ms
const API_REFRESH_CYCLES = API_REFRESH/SCREEN_REFRESH;
const NONINTERACTIVE = arguments.dump;
const BLINK = arguments.blink;
const ARCHIVE = arguments.archive;
//

var notified_1h = [];
var notifying_1h = [];

var ICON_PATH = path.join(__dirname, 'spacex.ico');
if (isWsl && ICON_PATH.startsWith("/mnt/",0)) {
    ICON_PATH = ICON_PATH.substr(5).replace("/",":/");
}

function selectData(arr) {
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
        var cores_str_ = "";
        lunch.cores.forEach(core_ => {
            cores_str += CORES[core_["core"]] ? (CORES[core_["core"]]["serial"] + '(' + CORES[core_["core"]]["reuse_count"] + ') ') : STRING.CORE_UNASSIGNED + '  ';
            cores_str_ += CORES[core_["core"]] ? (CORES[core_["core"]]["serial"] + '(' + CORES[core_["core"]]["reuse_count"] + ') ') : STRING.CORE_UNASSIGNED_ + '  ';
        });
        cores_str = cores_str.substr(0, cores_str.length-1);
        cores_str_ = cores_str_.substr(0, cores_str_.length-1);

        var time_style = {
            hour:       { p:"minutes",  c: COLOR.TIME.LT1 },
            day:        { p:"hours",    c: COLOR.TIME.LTD },
            month:      { p:"hours",    c: COLOR.TIME.LTM },
            quarter:    { p:"days",     c: COLOR.TIME.LTQ }, // use this symbol? ◔ ◑
            half:       { p:"days",     c: COLOR.TIME.LTH }
        }[precision]
        const dt_s = t_s - new Date().getTime() / 1000;
        const dt_str_ = secondsHumanReadable(dt_s,time_style.p);
        var dt_str;
        if (dt_s <= CONSTANT_VALUES.TIME_NOTIFY && precision === "hour" && !lunch.tbd && !lunch.net && !notified_1h.includes(lunch.flight_number)) { //Notify user.
            notified_1h.push(lunch.flight_number)
            notifying_1h.push(lunch.name)
        }

        if (dt_s <= CONSTANT_VALUES.TIME_BLINK && precision === "hour" && !lunch.tbd && !lunch.net) {
            dt_str = COLOR.HUGE_SUCCESS("! "+(BLINK ? COLOR.BLINK(dt_str_) : dt_str_))+COLOR.HUGE_SUCCESS(" !");
            date_h = COLOR.HUGE_SUCCESS(date_arr.bw.join(''));
        } else if (dt_s < 0) {
            dt_str = COLOR.INVALID(dt_str_);
            date_h = COLOR.INVALID(date_arr.bw.join(''))+'{/}';
        } else {
            dt_str = time_style.c(dt_str_)
            date_h = date_arr.col.join('');
        }
        const precision_ = precision;
        precision = time_style.c(precision)
        
        return {
            name:           lunch.name,
            flight_number:  String(lunch.flight_number),
            date_precision: precision,
            date_precision_:precision_,
            tbd:            lunch.tbd,
            net:            lunch.net,
            date_h:         date_h,
            date_h_:        date_arr.bw.join(''),
            rocket:         ROCKETS[lunch.rocket],
            cores:          cores_str,
            cores_:         cores_str_,
            launchpad:      lunchpad.name,
            launchpad_reg:  lunchpad.region,
            dt:             dt_str,
            dt_:            dt_str_,
            payloads: {
                names_str: payload_names_str,
                customers_str: payload_customers_str
            }
        }
    });
    return LUNCHES;
};

async function formatData(arr) {
    return format_tools.tabularizeData(selectData(arr));
};

var diff_table_content;
var diff_json_content;

var newData = false;
var json_view = false;
//Keep these keybind listeners in main // Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', '', 'C-c', 'left'], (ch, key) => {
    const name = screen.focused.name;
    if (name === "table" && key.name !== 'left') {
        console.log('\033[?25h');
        return process.exit(0);
    } else if (name === "detailed_information" || name === "diff_table" || name === "diff_json") {
        if (name === "diff_table" || name === "diff_json") {
            newData = false;
        };
        table_element.setFront();
        table_element.focus();
        controls_element.setContent(STRING.CONTROLS.TABLE);
        screen.render();
    };
});
screen.key(['j'], (ch, key) => {
    const name = screen.focused.name;
    if (name === "detailed_information") {
        json_view = (json_view ? false : true);
        information_element.setData(prettyPrintData(data_cache, idx, json_view));
    } else if (name === "diff_table") {
        json_view = true;
        diff_json_element.setFront();
        diff_json_element.focus();
        diff_json_element.enableInput();
    } else if (name === "diff_json") {
        json_view = false;
        diff_table_element.setFront();
        diff_table_element.focus();
        diff_table_element.enableInput();
    };
    screen.render();
});
screen.key(['d'], (ch, key) => {
    const name = screen.focused.name;
    if (name !== "diff_table" && name !== "diff_json") {
        // console.log(diff_table_content);
        // process.kill(process.pid)
        controls_element.setContent(STRING.CONTROLS.INFORMATION);
        if (json_view) {
            diff_json_element.setFront();
            diff_json_element.focus();
            diff_json_element.enableInput();
        } else {
            diff_table_element.setFront();
            diff_table_element.focus();
            diff_table_element.enableInput();
        };
    } else {
        table_element.setFront();
        table_element.focus();
        controls_element.setContent(STRING.CONTROLS.TABLE);
    };
    screen.render();
});
screen.key(['enter', 'right'], (ch, key) => {
    const name = screen.focused.name;
    if (name === "table") {
        idx = table_element.getScroll()-2;
        if (idx >= 0) {
            status_element.setContent(String(data_cache[1][idx].name));
            information_element.setFront();
            information_element.focus();
            information_element.enableInput();
            information_element.setData(prettyPrintData(data_cache, idx, json_view));
            controls_element.setContent(STRING.CONTROLS.INFORMATION);
        };
    } else if (key.name === 'enter' && (name === "detailed_information" || name === "diff_table" || name === "diff_json")) {
        if (name === "diff_table" || name === "diff_json") {
            newData = false;
        };
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
var checkDiff = true;
var firstRun = true;
var lastDelta = '';
var api_counter = 1;

(async function(){
	// data_cache = await getData()
	// const TABLE = await formatData(await data_cache);
	// table_element.setData(TABLE);
    table_element.select(1);
    status_element.setContent(STRING.DOWNLOADING);
    countdown_element.setContent(STRING.DOWNLOADING_STAR);
    diff_table_element.setData(diff_table_content ? diff_table_content : [['diff_table_content']]);

    screen.render();
})()


async function main() {
    api_counter--;
	if (api_counter === 0) {
        checkDiff = true;
        status_element.setContent(STRING.DOWNLOADING);
        countdown_element.setContent(STRING.DOWNLOADING_STAR);
        screen.render();
        api_counter = API_REFRESH_CYCLES;
        data_cache = await getData();
    }
	if (data_cache) {
        var err_message = await formatErr(await data_cache);
        if (err_message === true) {            
            const TABLE = await formatData(await data_cache);
            const SCROLL = table_element.getScroll();
            table_element.setData(TABLE);
            table_element.select(SCROLL);
            err_message = [( (data_cache[1].length - (table_element.height - 4)) > 0 ? STRING.OK_SCROLL : STRING.OK_GENERIC) + (newData ? ' | '+COLOR.WARNING(STRING.NEW_DATA) : '')+' '+lastDelta];
        };
        if (notifying_1h.length > 0) {
            notifier.notify({
                title:      STRING.H_WARNING,
                message:    notifying_1h.join(' │ '),
                icon:       ICON_PATH,
                appID:      STRING.APPID
            });
            notifying_1h = [];
        };
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
        

        if (checkDiff) {
            checkDiff = false;
            const path_prev_launches = path.join(CONSTANT_VALUES.DATA_PATH,'previous_data.json');
            const path_prev_launches_table = path.join(CONSTANT_VALUES.DATA_PATH,'previous_data_table.json');

            const curr_launches = data_cache[1];
            var prev_launches = net_tools.readFile(path_prev_launches);
            prev_launches = prev_launches !== '' ? JSON.parse(prev_launches) : [];
            
            diff_json_content = [[STRING.HEADERS.JSON],['']];
            // jsonDiff.diffString(prev_launches, curr_launches)
            //         .split('\n')
            //         .forEach(u => {diff_json_content.push([clc.cyan(u)])});
            const json_diff_data = Diff.diffJson(prev_launches, curr_launches)
            const changed = json_diff_data.some(chunk => {
                return chunk.added || chunk.removed;
            });

            if (changed || firstRun) {
                firstRun = false;
                
                json_diff_data.forEach(chunk => {
                    if (chunk.added && chunk.removed) {//Not sure if this case is possible.
                        chunk.value.split('\\n').forEach(line => {[diff_json_content.push([COLOR.WARNING(STRING.DIFF.BOTH_SYMBOL+'│  '+line)])]});
                    } else if (chunk.added) {
                        chunk.value.split('\\n').forEach(line => {[diff_json_content.push([COLOR.SUCCESS(STRING.DIFF.CURRENT_SYMBOL+'│  '+line)])]});
                    } else if (chunk.removed) {
                        chunk.value.split('\\n').forEach(line => {[diff_json_content.push([COLOR.DANGER(STRING.DIFF.PREVIOUS_SYMBOL+'│  '+line)])]});
                    } else {
                        chunk.value.replace(/\n/gm,"_NEWLINE_") //Why the frick doesn't my regexp work when it works in a tester???? Using this workaround.
                            .replace(/_NEWLINE_\s\s\{(.*?)_NEWLINE_\s\s\},/gm, '_NEWLINE_  [...]')
                            .replace(/_NEWLINE_\s\s\{(.*?)_NEWLINE_]/m, '_NEWLINE_  [...]_NEWLINE_]')
                            .split('_NEWLINE_')
                            .forEach(line => {line !== '' ? [diff_json_content.push([COLOR.GENERIC(STRING.DIFF.UNCHANGED_SYMBOL_+'│  '+line)])] : null});   //Trailing newline results in a empty line - need to filter it out.
                    };
                });
                diff_json_content.push([''])

                // console.log(json_diff_data);
                // process.kill(process.pid)
                // JSON.stringify((json_diff_data ? json_diff_data : ''),null,2)
                //         .split('\n')
                //         .forEach(u => {diff_json_content.push([clc.cyan(u)])});
                
                var prev_launches_table =  net_tools.readFile(path_prev_launches_table);
                const curr_launches_table = format_tools.tabularizeDiffData(await selectData(await data_cache));
                prev_launches_table = prev_launches_table !== '' ? JSON.parse(prev_launches_table) : Array(curr_launches_table.length).fill(Array(curr_launches_table[0].length).fill(''));
                diff_table_content = format_tools.diffTable(prev_launches_table,curr_launches_table)
                
                diff_table_element.setData(diff_table_content ? diff_table_content : [['diff_table_content']]);
                diff_json_element.setData(diff_json_content ? diff_json_content : [['diff_json_content']]);

                if (changed) {
                    const dateStr = new Date().toIsoArr().bw.join('');
                    lastDelta = '| '+STRING.LAST_DELTA+COLOR.GENERIC(dateStr);
                    newData = true;
                    notifier.notify({
                        title:      STRING.NEW_DATA,
                        message:    'Press d to see table diff. Press j to see JSON diff.',
                        icon:       ICON_PATH,
                        appID:      STRING.APPID
                    });
                    net_tools.writeFile(path_prev_launches, JSON.stringify(curr_launches));
                    net_tools.writeFile(path_prev_launches_table, JSON.stringify(curr_launches_table));
                    if (ARCHIVE) {
                        net_tools.writeFile(
                            path.join(CONSTANT_VALUES.DATA_PATH,'/archive/'+dateStr.replace(/:/g,'_').replace(' ','_')+'.json'),
                            JSON.stringify(curr_launches)
                        );
                        net_tools.writeFile(
                            path.join(CONSTANT_VALUES.DATA_PATH,'/archive/'+dateStr.replace(/:/g,'_').replace(' ','_')+'_table.json'),
                            JSON.stringify(curr_launches_table)
                        );
                    };
                };
            };
        };
    };
    screen.render();
};

console.log('\033[?25l');    //ANSI code - hide cursor
setInterval(main, SCREEN_REFRESH);