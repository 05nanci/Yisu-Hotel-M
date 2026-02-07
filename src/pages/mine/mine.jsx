import { View, Text } from '@tarojs/components'
import './mine.less'

export default function Mine () {
  return (
    <View className='mine-container'>
      <View className='mine-header'>
        <View className='avatar-placeholder'>
          <Text className='avatar-text'>头像</Text>
        </View>
        <View className='user-info'>
          <Text className='user-name'>用户名</Text>
          <Text className='user-phone'>未登录</Text>
        </View>
      </View>
      
      <View className='mine-section'>
        <Text className='section-title'>我的订单</Text>
        <View className='order-types'>
          <View className='order-type'>
            <View className='order-icon'>订</View>
            <Text className='order-text'>全部</Text>
          </View>
          <View className='order-type'>
            <View className='order-icon'>待</View>
            <Text className='order-text'>待支付</Text>
          </View>
          <View className='order-type'>
            <View className='order-icon'>入</View>
            <Text className='order-text'>待入住</Text>
          </View>
          <View className='order-type'>
            <View className='order-icon'>评</View>
            <Text className='order-text'>待评价</Text>
          </View>
        </View>
      </View>
      
      <View className='mine-section'>
        <Text className='section-title'>我的服务</Text>
        <View className='service-item'>
          <Text className='service-text'>我的收藏</Text>
          <Text className='service-arrow'>→</Text>
        </View>
        <View className='service-item'>
          <Text className='service-text'>常用入住人</Text>
          <Text className='service-arrow'>→</Text>
        </View>
        <View className='service-item'>
          <Text className='service-text'>设置</Text>
          <Text className='service-arrow'>→</Text>
        </View>
      </View>
    </View>
  )
}
