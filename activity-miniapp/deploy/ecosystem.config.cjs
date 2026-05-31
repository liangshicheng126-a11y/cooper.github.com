/** PM2 进程配置 — 在服务器 backend 目录执行：pm2 start ../deploy/ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: 'activity-miniapp-api',
      cwd: __dirname + '/../backend',
      script: 'src/cluster.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      max_memory_restart: '512M',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      time: true,
    },
  ],
}
