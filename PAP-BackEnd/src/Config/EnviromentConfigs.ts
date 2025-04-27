interface AppConfig {
    DB_Host: string
    DB_Port: number
    DB_User: string
    DB_Password: string
}


const config: Record<string, AppConfig> = {

    // Im aware i have credentials here. 
    // These tests ran in a local network, there is no issue with having them here

    // APP CONFIGS
    production: {
        DB_Host: 'dinnerlink',
        DB_Port: 3306,
        DB_User: 'gabs',
        DB_Password: '1907',
    },

    // Development configs
    development: {
        DB_Host: 'dinnerlink',
        DB_Port: 3306,
        DB_User: 'gabs',
        DB_Password: '1907',
    },
};

const env = process.env.NODE_ENV || 'development';

export default config[env];