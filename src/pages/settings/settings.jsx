import { View, Text, Switch } from '@tarojs/components'
import { useCallback, useState } from 'react'
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
    
    // 打印当前开关状态
    console.log(`${key} 开关状态: ${value ? '开启' : '关闭'}`)
    
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
          
          // 跳转到登录页面，使用redirectTo替换当前页面栈
          Taro.redirectTo({
            url: '/pages/login/login'
          })
        }
      }
    })
  }, [])

  // 处理关于我们
  const handleAbout = useCallback(() => {
    // 弹出关于我们的模态弹窗
    Taro.showModal({
      title: '关于我们',
      content: '易宿酒店预订平台 v1.0.0\n\n专注于为用户提供便捷的酒店预订服务，让您的旅行更加舒适。',
      showCancel: false,
      confirmText: '我知道了',
      maskClosable: true,
      success: (res) => {
        if (res.confirm) {
          console.log('用户关闭了关于我们弹窗');
        }
      }
    })
  }, [])

  // 处理隐私政策
  const handlePrivacy = useCallback(() => {
    // 弹出全屏模态弹窗
    Taro.showModal({
      title: '隐私政策',
      content: '易宿酒店尊重并保护用户隐私。我们收集的个人信息仅用于提供酒店预订服务，并采取严格的安全措施保护您的信息。我们不会向第三方分享您的个人信息，除非获得您的明确授权或法律要求。通过使用我们的服务，您同意我们按照本隐私政策处理您的信息。',
      showCancel: false,
      confirmText: '我知道了',
      maskClosable: true,
      success: (res) => {
        if (res.confirm) {
          console.log('用户关闭了隐私政策弹窗');
        }
      }
    })
  }, [])

  // 处理用户协议
  const handleTerms = useCallback(() => {
    // 弹出全屏模态弹窗
    Taro.showModal({
      title: '用户协议',
      content: '欢迎使用易宿酒店预订服务。本协议是您与易宿酒店之间关于使用我们服务的法律协议。请您仔细阅读本协议的全部内容，特别是限制或免除责任的条款。通过注册、登录、使用我们的服务，您表示同意接受本协议的全部条款和条件。如您不同意本协议的任何条款，您应立即停止使用我们的服务。',
      showCancel: false,
      confirmText: '我知道了',
      maskClosable: true,
      success: (res) => {
        if (res.confirm) {
          console.log('用户关闭了用户协议弹窗');
        }
      }
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
      
      {/* 设置列表 - 添加滚动功能 */}
      <View className='settings-list' style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', paddingBottom: '30px' }}>
        {/* 通知设置 */}
        <View className='setting-section'>
          <Text className='section-title'>通知设置</Text>
          <View className='setting-item'>
            <Text className='setting-label'>消息通知</Text>
            <Switch
              checked={settings.notifications}
              onChange={(e) => {
                const value = e.detail.value;
                handleSettingToggle('notifications', value);
              }}
              className='setting-switch'
              style={{ transform: 'scale(1)' }}
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
              onChange={(e) => {
                const value = e.detail.value;
                handleSettingToggle('location', value);
              }}
              className='setting-switch'
              style={{ transform: 'scale(1)' }}
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
              onChange={(e) => {
                const value = e.detail.value;
                handleSettingToggle('autoLogin', value);
              }}
              className='setting-switch'
              style={{ transform: 'scale(1)' }}
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