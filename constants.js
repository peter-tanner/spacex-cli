const clc = require('cli-color');

const arguments = require('./tools/process-args').arguments;

if (arguments.color) {
    this.STYLES = {scrollbar: {bg: 'blue'}}
} else {
    this.STYLES = {scrollbar: {bg: 'white'}}
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

this.CONSTANT_VALUES = {
    TIME_NOTIFY: 60*60*24*7,    //FIXME: TESTING VALUES - Change to 60*90
    TIME_BLINK:  60*60*24*7     //FIXME: TESTING VALUES - Change to 60*60*24
}

this.GETCOLORS = ((clc_) => {
    var COLOR = {
        NONE:           ((t) => {return t}),
        GENERIC:        clc_.cyan,
        SUCCESS:        clc_.green,
        HUGE_SUCCESS:   clc_.green.bold,
        WARNING:        clc_.yellow,
        DANGER:         clc_.red.bold,
        INVALID:        clc_.blackBright.bold,
        PROGRESS:       clc_.yellow,
        HEADER:         clc_.underline,
        TIME: {
            LT1: clc_.green,
            LTD: clc_.green,
            LTM: clc_.yellow,
            LTQ: clc_.blackBright.bold,
            LTH: clc_.blackBright.bold
        }
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
            CORE:               COLOR_.HEADER("Core (№. reused)"),
            LAUNCHPAD:          COLOR_.HEADER("Launchpad"),
            LAUNCHPAD_REG:      COLOR_.HEADER("Launch region"),
            PAYLOAD_NAME:       COLOR_.HEADER("Payloads"),
            PAYLOAD_CUSTOMERS:  COLOR_.HEADER("Payload customers"),
        },
        CONTROLS: {
            TABLE: '↑↓ Scroll and select | ↵ → Select launch | r Refresh | q Quit',
            INFORMATION: '↑↓ Scroll | q ↵ ← Return to table | j Toggle JSON view'
        },

        CORE_UNASSIGNED: COLOR_.INVALID("Unknown"),

        DOWNLOADING:        COLOR_.PROGRESS("Downloading new data from spacex api . . .",),
        DOWNLOADING_STAR:   COLOR_.PROGRESS("*"),

        OK_GENERIC: COLOR_.SUCCESS("OK."),
        OK_SCROLL:  COLOR_.SUCCESS("OK.   [!] Warning: Scroll down to view more"),

        H_WARNING:  "SpaceX launches imminent!",

        APPID:          'spacex-cli',
        SCREEN_TITLE:   'Spacex - Upcoming lunches',
    };
})