// src/pages/hotel-detail/index.jsx
/*import { useState, useEffect } from 'react'
import { getCurrentInstance } from '@tarojs/taro'
import { View, Text, Image, Button } from '@tarojs/components' // 移除了 Loading 和 Toast
import './index.less'

export default function HotelDetail() {
  // 1. 兼容获取参数（兜底方案）
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1])
  const hotel_id = urlParams.get('hotel_id') || '1'
  const check_in = urlParams.get('check_in') || '2026-02-08'
  const check_out = urlParams.get('check_out') || '2026-02-10'

  // 2. 状态管理
  const [hotelData, setHotelData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 3. 强制模拟数据，跳过接口请求
  useEffect(() => {
    console.log('获取到的参数：', { hotel_id, check_in, check_out })
    setTimeout(() => {
      setHotelData({
        id: Number(hotel_id),
        name: `易宿精品酒店（ID:${hotel_id}）`,
        price: 299 + Number(hotel_id) * 50,
        score: 4.8,
        address: '北京市朝阳区建国路88号',
        cover: 'https://img95.699pic.com/photo/50042/0407.jpg',
        description: `这是ID为${hotel_id}的酒店详情，入住：${check_in}，离店：${check_out}`
      })
      setLoading(false)
    }, 500)
  }, [hotel_id, check_in, check_out])

  // 4. 简化渲染，移除所有依赖组件
  return (
    <View className="hotel-detail-page" style={{ padding: '20px', minHeight: '100vh', background: '#f7f8fa' }}>
      {loading && <Text style={{ textAlign: 'center', marginTop: '50px' }}>加载中...</Text>}
      {error && <Text style={{ color: '#f56c6c', margin: '10px 0' }}>⚠️ {error}</Text>}

      {!loading && (
        <View>
          <View style={{ background: '#fff', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
            <Text>入住：{check_in} | 离店：{check_out}</Text>
          </View>

          <Image
            style={{ width: '100%', height: '220px', borderRadius: '8px', marginTop: '12px' }}
            src={hotelData?.cover || 'https://img95.699pic.com/photo/50042/0407.jpg'}
            mode="aspectFill"
          />

          <View style={{ background: '#fff', padding: '16px', borderRadius: '8px', marginTop: '12px' }}>
            <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>{hotelData?.name || '默认酒店'}</Text>
            <View style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <Text style={{ color: '#0088ff' }}>评分 {hotelData?.score || 4.8}</Text>
              <Text style={{ color: '#f56c6c', fontWeight: 'bold' }}>¥{hotelData?.price || 299}/晚</Text>
            </View>
            <Text style={{ color: '#666', marginTop: '8px' }}>📍 {hotelData?.address || '默认地址'}</Text>
          </View>

          <View style={{ background: '#fff', padding: '16px', borderRadius: '8px', marginTop: '12px' }}>
            <Text style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>酒店介绍</Text>
            <Text style={{ color: '#666', lineHeight: '1.6' }}>{hotelData?.description || '暂无介绍'}</Text>
          </View>

          <Button
            style={{ width: '100%', height: '48px', background: '#0088ff', color: '#fff', borderRadius: '8px', marginTop: '20px' }}
            onClick={() => alert(`预订酒店ID: ${hotel_id}`)} // 用 alert 替代 Toast
          >
            立即预订
          </Button>
        </View>
      )}
    </View>
  )
}*/
// src/pages/hotel-detail/index.jsx
import { useState, useEffect } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import './index.less'

