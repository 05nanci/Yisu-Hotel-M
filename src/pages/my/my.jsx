import { View, Text, Button, Image } from '@tarojs/components'
import { useCallback, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { userApi } from '../../services/api'
import './my.less'

export default function MyPage () {
  // 状态管理
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState(null)

  // 初始化时检查登录状态并获取用户信息
  useEffect(() => {
    const checkLoginStatus = async () => {
      const loggedIn = Taro.getStorageSync('isLoggedIn')
      const token = Taro.getStorageSync('token')
      
      if (loggedIn && token) {
        try {
          // 尝试使用不同的API方法获取用户信息
          let response;
          try {
            response = await userApi.getProfile();
          } catch (e) {
            try {
              response = await userApi.getUserInfo();
            } catch (e2) {
              throw e2;
            }
          }
          
          if (response.code === 0 && response.data) {
            const userData = response.data
            setIsLoggedIn(true)
            setUserInfo(userData)
            // 更新本地存储的用户信息
            Taro.setStorageSync('userInfo', userData)
          } else {
            // 获取用户信息失败，可能是token过期
            Taro.setStorageSync('isLoggedIn', false)
            Taro.setStorageSync('token', '')
            Taro.setStorageSync('userInfo', null)
            setIsLoggedIn(false)
            setUserInfo(null)
          }
        } catch (error) {
          console.error('获取用户信息失败:', error)
          // 网络错误或其他问题，保持本地存储的状态
          const info = Taro.getStorageSync('userInfo')
          if (info) {
            setIsLoggedIn(true)
            setUserInfo(info)
          }
        }
      }
    }
    checkLoginStatus()
  }, [])

  // 处理菜单点击
  const handleMenuClick = useCallback((menu) => {
    console.log('点击菜单:', menu)
    if (menu === 'favorites') {
      // 跳转到收藏页面
      Taro.navigateTo({
        url: '/pages/favorites/favorites'
      })
    } else if (menu === 'coupons') {
      // 跳转到优惠券页面
      Taro.navigateTo({
        url: '/pages/coupons/coupons'
      })
    } else if (menu === 'settings') {
      // 跳转到设置页面
      Taro.navigateTo({
        url: '/pages/settings/settings'
      })
    } else if (menu === 'history') {
      // 跳转到历史页面
      Taro.navigateTo({
        url: '/pages/history/history'
      })
    }
  }, [])

  // 处理订单状态点击
  const handleOrderStatusClick = useCallback((status) => {
    console.log('点击订单状态:', status)
    Taro.switchTab({
      url: `/pages/order/order?status=${status}`
    })
  }, [])

  // 处理登录/注册点击
  const handleLoginRegisterClick = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/register/register'
    })
  }, [])
  return (
    <View className='my-page'>
      {/* 个人信息区域 */}
      {isLoggedIn && userInfo ? (
        <View className='user-info-section'>
          <Image 
            className='user-avatar' 
            src={userInfo.avatar || userInfo.profile?.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20portrait%20placeholder&image_size=square'} 
          />
          <View className='user-info'>
            <Text className='user-name'>{userInfo.nickname || userInfo.profile?.nickname || userInfo.phone || '用户'}</Text>
            <Text className='user-id'>已登录</Text>
          </View>
          <View className='user-arrow'>›</View>
        </View>
      ) : (
        <View className='user-info-section' onClick={() => Taro.navigateTo({ url: '/pages/login/login' })}>
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
      )}

      {/* 订单管理区域 */}
      <View className='order-section'>
        <View className='section-header'>
          <Text className='section-title'>我的订单</Text>
          <View className='section-more' onClick={() => Taro.switchTab({ url: '/pages/order/order' })}>
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