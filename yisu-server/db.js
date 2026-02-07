// 引入PostgreSQL的连接池和环境变量
const { Pool } = require('pg');
require('dotenv').config();

// 创建连接池（复用连接，比单次连接高效）
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// 测试数据库连接（可选，启动时验证）
pool.connect((err, client, release) => {
  if (err) {
    return console.error('数据库连接失败：', err.stack);
  }
  console.log('✅ PostgreSQL 数据库连接成功！');
  release(); // 释放连接
});

// 导出连接池，供app.js接口使用
module.exports = pool;