export default function HotelDetail() {
  // 1. 兼容获取参数（兜底方案）
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1])
  const hotel_id = urlParams.get('hotel_id') || '1'
  const check_in = urlParams.get('check_in') || '2026-02-08'
  const check_out = urlParams.get('check_out') || '2026-02-10'

  // 2. 状态管理
  const [hotelData, setHotelData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 3. 模拟截图中的完整数据结构
  useEffect(() => {
    console.log('获取到的参数：', { hotel_id, check_in, check_out })
    setTimeout(() => {
      setHotelData({
        id: Number(hotel_id),
        name: '回坊轩礼精品酒店(西安回民街钟楼地铁站店)',
        tags: ['优享会'],
        cover: 'https://img95.699pic.com/photo/50042/0407.jpg',
        roomType: {
          name: '轻奢双床房',
          area: '40㎡',
          floor: '3-6层',
          beds: '2张1.3米单人床'
        },
        facilities: [
          { icon: '🏢', text: '2019年开业' },
          { icon: '📸', text: '拍照出片' },
          { icon: '🚗', text: '租车服务' },
          { icon: '🏠', text: '家庭房' },
          { icon: '🚭', text: '无烟楼层' }
        ],
        score: 4.7,
        reviewCount: 1951,
        reviewText: '环境干净舒适位置方便',
        distance: '距西安钟楼步行670米',
        address: '莲湖区钟鼓楼北院门125号',
        promotions: [
          { text: '首住特惠', type: 'primary' },
          { text: '85折起', type: 'default' },
          { text: '立减10', type: 'default' },
          { text: '惊喜红包', type: 'default' }
        ],
        checkIn: '2月7日',
        checkOut: '2月8日',
        nights: 1,
        roomCount: 1,
        adultCount: 1,
        childCount: 0,
        roomFilters: ['双床房', '家庭房', '大床房', '免费取消', '≥35㎡'],
        recommendedRooms: [
          {
            id: '9G7GBK',
            name: '舒雅大床房',
            bed: '1张1.8米大床',
            capacity: '2人入住',
            area: '20-25㎡',
            window: '窗户位于走廊或过道',
            breakfast: '无早餐',
            cancelPolicy: '入住当天23:00前可免费取消',
            originalPrice: 369,
            discountPrice: 141,
            tags: ['新客体验钻石', '会员出行', '4项优惠228']
          }
        ]
      })
      setLoading(false)
    }, 500)
  }, [hotel_id, check_in, check_out])

  // 4. 完整渲染截图中的所有模块
  return (
    <View className="hotel-detail-page">
      {loading && <View className="loading-wrapper"><Text>加载中...</Text></View>}
      {error && <View className="error-wrapper"><Text className="error-text">⚠️ {error}</Text></View>}

      {!loading && (
        <View>
          {/* 1. 顶部大图 + 房型信息 + 标签栏 */}
          <View className="top-banner">
            <Image
              className="banner-image"
              src={hotelData?.cover}
              mode="aspectFill"
            />
            <View className="banner-overlay">
              <Text className="room-type-name">{hotelData?.roomType?.name}</Text>
              <Text className="room-type-desc">
                {hotelData?.roomType?.area} / {hotelData?.roomType?.floor} / {hotelData?.roomType?.beds}
              </Text>
            </View>
            <View className="banner-tabs">
              <Text className="tab active">封面</Text>
              <Text className="tab">精选</Text>
              <Text className="tab">位置</Text>
              <Text className="tab">点评</Text>
              <Text className="tab">相册</Text>
              <Text className="tab-icon">🔊</Text>
            </View>
          </View>

          {/* 2. 酒店名称 + 标签 */}
          <View className="hotel-header">
            <Text className="hotel-name">{hotelData?.name}</Text>
            {hotelData?.tags?.map(tag => (
              <Text key={tag} className="hotel-tag">{tag}</Text>
            ))}
          </View>

          {/* 3. 设施图标行 */}
          <View className="facilities-row">
            {hotelData?.facilities?.map((item, index) => (
              <View key={index} className="facility-item">
                <Text className="facility-icon">{item.icon}</Text>
                <Text className="facility-text">{item.text}</Text>
              </View>
            ))}
            <View className="facility-item">
              <Text className="facility-icon">⚙️</Text>
              <Text className="facility-text">设施政策</Text>
            </View>
          </View>

          {/* 4. 评分 + 地址信息 */}
          <View className="score-address-row">
            <View className="score-block">
              <Text className="score">{hotelData?.score}</Text>
              <Text className="score-label">超棒 {hotelData?.reviewCount}条</Text>
              <Text className="review-text">“{hotelData?.reviewText}”</Text>
            </View>
            <View className="address-block">
              <Text className="distance">{hotelData?.distance}</Text>
              <Text className="address">{hotelData?.address}</Text>
              <View className="map-btn">📍地图</View>
            </View>
          </View>

          {/* 5. 订房优惠栏 */}
          <View className="promotions-row">
            <Text className="promo-title">订房优惠</Text>
            {hotelData?.promotions?.map((promo, index) => (
              <Text key={index} className={`promo-tag ${promo.type}`}>{promo.text}</Text>
            ))}
            <Button className="get-coupon-btn">领券</Button>
          </View>

          {/* 6. 日期选择栏 */}
          <View className="date-select-row">
            <View className="date-tabs">
              <Text className="date-tab">今天</Text>
              <Text className="date-tab">明天</Text>
              <Text className="date-tab active">看低价</Text>
            </View>
            <View className="date-info">
              <Text className="date-range">{hotelData?.checkIn} - {hotelData?.checkOut}</Text>
              <Text className="nights">共{hotelData?.nights}晚</Text>
            </View>
            <View className="guest-count">
              <Text className="count-text">
                {hotelData?.roomCount}间 {hotelData?.adultCount}人 {hotelData?.childCount}👶
              </Text>
            </View>
          </View>

          {/* 7. 房型筛选标签 */}
          <View className="room-filters">
            {hotelData?.roomFilters?.map((filter, index) => (
              <Text key={index} className="filter-tag">{filter}</Text>
            ))}
            <Text className="filter-btn">筛选 ▾</Text>
          </View>

          {/* 8. 推荐房型卡片 */}
          <View className="recommended-section">
            <Text className="recommended-title">✨猜您喜欢 本店大床房销量No.1</Text>
            {hotelData?.recommendedRooms?.map(room => (
              <View key={room.id} className="room-card">
                <Image className="room-image" src="https://img95.699pic.com/photo/50042/0407.jpg" mode="aspectFill" />
                <View className="room-info">
                  <View className="room-header">
                    <Text className="room-name">{room.name}</Text>
                    <Text className="room-code">{room.id}</Text>
                  </View>
                  <Text className="room-desc">{room.bed} {room.capacity} {room.area}</Text>
                  <Text className="room-window">{room.window}</Text>
                  <Text className="room-breakfast">{room.breakfast}</Text>
                  <Text className="room-cancel">{room.cancelPolicy}</Text>
                  <View className="room-tags">
                    {room.tags?.map(tag => (
                      <Text key={tag} className="room-tag">{tag}</Text>
                    ))}
                  </View>
                  <View className="room-price-row">
                    <View className="price-block">
                      <Text className="original-price">¥{room.originalPrice}</Text>
                      <Text className="discount-price">¥{room.discountPrice}</Text>
                    </View>
                    <Button className="book-now-btn">立即预订</Button>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}