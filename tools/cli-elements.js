const clc = require('cli-color');
const blessed = require('neo-blessed');

const arguments = require('./process-args')
const constants = require('../constants');

const COLOR = constants.GETCOLORS(clc);
const STRING = constants.GETSTRING(COLOR);
const STYLES = constants.STYLES;

const control_element_width = constants.CONTROL_MAX_WIDTH+8;

this.screen = blessed.screen({
    smartCSR: true,
	dockBorders: true,
    autoPadding: true,
});

this.screen.title = STRING.SCREEN_TITLE;

const countdown_element_width = Math.floor(this.screen.width * 0.2) > 54 ? Math.floor(this.screen.width * 0.2) : 54;

this.table_element = blessed.listtable({
	parent: this.screen,
    border: 'line',
    align: 'center',
    keys: true,
    width: "100%",
    height: this.screen.height-2,
    name: 'table',
    tags: true,
    style: {
        scrollbar: STYLES.scrollbar
    },
    scrollbar: !arguments.dump,
    invertSelected: true,
});

this.status_element = blessed.box({
	position : {
        top: this.screen.height-3,
        width: '100%',
        left: '0%'
	},
    padding: {
        left:2,
    },
    align: 'left',
    height: 3,
	tags: true,
	border: 'line',
});

this.countdown_element = blessed.box({
	position : {
        top: this.screen.height-3,
        width: countdown_element_width+1,
        left: this.screen.width-(countdown_element_width+control_element_width)
    },
    align: 'center',
    height: 3,
	tags: true,
	border: 'line',
});

this.controls_element = blessed.box({
	position : {
        top: this.screen.height-3,
        width: control_element_width,
        left: this.screen.width-control_element_width,
    },
    padding: {
        left:2,
        right:2
    },
    align: 'center',
    height: 3,
	tags: true,
    border: 'line',
    content: STRING.CONTROLS.TABLE
});

this.information_element = blessed.listtable({//blessed.box({
    align: 'left',
    position: {
        width: '100%',
        height: this.screen.height-2,
    },
    padding: {
        left: 2
    },
    style: {
        scrollbar: STYLES.scrollbar
    },
    tags: true,
    scrollbar: true,
    scrollable: true,
    border: 'line',
    keys: true,
	parent: this.screen,
    invertSelected: true,
    name: 'detailed_information'
});


this.diff_json_element = blessed.listtable({//blessed.box({
    align: 'left',
    position: {
        width: '100%',
        height: this.screen.height-2,
    },
    style: {
        scrollbar: STYLES.scrollbar
    },
    tags: true,
    scrollbar: true,
    scrollable: true,
    border: 'line',
    keys: true,
	parent: this.screen,
    invertSelected: true,
    name: 'diff_json'
});

this.diff_table_element = blessed.listtable({
	parent: this.screen,
    border: 'line',
    align: 'center',
    keys: true,
    width: "100%",
    height: this.screen.height-2,
    name: 'diff_table',
    tags: true,
    style: {
        scrollbar: STYLES.scrollbar
    },
    scrollbar: true,
    invertSelected: true,
});

this.screen.append(this.status_element);
this.screen.append(this.countdown_element);
this.screen.append(this.controls_element);
this.screen.append(this.information_element);
this.screen.append(this.diff_table_element);
this.screen.append(this.table_element);
this.table_element.setFront();
this.table_element.focus();

// var selected_idx = 1;
// let table_len = 1
// this.screen.key(['up'], function(ch, key) {
// 	if (selected_idx > 0) {
// 		selected_idx++;
// 	}
// });
// this.screen.key(['down'], function(ch, key) {
// 	if (selected_idx < table_len) {
// 		selected_idx++;
// 	}
// 	// console.log(selected_idx)
// });


// const spinner_states = ['|','/','-','\\'];