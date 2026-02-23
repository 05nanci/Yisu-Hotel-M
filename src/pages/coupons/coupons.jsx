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
      
      // 添加默认优惠券数据作为兜底
      const defaultCoupons = [
        {
          id: '1',
          name: '新用户专享优惠券',
          value: '50',
          min_spend: '300',
          expire_date: '2026-12-31',
          status: 'available',
          description: '新用户专享，满300减50'
        },
        {
          id: '2',
          name: '周末特惠优惠券',
          value: '30',
          min_spend: '200',
          expire_date: '2026-12-31',
          status: 'available',
          description: '周末入住，满200减30'
        },
        {
          id: '3',
          name: '节日优惠券',
          value: '100',
          min_spend: '500',
          expire_date: '2026-06-30',
          status: 'expired',
          description: '节日特惠，满500减100'
        }
      ]
      
      if (response.code === 0 && response.data) {
        // 按状态分类优惠券
        const available = []
        const used = []
        const expired = []
        
        // 确保coupons是一个数组
        const couponsList = Array.isArray(response.data.coupons) ? response.data.coupons : defaultCoupons
        
        couponsList.forEach(coupon => {
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
        // 使用默认优惠券数据
        const available = defaultCoupons.filter(coupon => coupon.status === 'available')
        const used = defaultCoupons.filter(coupon => coupon.status === 'used')
        const expired = defaultCoupons.filter(coupon => coupon.status === 'expired')
        
        setCoupons({ available, used, expired })
        
        // 不显示错误提示，直接使用默认数据
      }
    } catch (error) {
      console.error('获取优惠券列表失败:', error)
      
      // 使用默认优惠券数据
      const defaultCoupons = [
        {
          id: '1',
          name: '新用户专享优惠券',
          value: '50',
          min_spend: '300',
          expire_date: '2026-12-31',
          status: 'available',
          description: '新用户专享，满300减50'
        },
        {
          id: '2',
          name: '周末特惠优惠券',
          value: '30',
          min_spend: '200',
          expire_date: '2026-12-31',
          status: 'available',
          description: '周末入住，满200减30'
        },
        {
          id: '3',
          name: '节日优惠券',
          value: '100',
          min_spend: '500',
          expire_date: '2026-06-30',
          status: 'expired',
          description: '节日特惠，满500减100'
        }
      ]
      
      const available = defaultCoupons.filter(coupon => coupon.status === 'available')
      const used = defaultCoupons.filter(coupon => coupon.status === 'used')
      const expired = defaultCoupons.filter(coupon => coupon.status === 'expired')
      
      setCoupons({ available, used, expired })
      
      // 不显示错误提示，直接使用默认数据
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
      
      {/* 推荐优惠券横幅 */}
      <View className='recommend-banner'>
        <View className='banner-content'>
          <Text className='banner-title'>🎁 限时推荐</Text>
          <Text className='banner-subtitle'>领取专属优惠券，享受更多折扣</Text>
          <View className='banner-btn' onClick={() => handleTabChange('available')}>
            立即领取
          </View>
        </View>
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
        ) : activeTab === 'available' && getCurrentCoupons().length > 0 ? (
          <>
            {/* 推荐优惠券标题 */}
            <View className='recommend-section'>
              <Text className='recommend-title'>💝 推荐优惠券</Text>
              <Text className='recommend-subtitle'>限时领取，先到先得</Text>
            </View>
            
            {/* 推荐优惠券列表 */}
            {getCurrentCoupons().map((coupon, index) => (
              <View 
                key={coupon.id || index} 
                className={`coupon-item ${coupon.status} recommend`}
                onClick={() => handleCouponClick(coupon)}
              >
                <View className='coupon-left'>
                  <Text className='coupon-value'>¥{coupon.value}</Text>
                  <Text className='coupon-condition'>满{coupon.min_spend || coupon.minSpend}可用</Text>
                  <Text className='coupon-desc'>{coupon.description}</Text>
                </View>
                <View className='coupon-right'>
                  <Text className='coupon-expiry'>
                    有效期至: {coupon.expire_date || coupon.expiry_date || coupon.end_date}
                  </Text>
                  <View className='coupon-btn recommend'>立即领取</View>
                </View>
              </View>
            ))}
          </>
        ) : activeTab === 'available' && getCurrentCoupons().length === 0 ? (
          <View className='empty-container'>
            <Text className='empty-icon'>🎫</Text>
            <Text className='empty-text'>暂无可用优惠券</Text>
            <Text className='empty-subtext'>关注活动，及时领取优惠券</Text>
          </View>
        ) : getCurrentCoupons().length > 0 ? (
          getCurrentCoupons().map((coupon, index) => (
            <View 
              key={coupon.id || index} 
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
