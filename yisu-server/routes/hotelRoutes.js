const express = require('express');
const router = express.Router();

// 酒店详情接口
router.get('/hotels/:hotel_id/detail', async (req, res) => {
  try {
    const { hotel_id } = req.params;
    const { check_in, check_out } = req.query;

    // 模拟酒店数据（不用数据库，先保证能返回）
    const hotelDetail = {
      hotelId: hotel_id,
      name: `易宿酒店${hotel_id}`,
      star: 4,
      address: "上海市浦东新区张江高科技园区博云路2号",
      phone: "021-12345678",
      facilities: ["免费WiFi", "24小时热水", "早餐"],
      images: [
        "https://img95.699pic.com/photo/50042/0407.jpg_wh300.jpg!/fh/300/quality/90",
        "https://picx1.zhimg.com/v2-0d3ffd77895a8f4eb7598ae5b52e0bf3_720w.jpg?source=172ae18b",
        "https://img95.699pic.com/photo/50042/0406.jpg_wh860.jpg"
      ],
      roomTypes: [
        { roomTypeId: "1", name: "标准大床房", price: 399 },
        { roomTypeId: "2", name: "豪华双床房", price: 499 }
      ],
      checkIn: check_in,
      checkOut: check_out
    };

    res.status(200).json({
      code: 200,
      msg: "查询成功",
      data: hotelDetail
    });
  } catch (error) {
    res.status(500).json({ code: 500, msg: "查询失败", error: error.message });
  }
});

module.exports = router;