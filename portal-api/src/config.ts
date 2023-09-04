// https://github.com/node-config/node-config
import config from 'config';

interface PortalConfig {
    port: number,
    database: {
        host: string
        port: number
        user: string
        password: string
        database: string
    };
}
const portalConfig: PortalConfig = {
    port: config.get<number>('port'),
    database: {
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        user: config.get<string>('database.user'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.database')
    }
};

export default portalConfig;