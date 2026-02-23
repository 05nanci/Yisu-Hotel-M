import { View, Text, Button } from '@tarojs/components'
import { useCallback, useState, useEffect, useRef } from 'react'
import Taro, { useDidShow, useReachBottom } from '@tarojs/taro'
import { orderApi } from '../../services/api'
import './order.less'

export default function OrderPage () {
  // 状态管理
  const [activeStatus, setActiveStatus] = useState('all')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 10
  
  // 用于标记是否是首次加载，避免 useDidShow 和 useEffect 重复调用
  const isFirstLoad = useRef(true)
  // 用于防止重复请求
  const isLoadingRef = useRef(false)

  // 初始化时检查路由参数
  useEffect(() => {
    const params = Taro.getCurrentInstance().router.params
    if (params && params.status) {
      setActiveStatus(params.status)
    }
  }, [])

  // 页面显示时刷新数据（除了首次加载）
  useDidShow(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false
      return
    }
    // 重新加载第一页
    setPage(1)
    setHasMore(true)
    fetchOrders(1)
  })

  // 触底加载更多
  useReachBottom(() => {
    if (!isLoadingRef.current && hasMore) {
      fetchOrders(page + 1)
    }
  })

  // 当状态变化时获取订单数据
  useEffect(() => {
    setPage(1)
    setHasMore(true)
    setOrders([])
    fetchOrders(1)
  }, [activeStatus])

  // 映射本地状态到API状态
  const mapStatusToApi = useCallback((status) => {
    const statusMap = {
      'pending_pay': 'pending',
      'pending_confirm': 'paid',
      'pending_checkin': 'paid',
      'completed': 'completed'
    }
    return statusMap[status] || status
  }, [])

  // 获取订单数据
  const fetchOrders = useCallback(async (pageNum = 1) => {
    if (isLoadingRef.current) return
    
    try {
      isLoadingRef.current = true
      setLoading(true)
      
      // 调用后端API获取订单
      const response = await orderApi.getOrders({
        status: activeStatus === 'all' ? '' : mapStatusToApi(activeStatus),
        page: pageNum,
        page_size: pageSize
      })
      
      if (response.code === 0 && response.data) {
        // 兼容不同的数据结构: response.data.list 或 response.data.bookings
        const newOrders = response.data.bookings || response.data.list || []
        
        // 判断是否还有更多数据
        if (newOrders.length < pageSize) {
          setHasMore(false)
        } else {
          setHasMore(true)
        }

        if (pageNum === 1) {
          setOrders(newOrders)
        } else {
          setOrders(prev => [...prev, ...newOrders])
        }
        setPage(pageNum)
      } else {
        // API请求失败
        console.log('API请求失败')
        if (pageNum === 1) {
          setOrders([])
        }
        
        // 只在登录失效时显示提示
        if (response.code === 4008) {
          Taro.showToast({
            title: response.msg || '登录已过期，请重新登录',
            icon: 'none',
            duration: 2000
          })
          setTimeout(() => {
            Taro.navigateTo({
              url: '/pages/login/login'
            })
          }, 1500)
        }
      }
    } catch (error) {
      console.error('获取订单失败:', error)
      
      // 网络错误处理
      if (pageNum === 1) {
        setOrders([])
      }
      
      // 只在登录失效时显示提示
      if (error.message && (error.message.includes('401') || error.message.includes('403'))) {
        Taro.showToast({
          title: '登录已过期，请重新登录',
          icon: 'none',
          duration: 2000
        })
        setTimeout(() => {
          Taro.navigateTo({
            url: '/pages/login/login'
          })
        }, 1500)
      }
    } finally {
      setLoading(false)
      isLoadingRef.current = false
      setRefreshing(false)
    }
  }, [activeStatus, mapStatusToApi])

  // 下拉刷新
  const handleRefresh = async () => {
    setRefreshing(true)
    setPage(1)
    setHasMore(true)
    await fetchOrders(1)
  }

  // 处理订单操作
  const handleOrderAction = useCallback(async (orderId, action, e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation()
    }
    console.log('订单操作:', orderId, action)
    if (action === 'pay') {
      // 跳转到支付页面
      Taro.navigateTo({
        url: `/pages/payment/index?bookingId=${orderId}`
      })
    } else if (action === 'view') {
      // 跳转到支付页面（作为订单详情页）
      Taro.navigateTo({
        url: `/pages/payment/index?bookingId=${orderId}`
      })
    } else if (action === 'cancel') {
      // 取消订单
      Taro.showModal({
        title: '取消订单',
        content: '确定要取消这个订单吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await orderApi.cancelOrder(orderId)
              Taro.showToast({
                title: '订单已取消',
                icon: 'success'
              })
              // 重新获取订单列表
              fetchOrders()
            } catch (error) {
              Taro.showToast({
                title: error.message || '取消订单失败',
                icon: 'none'
              })
            }
          }
        }
      })
    }
  }, [fetchOrders])

  return (
    <View className='order-page'>
      <View className='order-header'>
        <Text className='order-header-title'>我的订单</Text>
      </View>
      
      {/* 订单状态过滤 */}
      <View className='order-status-filter'>
        <View 
          className={`filter-item ${activeStatus === 'all' ? 'active' : ''}`}
          onClick={() => setActiveStatus('all')}
        >
          <Text>全部</Text>
        </View>
        <View 
          className={`filter-item ${activeStatus === 'pending_pay' ? 'active' : ''}`}
          onClick={() => setActiveStatus('pending_pay')}
        >
          <Text>待支付</Text>
        </View>
        <View 
          className={`filter-item ${activeStatus === 'pending_confirm' ? 'active' : ''}`}
          onClick={() => setActiveStatus('pending_confirm')}
        >
          <Text>待确认</Text>
        </View>
        <View 
          className={`filter-item ${activeStatus === 'pending_checkin' ? 'active' : ''}`}
          onClick={() => setActiveStatus('pending_checkin')}
        >
          <Text>待入住</Text>
        </View>
        <View 
          className={`filter-item ${activeStatus === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveStatus('completed')}
        >
          <Text>已完成</Text>
        </View>
        <View 
          className={`filter-item ${activeStatus === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveStatus('cancelled')}
        >
          <Text>已取消</Text>
        </View>
      </View>
      
      {/* 订单列表 */}
      <View className='order-list'>
        {orders.length === 0 && loading ? (
          <View className='loading-container'>
            <Text className='loading-text'>正在加载订单信息...</Text>
          </View>
        ) : orders.length > 0 ? (
          <>
            {orders.map(order => (
              <View key={order.id} className='order-item' onClick={(e) => handleOrderAction(order.id, 'view', e)}>
                <View className='order-item-header'>
                  <Text className='hotel-name'>{order.hotel_name || order.hotel?.name || '未知酒店'}</Text>
                  <Text className={`order-status ${order.status === 'pending' ? 'status-pending' : ''}`}>
                    {order.status === 'pending' && '待支付'}
                    {order.status === 'paid' && '已付款'}
                    {order.status === 'completed' && '已完成'}
                    {order.status === 'cancelled' && '已取消'}
                  </Text>
                </View>
                
                <View className='order-item-body'>
                  <Text className='order-date'>
                    {order.check_in_date} - {order.check_out_date}
                  </Text>
                  <Text className='order-price'>¥{order.total_price}</Text>
                </View>
                
                <View className='order-item-footer'>
                  {order.status === 'pending' && (
                    <>
                      <View 
                        className='order-btn cancel-btn' 
                        onClick={(e) => handleOrderAction(order.id, 'cancel', e)}
                      >
                        取消订单
                      </View>
                      <View 
                        className='order-btn confirm-btn' 
                        onClick={(e) => handleOrderAction(order.id, 'pay', e)}
                      >
                        立即支付
                      </View>
                    </>
                  )}
                  {order.status === 'paid' && (
                    <>
                      <View 
                        className='order-btn cancel-btn' 
                        onClick={(e) => handleOrderAction(order.id, 'cancel', e)}
                      >
                        取消订单
                      </View>
                      <View 
                        className='order-btn view-btn' 
                        onClick={(e) => handleOrderAction(order.id, 'view', e)}
                      >
                        查看详情
                      </View>
                    </>
                  )}
                  {order.status === 'completed' && (
                    <View className='order-btn view-btn' onClick={(e) => handleOrderAction(order.id, 'view', e)}>
                      查看详情
                    </View>
                  )}
                  {order.status === 'cancelled' && (
                    <View className='order-btn view-btn' onClick={(e) => handleOrderAction(order.id, 'view', e)}>
                      查看详情
                    </View>
                  )}
                </View>
              </View>
            ))}
            {/* 底部加载状态 */}
            <View className='list-footer' style={{ padding: '20px 0', textAlign: 'center', color: '#999', fontSize: '14px' }}>
               {loading && <Text>加载中...</Text>}
               {!loading && !hasMore && <Text>没有更多了</Text>}
            </View>
          </>
        ) : (
          <View className='empty-container'>
            <Text className='empty-text'>暂无订单记录</Text>
            <Text className='empty-subtext'>您还没有任何订单</Text>
            <View className='empty-btn' onClick={() => Taro.switchTab({ url: '/pages/index/index' })}>
              <Text>去预订酒店</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}