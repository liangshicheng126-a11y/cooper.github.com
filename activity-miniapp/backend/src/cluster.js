// src/cluster.js - 多进程启动入口（生产环境用）
// 启动方式：node src/cluster.js
// 开发环境继续用：npm run dev（nodemon src/app.js，单进程方便调试）
require('dotenv').config()
const cluster = require('cluster')
const os      = require('os')
const logger  = require('./utils/logger')
const { connectRedis } = require('./config/redis')

function startCluster() {
  // 生产环境用全部核心，开发/测试用 2 个核心
  const WORKERS = process.env.NODE_ENV === 'production'
    ? os.cpus().length
    : Math.min(2, os.cpus().length)

  if (cluster.isPrimary) {
    logger.info(`🚀 Master ${process.pid} 启动，共 ${WORKERS} 个 Worker（CPU 核心数: ${os.cpus().length}）`)

    if (process.env.START_REMINDER_JOB !== '0') {
      connectRedis()
        .catch(e => logger.warn(`Reminder Redis init failed: ${e.message}`))
        .finally(() => require('./jobs/reminderJob'))
    }

    // 启动所有 Worker
    for (let i = 0; i < WORKERS; i++) {
      cluster.fork({ CLUSTER_WORKER: '1' })
    }

    // Worker 崩溃时自动重启
    cluster.on('exit', (worker, code, signal) => {
      logger.error(`❌ Worker ${worker.process.pid} 退出（code: ${code}, signal: ${signal}），正在重启...`)
      cluster.fork({ CLUSTER_WORKER: '1' })
    })

    // 定期打印集群状态
    setInterval(() => {
      const workers = Object.keys(cluster.workers).length
      logger.info(`📊 集群状态：${workers}/${WORKERS} 个 Worker 运行中`)
    }, 60000)
  } else {
    // Worker 进程：启动 Express app
    require('./app').start()
    logger.info(`✅ Worker ${process.pid} 已启动`)
  }
}

if (require.main === module) {
  startCluster()
}

module.exports = { startCluster }
