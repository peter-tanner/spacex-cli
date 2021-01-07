const mri = require("mri");
const clc = require("cli-color");

this.arguments = mri(process.argv, {
    boolean:    ["help", "color"],
    string:     ['api_refresh', 'screen_refresh'],
    default: {
        api_refresh:    String(10*60*1000),
        help:           false,
        screen_refresh: String(1000),
        color:          true,
        dump:           false,
        blink:          false,
        archive:        false,
        path:           '~/.spacexcli',
        notify_time:    String(5400),
        highlight_time: String(86400),
    },
    alias: {
        api_refresh:    "a",
        help:           "h",
        screen_refresh: "s",
        color:          "c",
        dump:           "d",
        blink:          "b",
        archive:        "v",
        path:           "p",
        notify_time:    "n",
        highlight_time: "g",
    }
});

[
    's', 'screen_refresh',
    'a', 'api_refresh',
    'n', 'notify_time',
    'g', 'highlight_time',
].forEach(idx => {
    if (idx === 'a' || idx === 'api_refresh') {
        if (this.arguments[idx] < 30*1000) {
            this.arguments[idx] = 30*1000    // No spam pls!
        }
    }
    this.arguments[idx] = parseInt(this.arguments[idx])
});

if (this.arguments.help) {
    console.log(`
Usage:
    spacex-cli
    spacex-cli [-a <polling interval>] | [-h] | [-s <polling interval>] | [-d] | [-b]
    spacex-cli [--api_refresh=<polling interval>] | [--help] | [--screen_refresh=<polling interval>] | [--dump] | [--blink]

Options:
    -h, --help              Show this help information.
    -s, --screen_refresh    Screen refresh interval in milliseconds. How often time-based information updates [default: 1000]
    -a, --api_refresh       API refresh interval in milliseconds. How often we poll the api for new/updated information. Please don't use small values! [default: 600000]
    -c, --color             Print with color [default: true]
    -d, --dump              Non-interactive mode - dumps the main launches table [default: false]
    -b, --blink             Blink for close launches. This argument exists because I know some people hate blink [default: false]
    -v, --archive           Archive launch data when changed [default: false]
    -p, --path              Application directory [default: ~/.spacexcli]
    -n, --notify_time       At this amount of seconds remaining until launch, send a notification [default: 5400]
    -g, --highlight_time    At this amount of seconds remaining until launch, highlight the row in the table view [default: 86400]

Current configuration:`);
    var arguments_ = this.arguments;
    delete arguments_._;
    console.log(JSON.stringify(arguments_)
                    .replace('{','')
                    .replace('}','')
                    .replace(/,/g,'\n    ')
                    .replace(/:/g, ': ')
                    .replace(/true/g,clc.green('true'))
                    .replace(/false/g,clc.red('false'))
                    .replace(/^/g,'    ')
    )
    process.exit(0);
};