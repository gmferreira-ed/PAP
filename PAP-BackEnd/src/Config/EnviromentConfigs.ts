interface AppConfig {
    DB_Host: string
    DB_User: string
    DB_Password: string
}


const config: Record<string, AppConfig> = {

    // Im aware i have credentials here. 
    // These tests ran in a local network, there is no issue with having them here

    // APP CONFIGS
    production: {
        DB_Host: 'localhost',
        DB_User: 'root',
        DB_Password: '',
    },

    // Development configs
    development: {
        DB_Host: 'localhost',
        DB_User: 'root',
        DB_Password: '',
    },
};

const env = process.env.NODE_ENV || 'development';

export default config[env];