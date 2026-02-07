const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
// 解决跨域（前端能调用接口）
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 引入路由
const hotelRoutes = require('./routes/hotelRoutes');
app.use('/api/mobile', hotelRoutes);

// 根路由（验证服务启动）
app.get('/', (req, res) => {
  res.send('易宿酒店后端服务已启动！');
});

// 启动服务
const PORT = process.env.PORT || 10086;
app.listen(PORT, () => {
  console.log(`✅ 后端服务运行在：http://localhost:${PORT}`);
  console.log(`🔍 测试接口：http://localhost:${PORT}/api/mobile/hotels/1/detail?check_in=2026-02-08&check_out=2026-02-10`);
});