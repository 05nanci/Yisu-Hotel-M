import { View, Text, Button } from '@tarojs/components'
import { useCallback, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { orderApi } from '../../services/api'
import './order.less'

export default function OrderPage () {
  // 状态管理
  const [activeStatus, setActiveStatus] = useState('all')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // 初始化时检查路由参数
  useEffect(() => {
    const params = Taro.getCurrentInstance().router.params
    if (params && params.status) {
      setActiveStatus(params.status)
    }
  }, [])

  // 当状态变化时获取订单数据
  useEffect(() => {
    fetchOrders()
  }, [activeStatus])

  // 获取订单数据
  const fetchOrders = async () => {
    try {
      setLoading(true)
      
      // 调用后端API获取订单
      const response = await orderApi.getOrders({
        status: activeStatus === 'all' ? '' : mapStatusToApi(activeStatus)
      })
      
      if (response.code === 0 && response.data) {
        setOrders(response.data.list || [])
      } else {
        // 处理不同错误码
        const errorMessage = response.msg || '获取订单失败'
        Taro.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 2000
        })
        
        // 处理登录失效等特殊情况
        if (response.code === 4008) {
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
      let errorMessage = '获取订单失败，请检查网络连接'
      if (error.message.includes('401') || error.message.includes('403')) {
        errorMessage = '登录已过期，请重新登录'
        setTimeout(() => {
          Taro.navigateTo({
            url: '/pages/login/login'
          })
        }, 1500)
      }
      
      Taro.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // 映射本地状态到API状态
  const mapStatusToApi = (status) => {
    const statusMap = {
      'pending_pay': 'pending',
      'pending_confirm': 'paid',
      'pending_checkin': 'paid',
      'completed': 'completed'
    }
    return statusMap[status] || status
  }

  // 下拉刷新
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchOrders()
  }

  // 处理订单操作
  const handleOrderAction = useCallback(async (orderId, action) => {
    console.log('订单操作:', orderId, action)
    if (action === 'pay') {
      // 跳转到支付页面
      Taro.navigateTo({
        url: `/pages/payment/index?orderId=${orderId}`
      })
    } else if (action === 'view') {
      // 跳转到订单详情页面（如果存在）
      try {
        // 检查订单详情页面是否存在
        Taro.navigateTo({
          url: `/pages/order-detail/index?orderId=${orderId}`
        })
      } catch (error) {
        // 如果订单详情页面不存在，跳转到酒店详情页面
        Taro.navigateTo({
          url: `/pages/hotel-detail/index?hotelId=${orderId}`
        })
      }
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
  }, [])

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
        {loading && !refreshing ? (
          <View className='loading-container'>
            <Text className='loading-text'>正在加载订单信息...</Text>
          </View>
        ) : orders.length > 0 ? (
          orders.map(order => (
            <View key={order.id} className='order-item'>
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
                      onClick={() => handleOrderAction(order.id, 'cancel')}
                    >
                      取消订单
                    </View>
                    <View 
                      className='order-btn confirm-btn' 
                      onClick={() => handleOrderAction(order.id, 'pay')}
                    >
                      立即支付
                    </View>
                  </>
                )}
                {order.status === 'paid' && (
                  <>
                    <View 
                      className='order-btn cancel-btn' 
                      onClick={() => handleOrderAction(order.id, 'cancel')}
                    >
                      取消订单
                    </View>
                    <View 
                      className='order-btn view-btn' 
                      onClick={() => handleOrderAction(order.id, 'view')}
                    >
                      查看详情
                    </View>
                  </>
                )}
                {order.status === 'completed' && (
                  <View className='order-btn view-btn' onClick={() => handleOrderAction(order.id, 'view')}>
                    查看详情
                  </View>
                )}
                {order.status === 'cancelled' && (
                  <View className='order-btn view-btn' onClick={() => handleOrderAction(order.id, 'view')}>
                    查看详情
                  </View>
                )}
              </View>
            </View>
          ))
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