const fetch = require('node-fetch');

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