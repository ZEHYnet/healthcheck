import { createServer, IncomingMessage, RequestListener, Server, ServerResponse } from 'http';

export class HealthServer {

    options: IServerConfig;
    server: Server;

    healthy = true;
    reason: Object | string = undefined;

    constructor(options: IServerConfig) {
        this.options = Object.assign({
            port: 8088,
            log: (msg: string) => { console.log(msg); },
            error: (err: string | Error) => { console.error(err); }
        }, options);
        this.server = createServer(this.handler);
        this.server.on('error', (err: IError) => {
            if(err.code && err.code === 'EADDRINUSE') {
                this.options.error('Port \'' + this.options.port + '\' is already in use.')
            }
            this.options.error(err);
        });
        this.server.on('listening', () => {
            this.options.log('HealthServer started on port ' + this.options.port);
        });
    }

    listen(): Server {
        return this.server.listen(this.options.port);
    }

    setHealthy(healthy = false, reason?: Object | string): void {
        this.healthy = healthy;
        this.reason = reason ? reason : undefined;
    }

    unhealthy(error: Object | string) {
        this.setHealthy(false, error);
    }

    isHealthy() {
        return this.healthy;
    }

    private handler: RequestListener = (req: IncomingMessage, res: ServerResponse) => {
        res.writeHead(this.healthy ? 200 : 500, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({success: this.healthy, error: this.reason}));
        res.end();
    }

}

interface IServerConfig {
    port?: number;
    log?: (msg: string) => void;
    error?: (error: string | Error) => void;
}

interface IError extends Error {
    code?: string;
}