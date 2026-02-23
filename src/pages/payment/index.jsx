import { useState, useEffect } from 'react'
import { View, Text, Image, Button, Radio, ScrollView } from '@tarojs/components'
import { AtIcon, AtToast, AtActivityIndicator } from 'taro-ui'
import Taro from '@tarojs/taro'
import { bookingApi, couponApi } from '../../services/api'
import './index.less'

const PaymentPage = () => {
  const [bookingDetail, setBookingDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [coupons, setCoupons] = useState([])
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  
  // Payment methods state (keeping the UI structure)
  const [paymentMethods] = useState([
    {
      id: 'wechat',
      name: '微信支付',
      icon: 'https://img.icons8.com/color/96/wechat.png',
      checked: true
    },
    {
      id: 'alipay',
      name: '支付宝支付',
      icon: 'https://img.icons8.com/color/96/alipay.png',
      checked: false
    },
    {
      id: 'unionpay',
      name: '云闪付',
      icon: 'https://img.icons8.com/color/96/unionpay.png',
      checked: false
    }
  ])
  const [selectedMethod, setSelectedMethod] = useState('wechat')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const params = Taro.getCurrentInstance().router?.params || {}
        // Fallback to storage if not in params (for backward compatibility or reload)
        const storageParams = Taro.getStorageSync('paymentPayload') || {}
        const bookingId = params.bookingId || storageParams.bookingId

        if (!bookingId) {
          Taro.showToast({ title: '参数错误: 缺少订单ID', icon: 'none' })
          setLoading(false)
          return
        }

        // Fetch Booking Detail
        console.log('Fetching booking detail for:', bookingId)
        
        const detailRes = await bookingApi.getBookingDetail(bookingId)

        console.log('Booking detail response:', detailRes)

        if (detailRes && detailRes.code === 0 && detailRes.data) {
          setBookingDetail(detailRes.data)
          
          // If pending, fetch coupons
          if (detailRes.data.status === 'pending') {
            fetchCoupons()
          }
        } else {
          Taro.showToast({ title: detailRes?.msg || '获取订单详情失败', icon: 'none' })
        }
      } catch (error) {
        console.error('Fetch error:', error)
        Taro.showToast({ title: '网络请求失败', icon: 'none' })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const fetchCoupons = async () => {
    try {
      const res = await couponApi.getCoupons({ type: 'available' })
      if (res && res.code === 0) {
        setCoupons(res.data?.coupons || [])
      }
    } catch (error) {
      console.error('Fetch coupons error:', error)
    }
  }

  const handlePay = async () => {
    if (!bookingDetail) return
    
    try {
      setLoading(true)
      const paymentData = {
        booking_id: bookingDetail.id,
        order_id: bookingDetail.id,
        payment_method: selectedMethod,
        transaction_id: `TXN_${Date.now()}` // Simulation
      }
      
      const res = await bookingApi.payBooking(paymentData)
      
      if (res && res.code === 0) {
        Taro.showToast({ title: '支付成功', icon: 'success' })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      } else {
        Taro.showToast({ title: res?.msg || '支付失败', icon: 'none' })
      }
    } catch (error) {
      console.error('Pay error:', error)
      Taro.showToast({ title: '支付请求失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#ff9900'
      case 'paid': return '#07c160'
      case 'cancelled': return '#999999'
      case 'completed': return '#10aeff'
      default: return '#333'
    }
  }

  if (loading && !bookingDetail) {
    return (
      <View className='payment-page loading'>
        <AtActivityIndicator mode='center' content='加载中...' />
      </View>
    )
  }

  if (!bookingDetail) {
    return (
      <View className='payment-page empty'>
        <View className='back-button' onClick={() => Taro.navigateBack()}>
          <Text className='back-icon'>←</Text>
          <Text className='back-text'>返回</Text>
        </View>
        <Text>未找到订单信息</Text>
      </View>
    )
  }

  return (
    <View className='payment-page'>
      {/* 返回按钮 */}
      <View className='back-button' onClick={() => Taro.navigateBack()}>
        <Text className='back-icon'>←</Text>
        <Text className='back-text'>返回</Text>
      </View>

      <ScrollView scrollY className='content-scroll'>
        {/* 订单详情卡片 */}
        <View className='booking-detail-card'>
            <View className='card-header'>
                <Text className='hotel-name'>{bookingDetail.hotel_name}</Text>
                <Text className='status-text' style={{color: getStatusColor(bookingDetail.status)}}>
                    {bookingDetail.status_text}
                </Text>
            </View>
            
            <View className='detail-row'>
                <Text className='label'>订单号</Text>
                <Text className='value'>{bookingDetail.order_number}</Text>
            </View>
            <View className='detail-row'>
                <Text className='label'>地址</Text>
                <Text className='value'>{bookingDetail.hotel_address}</Text>
            </View>
            <View className='detail-row'>
                <Text className='label'>房型</Text>
                <Text className='value'>{bookingDetail.room_type}</Text>
            </View>
            <View className='detail-row'>
                <Text className='label'>入离日期</Text>
                <Text className='value'>{bookingDetail.check_in_date} 至 {bookingDetail.check_out_date}</Text>
            </View>
            <View className='detail-row'>
                <Text className='label'>入住人</Text>
                <Text className='value'>{bookingDetail.contact_name} {bookingDetail.contact_phone}</Text>
            </View>
             <View className='detail-row'>
                <Text className='label'>特殊要求</Text>
                <Text className='value'>{bookingDetail.special_requests || '无'}</Text>
            </View>
             <View className='detail-row'>
                <Text className='label'>下单时间</Text>
                <Text className='value'>{new Date(bookingDetail.booked_at).toLocaleString()}</Text>
            </View>
            
            <View className='divider' />
            
            <View className='price-row'>
                <Text className='label'>订单总价</Text>
                <Text className='price'>¥{bookingDetail.price_detail?.total_price || bookingDetail.total_price}</Text>
            </View>
        </View>

        {/* 支付栏 (仅当状态为 pending 时显示) */}
        {bookingDetail.status === 'pending' && (
            <View className='payment-section'>
                {/* 优惠券栏 */}
                <View className='coupon-section'>
                    <View className='section-title'>优惠券</View>
                    <View className='coupon-selector'>
                        <Text>{coupons.length > 0 ? `${coupons.length}张可用` : '暂无可用优惠券'}</Text>
                        <AtIcon value='chevron-right' size='16' color='#999' />
                    </View>
                </View>

                {/* 支付方式栏 */}
                <View className='payment-methods'>
                    <View className='section-title'>支付方式</View>
                    {paymentMethods.map(method => (
                        <View 
                            key={method.id} 
                            className='payment-method-item'
                            onClick={() => setSelectedMethod(method.id)}
                        >
                            <View className='left'>
                                <Image src={method.icon} className='method-icon' />
                                <Text>{method.name}</Text>
                            </View>
                            <Radio checked={selectedMethod === method.id} color='#007aff' />
                        </View>
                    ))}
                </View>
                
                <Button 
                    className='pay-button' 
                    onClick={handlePay}
                    loading={loading}
                >
                    立即支付 ¥{bookingDetail.price_detail?.total_price || bookingDetail.total_price}
                </Button>
            </View>
        )}
      </ScrollView>
    </View>
  )
}

export default PaymentPage
