const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { CONSTANT_VALUES } = require('../constants');

async function fetchURLJSON(url) {
    var resp;
    try {
        resp = await fetch(url)
            .then(res => res.json())
            .then(json => {return json});
    } catch(err) {
        resp = { error : "Error getting data from '"+url+"' : "+err.name };
    };
    return resp;
};

this.writeFile = ((path_, data) => {
    const dir = path_.substring(0, path_.lastIndexOf(path.sep));
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true }, (e) => {
            if (e) {
                throw e;
            };
        });
    };
    fs.writeFileSync(path_, data, function(e) {
        if (e) {
            throw e;
        };
    }); 
});

this.readFile = (path_ => {
    if (fs.existsSync(path_)) {
        return fs.readFileSync(path_, { encoding: 'utf-8' }, (e,data) => {
            if (e) {
                throw e;
            } else {
                return data;
            };
        });
    } else {
        return '';   //Fail silently - for first-time run where the file doesn't exist.
    };
});

this.getData = async function() {
    const LUNCHPADS_RESP = await fetchURLJSON('https://api.spacexdata.com/v4/launchpads');
    const LUNCHES_RESP = await fetchURLJSON('https://api.spacexdata.com/v4/launches/upcoming');
	const ROCKETS_RESP = await fetchURLJSON('https://api.spacexdata.com/v4/rockets');
	const PAYLOADS_RESP = await fetchURLJSON('https://api.spacexdata.com/v4/payloads');
    const CORES_RESP = await fetchURLJSON('https://api.spacexdata.com/v4/cores');
	return [LUNCHPADS_RESP, LUNCHES_RESP, ROCKETS_RESP, PAYLOADS_RESP, CORES_RESP];
};

this.formatErr = async function(data_cache) {
    err = [];
    data_cache.forEach(data => {
        // console.log(data.error);
        if (data.error != null) {
            err.push(data.error);
        };
    });
    if (err.length > 0) {
        return err;
    } else {
        return true;
    };
};