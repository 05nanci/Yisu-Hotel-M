# 后端代码修改方案

## 问题描述
价格每次打开都不一样，这是因为后端在获取酒店详情时，使用了随机数生成价格，而不是从数据库获取真实的价格数据。

## 修改文件
`D:\github\Yisu-Hotel-backend-y\src\services\mobile\hotel.js`

## 修改内容

### 1. 修改价格获取逻辑
将随机生成价格的逻辑替换为从数据库获取真实价格的逻辑：

```javascript
// 修改前
// 生成未来30天的价格
const prices = [];
const today = new Date();
for (let i = 0; i < 30; i++) {
  const date = new Date(today);
  date.setDate(date.getDate() + i);
  const dateString = date.toISOString().split('T')[0];
  prices.push({
    date: dateString,
    price: Math.floor(300 + Math.random() * 200) // 模拟价格
  });
}

// 修改后
// 从数据库获取价格
const roomPrices = await RoomPrice.findAll({
  where: { room_type_id: roomType.id },
  attributes: ['price_date', 'price']
});

// 转换为前端需要的格式
const prices = roomPrices.map(rp => ({
  date: rp.price_date,
  price: rp.price
}));

// 如果数据库中没有价格，使用默认价格
if (prices.length === 0) {
  prices.push({
    date: new Date().toISOString().split('T')[0],
    price: 259.00 // 默认价格
  });
}
```

### 2. 重启后端服务器
修改完成后，需要重启后端服务器，确保修改后的代码生效：

```bash
# 在后端目录执行
node app.js
```

## 修改效果
修改后，后端将从数据库中获取真实的价格数据，而不是生成随机价格，确保价格每次打开都保持一致。

## 注意事项
1. 确保数据库中已经存在价格数据，如果没有，可以通过运行数据库种子脚本生成：
   ```bash
   # 在后端目录执行
   node database/seed-database.js
   ```

2. 确保RoomPrice模型已经正确导入，从文件顶部的导入语句可以看到，RoomPrice已经被导入了：
   ```javascript
   const { Hotel, HotelFacility, HotelService, HotelPolicy, RoomType, RoomPrice, HotelReview, Facility, Service } = require('../../models');
   ```

3. 修改后，前端的酒店详情页面和预订确认页面都将显示一致的价格，解决了价格不一致的问题。