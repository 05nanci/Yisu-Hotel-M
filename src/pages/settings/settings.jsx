import { View, Text, Switch } from '@tarojs/components'
import { useCallback, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import './settings.less'

export default function SettingsPage () {
  // 设置项状态
  const [settings, setSettings] = useState({
    notifications: true,
    location: true,
    darkMode: false,
    autoLogin: true
  })

  // 处理设置项切换
  const handleSettingToggle = useCallback((key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
    
    // 模拟保存设置
    Taro.showToast({
      title: '设置已保存',
      icon: 'success',
      duration: 1000
    })
  }, [])

  // 处理清除缓存
  const handleClearCache = useCallback(() => {
    Taro.showModal({
      title: '清除缓存',
      content: '确定要清除应用缓存吗？',
      success: (res) => {
        if (res.confirm) {
          // 模拟清除缓存
          setTimeout(() => {
            Taro.showToast({
              title: '缓存已清除',
              icon: 'success'
            })
          }, 500)
        }
      }
    })
  }, [])

  // 处理退出登录
  const handleLogout = useCallback(() => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的登录状态和token
          Taro.removeStorageSync('userInfo')
          Taro.removeStorageSync('isLoggedIn')
          Taro.removeStorageSync('token')
          
          // 跳转到登录页面
          Taro.navigateTo({
            url: '/pages/login/login'
          })
        }
      }
    })
  }, [])

  // 处理关于我们
  const handleAbout = useCallback(() => {
    Taro.showModal({
      title: '关于我们',
      content: '易宿酒店预订平台 v1.0.0\n\n专注于为用户提供便捷的酒店预订服务，让您的旅行更加舒适。',
      showCancel: false
    })
  }, [])

  // 处理隐私政策
  const handlePrivacy = useCallback(() => {
    Taro.showToast({
      title: '跳转到隐私政策页面',
      icon: 'none'
    })
  }, [])

  // 处理用户协议
  const handleTerms = useCallback(() => {
    Taro.showToast({
      title: '跳转到用户协议页面',
      icon: 'none'
    })
  }, [])

  return (
    <View className='settings-page'>
      {/* 返回按钮 */}
      <View className='back-button' onClick={() => Taro.navigateBack()}>
        <Text className='back-icon'>←</Text>
        <Text className='back-text'>返回</Text>
      </View>
      
      {/* 页面标题 */}
      <View className='page-header'>
        <Text className='page-title'>设置</Text>
      </View>
      
      {/* 设置列表 */}
      <View className='settings-list'>
        {/* 通知设置 */}
        <View className='setting-section'>
          <Text className='section-title'>通知设置</Text>
          <View className='setting-item'>
            <Text className='setting-label'>消息通知</Text>
            <Switch
              checked={settings.notifications}
              onChange={(value) => handleSettingToggle('notifications', value)}
              className='setting-switch'
            />
          </View>
        </View>
        
        {/* 隐私设置 */}
        <View className='setting-section'>
          <Text className='section-title'>隐私设置</Text>
          <View className='setting-item'>
            <Text className='setting-label'>位置服务</Text>
            <Switch
              checked={settings.location}
              onChange={(value) => handleSettingToggle('location', value)}
              className='setting-switch'
            />
          </View>
        </View>
        
        {/* 账号设置 */}
        <View className='setting-section'>
          <Text className='section-title'>账号设置</Text>
          <View className='setting-item'>
            <Text className='setting-label'>自动登录</Text>
            <Switch
              checked={settings.autoLogin}
              onChange={(value) => handleSettingToggle('autoLogin', value)}
              className='setting-switch'
            />
          </View>
          <View 
            className='setting-item clickable'
            onClick={handleClearCache}
          >
            <Text className='setting-label'>清除缓存</Text>
            <Text className='setting-value'>12.3 MB</Text>
            <Text className='setting-arrow'>›</Text>
          </View>
        </View>
        
        {/* 关于 */}
        <View className='setting-section'>
          <Text className='section-title'>关于</Text>
          <View 
            className='setting-item clickable'
            onClick={handleAbout}
          >
            <Text className='setting-label'>关于我们</Text>
            <Text className='setting-arrow'>›</Text>
          </View>
          <View 
            className='setting-item clickable'
            onClick={handlePrivacy}
          >
            <Text className='setting-label'>隐私政策</Text>
            <Text className='setting-arrow'>›</Text>
          </View>
          <View 
            className='setting-item clickable'
            onClick={handleTerms}
          >
            <Text className='setting-label'>用户协议</Text>
            <Text className='setting-arrow'>›</Text>
          </View>
        </View>
        
        {/* 退出登录 */}
        <View className='logout-section'>
          <View 
            className='logout-button'
            onClick={handleLogout}
          >
            <Text className='logout-text'>退出登录</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
