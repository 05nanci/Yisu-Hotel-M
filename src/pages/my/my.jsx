import { View, Text, Button, Image } from '@tarojs/components'
import { useCallback } from 'react'
import './my.less'

export default function MyPage () {
  // 处理菜单点击
  const handleMenuClick = useCallback((menu) => {
    console.log('点击菜单:', menu)
  }, [])

  // 处理订单状态点击
  const handleOrderStatusClick = useCallback((status) => {
    console.log('点击订单状态:', status)
  }, [])

  return (
    <View className='my-page'>
      {/* 个人信息区域 */}
      <View className='user-info-section'>
        <Image 
          className='user-avatar' 
          src='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20portrait%20placeholder&image_size=square' 
        />
        <View className='user-info'>
          <Text className='user-name'>登录/注册</Text>
          <Text className='user-id'>点击登录享受更多权益</Text>
        </View>
        <View className='user-arrow'>›</View>
      </View>

      {/* 订单管理区域 */}
      <View className='order-section'>
        <View className='section-header'>
          <Text className='section-title'>我的订单</Text>
          <View className='section-more' onClick={() => handleMenuClick('all_orders')}>
            <Text className='more-text'>查看全部订单</Text>
            <Text className='more-arrow'>›</Text>
          </View>
        </View>
        
        <View className='order-status-list'>
          <View className='order-status-item' onClick={() => handleOrderStatusClick('pending_pay')}>
            <View className='order-status-icon'>💳</View>
            <Text className='order-status-text'>待支付</Text>
            <View className='order-status-badge'>2</View>
          </View>
          <View className='order-status-item' onClick={() => handleOrderStatusClick('pending_confirm')}>
            <View className='order-status-icon'>⏳</View>
            <Text className='order-status-text'>待确认</Text>
          </View>
          <View className='order-status-item' onClick={() => handleOrderStatusClick('pending_checkin')}>
            <View className='order-status-icon'>🏨</View>
            <Text className='order-status-text'>待入住</Text>
          </View>
          <View className='order-status-item' onClick={() => handleOrderStatusClick('completed')}>
            <View className='order-status-icon'>📋</View>
            <Text className='order-status-text'>已完成</Text>
          </View>
        </View>
      </View>

      {/* 常用功能区域 */}
      <View className='menu-section'>
        <View className='menu-item' onClick={() => handleMenuClick('favorites')}>
          <View className='menu-icon'>❤️</View>
          <Text className='menu-text'>我的收藏</Text>
          <View className='menu-arrow'>›</View>
        </View>
        <View className='menu-item' onClick={() => handleMenuClick('coupons')}>
          <View className='menu-icon'>🎫</View>
          <Text className='menu-text'>优惠券</Text>
          <View className='menu-arrow'>›</View>
        </View>
        <View className='menu-item' onClick={() => handleMenuClick('history')}>
          <View className='menu-icon'>🕐</View>
          <Text className='menu-text'>浏览历史</Text>
          <View className='menu-arrow'>›</View>
        </View>
        <View className='menu-item' onClick={() => handleMenuClick('settings')}>
          <View className='menu-icon'>⚙️</View>
          <Text className='menu-text'>设置</Text>
          <View className='menu-arrow'>›</View>
        </View>
      </View>

      {/* 客服与帮助区域 */}
      <View className='help-section'>
        <View className='help-item' onClick={() => handleMenuClick('customer_service')}>
          <Text className='help-text'>客服中心</Text>
        </View>
        <View className='help-item' onClick={() => handleMenuClick('help_center')}>
          <Text className='help-text'>帮助中心</Text>
        </View>
      </View>

      {/* 版本信息 */}
      <View className='version-section'>
        <Text className='version-text'>版本 1.0.0</Text>
      </View>
    </View>
  )
}