const os = require('os');
const clc = require('cli-color');

const arguments = require('./tools/process-args').arguments;

if (!arguments.dump) {
    if (arguments.color) {
        this.STYLES = {scrollbar: {bg: 'blue'}};
    } else {
        this.STYLES = {scrollbar: {bg: 'white'}};
    };
} else {
    this.STYLES = {scrollbar: null};
};

const override_deep = (o,v) => {
    var o_ = {}
    Object.keys(o).forEach(k => {
        if (typeof o[k] === 'object') {
            o_[k] = override_deep(o[k],v);
        } else {
            o_[k] = v;
        }
    })
    return o_
};

this.CONTROL_MAX_WIDTH = 0;
const registerKeys = ((keys, actions) => {
    var strArr = [];
    for (i = 0; i < keys.length; ++i) {
        if (arguments.color) {
            strArr.push(keys[i]+' '+clc.underline(actions[i]));
        } else {
            strArr.push(keys[i]+' '+actions[i]);
        };
    };
    const str = strArr.join(' | ');
    const d = arguments.color ? 9 : 0;
    if (str.length - i*d > this.CONTROL_MAX_WIDTH) {
        this.CONTROL_MAX_WIDTH = str.length - i*d;
    };
    return str;
});

this.CONSTANT_VALUES = {
    TIME_NOTIFY:    arguments.notify_time,//60*60*24*7,
    TIME_BLINK:     arguments.highlight_time,
    DATA_PATH:      arguments.path.replace('~',os.homedir),
}

this.GETCOLORS = ((clc_) => {
    var COLOR = {
        NONE:           ((t) => {return t}),
        BLINK:          clc_.blink,
        GENERIC:        clc_.cyan,
        SUCCESS:        clc_.green,
        HUGE_SUCCESS:   clc_.green.bold,
        WARNING:        clc_.yellow,
        DANGER:         clc_.red.bold,
        INVALID:        clc_.blackBright.bold,
        PROGRESS:       clc_.yellow,
        HEADER:         clc_.magentaBright.underline,
        TIME: {
            LT1: clc_.green,
            LTD: clc_.green,
            LTM: clc_.yellow,
            LTQ: clc_.blackBright.bold,
            LTH: clc_.blackBright.bold
        },
    };
    
    if (!arguments.color) {
        COLOR = override_deep(COLOR, ((t) => {return t}))
    };

    return COLOR
});

this.GETSTRING = ((COLOR_) => {
    return {
        HEADERS: {
            FLIGHT_NUMBER:      COLOR_.HEADER("Flight №"),
            NAME:               COLOR_.HEADER("Launch name"),
            DATE_H:             COLOR_.HEADER("Date"),
            DT:                 COLOR_.HEADER("Time remaining until launch"),
            PRECISION:          COLOR_.HEADER("Precision"),
            FLAGS:              COLOR_.HEADER("Flags"),
            ROCKET:             COLOR_.HEADER("Rocket type"),
            CORE:               COLOR_.HEADER("Core(№ of reuses)"),
            LAUNCHPAD:          COLOR_.HEADER("Launchpad"),
            LAUNCHPAD_REG:      COLOR_.HEADER("Launch region"),
            PAYLOAD_NAME:       COLOR_.HEADER("Payloads"),
            PAYLOAD_CUSTOMERS:  COLOR_.HEADER("Payload customers"),

            JSON:               COLOR_.HEADER('Key/Value'),
            KEY:                COLOR_.HEADER('Property'),
            VALUE:              COLOR_.HEADER('Value'),
        },
        CONTROLS: {
            TABLE:          registerKeys(['↑↓',                '↵ →',           'r',       'q',    'd'   ],
                                         ['Scroll and select', 'Select launch', 'Refresh', 'Quit', 'Diff']),
            INFORMATION:    registerKeys(['↑↓',     'q ↵ ←',           'j'               ],
                                         ['Scroll', 'Return to table', 'Toggle JSON view']),
            DIFF:           registerKeys(['↑↓',     'q ↵ ←'          ],
                                         ['Scroll', 'Return to table'])
        },

        CORE_UNASSIGNED:    COLOR_.INVALID("Unknown"),
        CORE_UNASSIGNED_:   "Unknown",

        DOWNLOADING:        COLOR_.PROGRESS("Downloading new data from spacex api . . .",),
        DOWNLOADING_STAR:   COLOR_.PROGRESS("*"),

        OK_GENERIC: COLOR_.SUCCESS("OK."),
        OK_SCROLL:  COLOR_.SUCCESS("OK.   [!] Scroll to view more"),
        LAST_DELTA: COLOR_.GENERIC('Last Δ: '),

        H_WARNING:  "SpaceX launches imminent!",
        NEW_DATA:   "New SpaceX data downloaded!",

        APPID:          'spacex-cli',
        SCREEN_TITLE:   'Spacex - Upcoming lunches',

        DIFF: {
            PREVIOUS:           'prev',
            CURRENT:            'curr',
            PREVIOUS_SYMBOL:    '[-]',
            CURRENT_SYMBOL:     '[+]',
            BOTH_SYMBOL:        '[±]',
            UNCHANGED_SYMBOL:   '[=]',
            UNCHANGED_SYMBOL_:  '   '
        }
    };
})