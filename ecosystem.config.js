/**
 * PM2 Ecosystem Configuration
 * 
 * Usage:
 *   Development: pm2 start ecosystem.config.js --env development
 *   Production:  pm2 start ecosystem.config.js --env production
 *   
 * Commands:
 *   pm2 status          - View all processes
 *   pm2 logs tour-api   - View logs
 *   pm2 restart tour-api - Restart application
 *   pm2 stop tour-api   - Stop application
 *   pm2 delete tour-api - Remove from PM2
 */

module.exports = {
    apps: [
        {
            name: 'tour-api',
            script: 'dist/main.js',
            instances: 'max', // Use all CPU cores
            exec_mode: 'cluster', // Enable cluster mode for load balancing

            // Auto restart settings
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',

            // Logging
            log_file: './logs/combined.log',
            out_file: './logs/out.log',
            error_file: './logs/error.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,

            // Environment variables (default)
            env: {
                NODE_ENV: 'development',
                PORT: 3000,
            },

            // Production environment
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,
            },

            // Graceful shutdown
            kill_timeout: 5000,
            wait_ready: true,
            listen_timeout: 10000,

            // Restart delay for stability
            restart_delay: 1000,

            // Exponential backoff restart delay
            exp_backoff_restart_delay: 100,
        },
    ],
};
