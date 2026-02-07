import { View, Text, Button } from '@tarojs/components'
import { useCallback } from 'react'
import './order.less'

export default function OrderPage () {
  // 模拟订单数据
  const orders = [
    {
      id: '1',
      hotelName: '北京王府井希尔顿酒店',
      checkInDate: '2026-02-08',
      checkOutDate: '2026-02-09',
      status: '待确认',
      price: '1288'
    },
    {
      id: '2',
      hotelName: '上海外滩华尔道夫酒店',
      checkInDate: '2026-02-10',
      checkOutDate: '2026-02-12',
      status: '已确认',
      price: '2588'
    }
  ]

  // 处理订单操作
  const handleOrderAction = useCallback((orderId, action) => {
    console.log('订单操作:', orderId, action)
  }, [])

  return (
    <View className='order-page'>
      <View className='order-header'>
        <Text className='order-header-title'>我的订单</Text>
      </View>
      
      <View className='order-list'>
        {orders.map(order => (
          <View key={order.id} className='order-item'>
            <View className='order-item-header'>
              <Text className='hotel-name'>{order.hotelName}</Text>
              <Text className={`order-status ${order.status === '待确认' ? 'status-pending' : ''}`}>
                {order.status}
              </Text>
            </View>
            
            <View className='order-item-body'>
              <Text className='order-date'>
                {order.checkInDate} - {order.checkOutDate}
              </Text>
              <Text className='order-price'>¥{order.price}/晚</Text>
            </View>
            
            <View className='order-item-footer'>
              {order.status === '待确认' && (
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
              {order.status === '已确认' && (
                <View className='order-btn view-btn' onClick={() => handleOrderAction(order.id, 'view')}>
                  查看详情
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}