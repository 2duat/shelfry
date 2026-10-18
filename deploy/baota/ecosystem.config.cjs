// 宝塔「Node 项目」一般会自动生成 PM2 配置；
// 如果你直接用终端管理，可以执行：pm2 start deploy/baota/ecosystem.config.cjs
const path = require('path')

module.exports = {
  apps: [
    {
      name: 'shelfry',
      cwd: path.resolve(__dirname, '../..'),
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 127.0.0.1 -p 3000',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '900M',
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      merge_logs: true,
      time: true,
    },
  ],
}
