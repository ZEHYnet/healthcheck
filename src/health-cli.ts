const { get } = require('http')
const argv = require('optimist').argv;

var check = argv.check,
    debug = argv.debug,
    noError = argv["no-error"],
    host = argv.host || "127.0.0.1",
    port = argv.port || 8088,
    timeout = argv.timeout || 1e3

if(check) {
    send('Checking health... (host: ' + host + ', port: ' + port + ')');

    var request = get({
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
    if(!noError) {
        console.error(err);
    }
}

