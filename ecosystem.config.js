module.exports = {
  apps: [
    {
      name: "stake-core-api",
      script: "./dist/server.js",
      instances: "max",        // Cluster mode scales to all available CPU cores
      exec_mode: "cluster",     // Run in cluster mode for maximum throughput
      watch: false,             // Do not watch in production to avoid random reloads
      max_memory_restart: "1G", // Restart instance if memory exceeds 1GB
      kill_timeout: 10000,      // Graceful shutdown wait time of 10s before hard kill
      listen_timeout: 8000,     // Time PM2 waits for the "ready" signal from server
      env: {
        NODE_ENV: "development",
        PORT: 3000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000
      },
      error_file: "./logs/pm2-api-err.log",
      out_file: "./logs/pm2-api-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true
    }
  ]
};
