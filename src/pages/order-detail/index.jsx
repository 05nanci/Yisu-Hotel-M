import { useState, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { orderApi } from '../../services/api'
import './index.less'

const OrderDetailPage = () => {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orderId, setOrderId] = useState('')

  // 页面加载时获取订单详情
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true)
        // 从路由参数获取订单ID
        const { orderId: id } = Taro.getCurrentInstance().router?.params || {}
        if (!id) {
          Taro.showToast({
            title: '订单ID不能为空',
            icon: 'none'
          })
          setTimeout(() => {
            Taro.navigateBack()
          }, 1000)
          return
        }
        setOrderId(id)

        // 调用API获取订单详情
        const response = await orderApi.getOrderDetail(id)
        if (response.code === 0 && response.data) {
          setOrder(response.data)
        } else {
          Taro.showToast({
            title: response.msg || '获取订单详情失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取订单详情失败:', error)
        let errorMessage = '获取订单详情失败，请检查网络连接'
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
      }
    }

    fetchOrderDetail()
  }, [])

  // 处理支付操作
  const handlePay = async () => {
    try {
      await orderApi.payOrder(orderId)
      Taro.showToast({
        title: '支付成功',
        icon: 'success'
      })
      // 重新获取订单详情
      const response = await orderApi.getOrderDetail(orderId)
      if (response.code === 0 && response.data) {
        setOrder(response.data)
      }
    } catch (error) {
      Taro.showToast({
        title: error.message || '支付失败',
        icon: 'none'
      })
    }
  }

  // 处理取消订单
  const handleCancel = async () => {
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
            // 重新获取订单详情
            const response = await orderApi.getOrderDetail(orderId)
            if (response.code === 0 && response.data) {
              setOrder(response.data)
            }
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

  // 跳转到酒店详情
  const handleNavigateToHotel = () => {
    if (order?.hotel_id) {
      Taro.navigateTo({
        url: `/pages/hotel-detail/index?hotelId=${order.hotel_id}`
      })
    }
  }

  if (loading) {
    return (
      <View className='order-detail-loading'>
        <Text>加载中...</Text>
      </View>
    )
  }

  if (!order) {
    return (
      <View className='order-detail-empty'>
        <Text>订单不存在或已被删除</Text>
        <Button onClick={() => Taro.navigateBack()}>返回</Button>
      </View>
    )
  }

  return (
    <View className='order-detail-page'>
      {/* 订单状态 */}
      <View className='order-status-section'>
        <Text className={`order-status ${order.status === 'pending' ? 'status-pending' : ''}`}>
          {order.status === 'pending' && '待支付'}
          {order.status === 'paid' && '已付款'}
          {order.status === 'completed' && '已完成'}
          {order.status === 'cancelled' && '已取消'}
        </Text>
        {order.status === 'pending' && (
          <Text className='status-desc'>请在规定时间内完成支付</Text>
        )}
      </View>

      {/* 酒店信息 */}
      <View className='hotel-info-section'>
        <View className='section-header'>
          <Text className='section-title'>酒店信息</Text>
        </View>
        <View className='hotel-info' onClick={handleNavigateToHotel}>
          <Text className='hotel-name'>{order.hotel_name}</Text>
          <Text className='hotel-address'>{order.location_info?.formatted_address || '地址信息未提供'}</Text>
        </View>
      </View>

      {/* 预订信息 */}
      <View className='booking-info-section'>
        <View className='section-header'>
          <Text className='section-title'>预订信息</Text>
        </View>
        <View className='info-item'>
          <Text className='info-label'>房型</Text>
          <Text className='info-value'>{order.room_type_name}</Text>
        </View>
        <View className='info-item'>
          <Text className='info-label'>入住日期</Text>
          <Text className='info-value'>{order.check_in_date}</Text>
        </View>
        <View className='info-item'>
          <Text className='info-label'>离店日期</Text>
          <Text className='info-value'>{order.check_out_date}</Text>
        </View>
        <View className='info-item'>
          <Text className='info-label'>联系人</Text>
          <Text className='info-value'>{order.contact_name}</Text>
        </View>
        <View className='info-item'>
          <Text className='info-label'>联系电话</Text>
          <Text className='info-value'>{order.contact_phone}</Text>
        </View>
        {order.special_requests && (
          <View className='info-item'>
            <Text className='info-label'>特殊要求</Text>
            <Text className='info-value'>{order.special_requests}</Text>
          </View>
        )}
      </View>

      {/* 价格明细 */}
      <View className='price-section'>
        <View className='section-header'>
          <Text className='section-title'>价格明细</Text>
        </View>
        <View className='info-item'>
          <Text className='info-label'>原价</Text>
          <Text className='info-value'>¥{order.original_total_price || order.total_price}</Text>
        </View>
        {order.discount_amount > 0 && (
          <View className='info-item'>
            <Text className='info-label'>优惠金额</Text>
            <Text className='info-value discount'>-¥{order.discount_amount}</Text>
          </View>
        )}
        <View className='info-item total'>
          <Text className='info-label'>总价</Text>
          <Text className='info-value total-price'>¥{order.total_price}</Text>
        </View>
      </View>

      {/* 订单元数据 */}
      <View className='order-meta-section'>
        <View className='section-header'>
          <Text className='section-title'>订单信息</Text>
        </View>
        <View className='info-item'>
          <Text className='info-label'>订单号</Text>
          <Text className='info-value'>{order.order_number}</Text>
        </View>
        <View className='info-item'>
          <Text className='info-label'>下单时间</Text>
          <Text className='info-value'>{new Date(order.booked_at).toLocaleString()}</Text>
        </View>
        {order.paid_at && (
          <View className='info-item'>
            <Text className='info-label'>支付时间</Text>
            <Text className='info-value'>{new Date(order.paid_at).toLocaleString()}</Text>
          </View>
        )}
      </View>

      {/* 操作按钮 */}
      <View className='action-section'>
        {order.status === 'pending' && (
          <>
            <Button className='cancel-btn' onClick={handleCancel}>
              取消订单
            </Button>
            <Button className='pay-btn' onClick={handlePay}>
              立即支付
            </Button>
          </>
        )}
        {order.status === 'paid' && (
          <>
            <Button className='cancel-btn' onClick={handleCancel}>
              取消订单
            </Button>
            <Button className='view-btn' onClick={handleNavigateToHotel}>
              查看酒店
            </Button>
          </>
        )}
        {order.status === 'completed' && (
          <Button className='view-btn' onClick={handleNavigateToHotel}>
            查看酒店
          </Button>
        )}
        {order.status === 'cancelled' && (
          <Button className='view-btn' onClick={handleNavigateToHotel}>
            查看酒店
          </Button>
        )}
      </View>
    </View>
  )
}

export default OrderDetailPage
