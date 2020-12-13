const http = require('http');
const argv = require('minimist')(process.argv.splice(2));

var check = argv.check,
    debug = argv.debug,
    quite = argv.quite || false,
    host = argv.host || "127.0.0.1",
    port = argv.port || 8088,
    timeout = argv.timeout || 2e3 // 2s

if(check) {
    if(debug) {
        let package = require('../package.json');
        send('Running ' + package.name + ' v' + package.version);
    }
    send('Checking health... (host: ' + host + ', port: ' + port + ')');

    var request = http.get({
        host: host,
        port: port,
        method: 'GET',
        timeout: timeout
    }, (res: any) => {
        if(res.statusCode) {
            if(res.statusCode == 200) {
                send('Receive code 200. Healthy.');
                process.exit(0);
            }
        }
        send('Receive code ' + (res.statusCode ? res.statusCode : 'unknown') + '. Unhealthy.');
        process.exit(1);
    });

    request.on('timeout', () => {
        send('Request timed out. Unhealthy.');
        process.exit(1);
    });

    request.on('error', (err: any) => {
        error(err);
        send('Got error: ' + err.message + '. Unhealthy.')
        process.exit(1);
    });

    process.on('error', (err) => {
        error(err);
        send('Got error: ' + err.message + '. Unhealthy.')
        process.exit(1);
    });

    setTimeout(() => {
        send('Program don\'t responds after ' + ((timeout + 5000) / 1000).toFixed(2) + ' seconds. Unhealthy.');
        process.exit(1);
    }, timeout + 5000);

} else {
    console.log('Usage: health --check');
}

function send(msg: any) {
    if(debug) {
        console.log(msg);
    }
}

function error(err: any) {
    if(!quite) {
        console.error(err);
    }
}

