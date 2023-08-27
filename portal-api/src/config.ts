// https://github.com/node-config/node-config
import config from 'config';

interface PortalConfig {
    database: {
        host: string
        port: number
        user: string
        password: string
        database: string
    };
}
const portalConfig: PortalConfig = {
    database: {
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        user: config.get<string>('database.user'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.database')
    }
};

export default portalConfig;