const clc = require('cli-color');

this.prettyPrintData = ((data_cache, idx, json_view) => {
    var data = Object.assign({},data_cache[1][idx]);
    if (json_view) {
        var output = [[clc.underline('Key/Value')]];
        JSON.stringify(data,null,2)
            .split('\n')
            .forEach(u => {output.push([clc.cyan(u)])});
        return output
    }
    // data.rocket = data_cache[2].filter((rocket) => rocket.id == data.rocket) //I'm lazy right now - was going to add in some features to view the 'hashes' (other elements such as cores, rocket type, etc.), but holding off on it.
    // console.log(JSON.stringify(data,null,2))
    var output = [[clc.underline('Property'),clc.underline('Value')]];
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
            output.push([clc.yellow(val[0]),clc.cyan(val[1] ? val[1].replace(/,$/, '') : '')]);
        });
    return output;
});