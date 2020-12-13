import { createServer, IncomingMessage, RequestListener, Server, ServerResponse } from 'http';

export class HealthServer {

    options: IServerConfig;
    server: Server;

    healthy = true;

    constructor(options: IServerConfig) {
        this.options = Object.assign({
            port: 8088,
            log: (msg: string) => { console.log(msg); },
            error: (err: string | Error) => { console.error(err); }
        }, options);
        this.server = createServer(this.handler);
        this.server.on('error', (err: Error) => {
            this.options.error(err);
        });
        this.server.on('listening', () => {
            this.options.log('HealthServer started on port ' + this.options.port);
        });
    }

    listen(): Server {
        return this.server.listen(this.options.port);
    }

    setHealthy(healthy = false): void {
        this.healthy = healthy;
    }

    unhealthy(error: Error | string) {
        
    }

    private handler: RequestListener = (req: IncomingMessage, res: ServerResponse) => {
        res.writeHead(this.healthy ? 200 : 500, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({success: this.healthy}));
        res.end();
    }

}

interface IServerConfig {
    port?: number;
    log?: (msg: string) => void;
    error?: (error: string | Error) => void;
}