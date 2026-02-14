import { View, Text, ScrollView } from '@tarojs/components'
import { useCallback, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { couponApi } from '../../services/api'
import './coupons.less'

export default function CouponsPage () {
  // 状态管理
  const [coupons, setCoupons] = useState({
    available: [],
    used: [],
    expired: []
  })
  const [activeTab, setActiveTab] = useState('available')
  const [loading, setLoading] = useState(false)

  // 初始化时获取优惠券数据
  useEffect(() => {
    fetchCoupons()
  }, [])

  // 处理标签切换
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
  }, [])

  // 获取优惠券数据
  const fetchCoupons = async () => {
    try {
      setLoading(true)
      
      // 调用后端API获取优惠券列表
      const response = await couponApi.getCoupons()
      
      if (response.code === 0 && response.data) {
        // 按状态分类优惠券
        const available = []
        const used = []
        const expired = []
        
        (response.data.coupons || []).forEach(coupon => {
          switch (coupon.status) {
            case 'available':
              available.push(coupon)
              break
            case 'used':
              used.push(coupon)
              break
            case 'expired':
              expired.push(coupon)
              break
            default:
              break
          }
        })
        
        setCoupons({ available, used, expired })
      } else {
        Taro.showToast({
          title: response.message || '获取优惠券列表失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('获取优惠券列表失败:', error)
      Taro.showToast({
        title: error.message || '获取优惠券列表失败，请检查网络连接',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  // 处理优惠券点击
  const handleCouponClick = useCallback((coupon) => {
    if (coupon.status === 'available') {
      Taro.showToast({
        title: '优惠券已添加到账户',
        icon: 'success'
      })
    }
  }, [])

  // 获取当前标签的优惠券列表
  const getCurrentCoupons = () => {
    switch (activeTab) {
      case 'available':
        return coupons.available
      case 'used':
        return coupons.used
      case 'expired':
        return coupons.expired
      default:
        return []
    }
  }

  return (
    <View className='coupons-page'>
      {/* 返回按钮 */}
      <View className='back-button' onClick={() => Taro.navigateBack()}>
        <Text className='back-icon'>←</Text>
        <Text className='back-text'>返回</Text>
      </View>
      
      {/* 页面标题 */}
      <View className='page-header'>
        <Text className='page-title'>我的优惠券</Text>
      </View>
      
      {/* 标签栏 */}
      <View className='tab-bar'>
        <View 
          className={`tab-item ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => handleTabChange('available')}
        >
          <Text className='tab-text'>可使用</Text>
          <View className='tab-badge'>{coupons.available.length}</View>
        </View>
        <View 
          className={`tab-item ${activeTab === 'used' ? 'active' : ''}`}
          onClick={() => handleTabChange('used')}
        >
          <Text className='tab-text'>已使用</Text>
          <View className='tab-badge'>{coupons.used.length}</View>
        </View>
        <View 
          className={`tab-item ${activeTab === 'expired' ? 'active' : ''}`}
          onClick={() => handleTabChange('expired')}
        >
          <Text className='tab-text'>已过期</Text>
          <View className='tab-badge'>{coupons.expired.length}</View>
        </View>
      </View>
      
      {/* 优惠券列表 */}
      <ScrollView className='coupons-list'>
        {loading ? (
          <View className='loading-container'>
            <Text className='loading-text'>加载中...</Text>
          </View>
        ) : getCurrentCoupons().length > 0 ? (
          getCurrentCoupons().map(coupon => (
            <View 
              key={coupon.id} 
              className={`coupon-item ${coupon.status}`}
              onClick={() => handleCouponClick(coupon)}
            >
              <View className='coupon-left'>
                {coupon.type === 'cash' ? (
                  <>
                    <Text className='coupon-value'>¥{coupon.value}</Text>
                    <Text className='coupon-condition'>满{coupon.minSpend}可用</Text>
                  </>
                ) : (
                  <>
                    <Text className='coupon-value'>{coupon.value}折</Text>
                    <Text className='coupon-condition'>满{coupon.minSpend}可用</Text>
                  </>
                )}
              </View>
              <View className='coupon-right'>
                <Text className='coupon-scope'>{coupon.scope}</Text>
                <Text className='coupon-expiry'>
                  {coupon.status === 'used' 
                    ? `使用时间: ${coupon.used_date}` 
                    : `有效期至: ${coupon.expiry_date}`
                  }
                </Text>
                {coupon.status === 'available' && (
                  <View className='coupon-btn'>立即使用</View>
                )}
              </View>
            </View>
          ))
        ) : (
          <View className='empty-state'>
            <Text className='empty-icon'>🎫</Text>
            <Text className='empty-text'>
              {activeTab === 'available' ? '暂无可用优惠券' : 
               activeTab === 'used' ? '暂无已使用优惠券' : '暂无过期优惠券'}
            </Text>
            <Text className='empty-hint'>
              {activeTab === 'available' ? '关注活动获取更多优惠券' : ''}
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* 底部提示 */}
      {activeTab === 'available' && (
        <View className='bottom-tip'>
          <Text className='tip-text'>点击优惠券即可使用</Text>
        </View>
      )}
    </View>
  )
}
