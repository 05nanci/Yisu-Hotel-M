import { useState, useEffect } from 'react'
import { View, Text, Image, Button, Input, Checkbox, Swiper, SwiperItem, Navigator } from '@tarojs/components'
import { AtIcon, AtToast } from 'taro-ui'
import Taro from '@tarojs/taro'
import { bookingApi, hotelApi } from '../../services/api'
import './index.less'

const BookingConfirm = () => {
  // 1. 页面状态管理
  const [bookingInfo, setBookingInfo] = useState({
    hotelName: '',
    checkInDate: '',
    checkOutDate: '',
    nights: '1晚',
    roomType: '',
    bedInfo: '',
    breakfast: '无早餐',
    freeCancel: '',
    immediateConfirm: true,
    remainingRooms: 1,
    price: {
      original: 0,
      discount: 0,
      coupon: 0,
      final: 0,
      points: 0
    }
  })

  const [guestInfo, setGuestInfo] = useState({
    name: '', 
    phone: ''
  })

  const [specialRequests, setSpecialRequests] = useState([
    { id: 1, name: '吸烟偏好', selected: false },
    { id: 2, name: '电梯远近', selected: false }
  ])

  const [invoiceInfo, setInvoiceInfo] = useState({
    type: '酒店开具发票'
  })

  const [loading, setLoading] = useState(false)
  const [bookingToken, setBookingToken] = useState('')
  const [hotelId, setHotelId] = useState('')
  const [roomId, setRoomId] = useState('')
  const [fetchingData, setFetchingData] = useState(true)

  // 2. 页面加载时获取路由参数和酒店详情
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true)
        const routerParams = Taro.getCurrentInstance().router?.params || {}
        const { hotelId, roomId, checkInDate, checkOutDate } = routerParams
        
        setHotelId(hotelId || '')
        setRoomId(roomId || '')
        setBookingToken(routerParams.bookingToken || '')
        
        // 保存原始日期格式，用于提交给后端
        let originalCheckInDate = ''
        let originalCheckOutDate = ''
        
        // 如果有酒店ID，获取酒店详情
        if (hotelId) {
          const hotelDetail = await hotelApi.getHotelDetail(hotelId)
          if (hotelDetail.code === 0 && hotelDetail.data) {
            const hotelData = hotelDetail.data
            
            // 根据roomId查找对应的房型
            let selectedRoomType = null
            if (roomId && hotelData.room_types && hotelData.room_types.length > 0) {
              selectedRoomType = hotelData.room_types.find(room => room.id === roomId)
            }
            
            // 如果没有找到对应的房型，使用第一个房型
            if (!selectedRoomType && hotelData.room_types && hotelData.room_types.length > 0) {
              selectedRoomType = hotelData.room_types[0]
            }
            
            // 获取房型价格
            const roomPrice = selectedRoomType?.prices?.[0]?.price || 0
            
            setBookingInfo(prev => ({
              ...prev,
              hotelName: hotelData.hotel_name_cn || '',
              roomType: selectedRoomType?.room_type_name || '',
              bedInfo: selectedRoomType?.bed_type || '',
              price: {
                original: roomPrice,
                discount: 0,
                coupon: 0,
                final: roomPrice,
                points: Math.floor(roomPrice * 0.5)
              }
            }))
          }
        }
        
        // 设置日期
        if (checkInDate && checkOutDate) {
          // 保存原始日期格式
          originalCheckInDate = checkInDate
          originalCheckOutDate = checkOutDate
          
          // 验证日期是否有效
          const today = new Date()
          const start = new Date(checkInDate)
          const end = new Date(checkOutDate)
          
          // 调整为当天的23:59:59，确保今天的日期被认为是有效的
          const todayEnd = new Date(today)
          todayEnd.setHours(23, 59, 59, 999)
          
          // 如果入住日期早于今天，使用今天作为默认入住日期
          if (start < today) {
            // 格式化为标准日期格式
            originalCheckInDate = today.toISOString().split('T')[0]
            originalCheckOutDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
          
          // 计算入住天数
          const nights = Math.ceil((new Date(originalCheckOutDate) - new Date(originalCheckInDate)) / (1000 * 60 * 60 * 24))
          
          // 格式化日期显示
          const formatDate = (dateString) => {
            const date = new Date(dateString)
            const month = date.getMonth() + 1
            const day = date.getDate()
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const tomorrow = new Date(today)
            tomorrow.setDate(today.getDate() + 1)
            
            if (date.toDateString() === today.toDateString()) {
              return `${month}月${day}日 今天`
            } else if (date.toDateString() === tomorrow.toDateString()) {
              return `${month}月${day}日 明天`
            } else {
              return `${month}月${day}日`
            }
          }
          
          setBookingInfo(prev => ({
            ...prev,
            checkInDate: formatDate(originalCheckInDate),
            checkOutDate: formatDate(originalCheckOutDate),
            nights: `${nights}晚`,
            originalCheckInDate: originalCheckInDate,
            originalCheckOutDate: originalCheckOutDate
          }))
        } else {
          // 默认日期
          const today = new Date()
          const tomorrow = new Date(today)
          tomorrow.setDate(today.getDate() + 1)
          
          // 格式化为标准日期格式
          originalCheckInDate = today.toISOString().split('T')[0]
          originalCheckOutDate = tomorrow.toISOString().split('T')[0]
          
          const formatDate = (date) => {
            const month = date.getMonth() + 1
            const day = date.getDate()
            return `${month}月${day}日`
          }
          
          setBookingInfo(prev => ({
            ...prev,
            checkInDate: `${formatDate(today)} 今天`,
            checkOutDate: `${formatDate(tomorrow)} 明天`,
            nights: '1晚',
            originalCheckInDate: originalCheckInDate,
            originalCheckOutDate: originalCheckOutDate
          }))
        }
      } catch (error) {
        console.error('获取数据失败:', error)
        Taro.showToast({ title: '获取数据失败', icon: 'none', duration: 2000 })
      } finally {
        setFetchingData(false)
      }
    }
    
    fetchData()
  }, [])

  // 3. 简化的验证逻辑（降低验证门槛，优先保证跳转）
  const validateGuestInfo = () => {
    // 临时简化：只要有内容就通过，方便测试跳转
    if (!guestInfo.name || guestInfo.name.trim() === '') {
      Taro.showToast({ title: '请输入住客姓名', icon: 'none', duration: 2000 })
      return false
    }
    // 简化手机号验证：只要长度够就通过
    if (!guestInfo.phone || guestInfo.phone.replace(/\s+/g, '').length !== 11) {
      Taro.showToast({ title: '请输入正确的手机号码', icon: 'none', duration: 2000 })
      return false
    }
    return true
  }

  // 4. 核心：修复后的立即支付点击逻辑
  const handleSubmitBooking = async () => {
    console.log('立即支付按钮被点击了') // 用于调试
    
    // 验证信息
    const isValid = validateGuestInfo()
    if (!isValid) return

    try {
      setLoading(true)
      
      // 验证并调整日期
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const checkInDate = new Date(bookingInfo.originalCheckInDate)
      checkInDate.setHours(0, 0, 0, 0)
      const checkOutDate = new Date(bookingInfo.originalCheckOutDate)
      checkOutDate.setHours(0, 0, 0, 0)
      
      // 确保入住日期不早于今天
      if (checkInDate < today) {
        Taro.showToast({ title: '入住日期不能早于今天', icon: 'none', duration: 2000 })
        setLoading(false)
        return
      }
      
      // 确保入住日期早于退房日期
      if (checkInDate >= checkOutDate) {
        Taro.showToast({ title: '入住日期必须早于退房日期', icon: 'none', duration: 2000 })
        setLoading(false)
        return
      }
      
      // 准备预订数据
      const bookingData = {
        hotel_id: hotelId,
        room_type_id: roomId,
        check_in_date: bookingInfo.originalCheckInDate,
        check_out_date: bookingInfo.originalCheckOutDate,
        contact_name: guestInfo.name,
        contact_phone: guestInfo.phone,
        special_requests: specialRequests.filter(item => item.selected).map(item => item.name).join(',')
      }
      
      console.log('提交预订数据：', bookingData)
      
      // 调用后端API创建预订
      const response = await bookingApi.createBooking(bookingData)
      
      if (response.code === 0 && response.data) {
        const bookingId = response.data.booking_id || response.data.id || 'BK_' + Date.now()
        console.log('创建预订成功，订单ID：', bookingId)
        
        // 关键：跳转到支付页（确保路由路径正确）
        Taro.navigateTo({
          url: `/pages/payment/index?booking_id=${bookingId}`,
          success: () => {
            console.log('跳转支付页成功')
          },
          fail: (err) => {
            console.error('跳转失败：', err)
            Taro.showToast({ title: '跳转支付页失败', icon: 'none', duration: 2000 })
          }
        })
      } else {
        console.error('创建预订失败：', response.msg || '未知错误')
        Taro.showToast({ title: response.msg || '创建预订失败', icon: 'none', duration: 2000 })
      }
    } catch (error) {
      console.error('提交订单异常：', error)
      Taro.showToast({ title: '提交订单失败', icon: 'none', duration: 2000 })
    } finally {
      setLoading(false)
    }
  }

  // 5. 特殊要求选择逻辑
  const handleSpecialRequestToggle = (id) => {
    setSpecialRequests(prev =>
      prev.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    )
  }

  return (
    <View className='booking-confirm-page'>
      {/* 返回按钮 */}
      <View className='back-button' onClick={() => Taro.navigateBack()}>
        <Text className='back-icon'>←</Text>
        <Text className='back-text'>返回</Text>
      </View>
      
      {/* 加载状态 */}
      {fetchingData ? (
        <View className='loading-container'>
          <Text className='loading-text'>加载中...</Text>
        </View>
      ) : (
        <>
          {/* 顶部酒店信息 */}
          <View className='header-section'>
            <View className='hotel-info'>
              <Text className='hotel-name'>{bookingInfo.hotelName || '酒店名称'}</Text>
            </View>
            <View className='booking-dates'>
              <Text>{bookingInfo.checkInDate || '入住日期'} - {bookingInfo.checkOutDate || '离店日期'}</Text>
              <Text className='nights'>{bookingInfo.nights}</Text>
              <Navigator url={`/pages/hotel-detail/index?id=${hotelId}`} className='room-detail-link'>房型详情</Navigator>
            </View>
            <View className='room-info'>
              <Text>{bookingInfo.roomType || '房型'} | {bookingInfo.bedInfo || '床型'} | {bookingInfo.breakfast}</Text>
            </View>
            <View className='cancel-policy'>
              <View className='policy-item'>
                <AtIcon value='check-circle' size='16' color='#07c160' />
                <Text>{bookingInfo.freeCancel || '入住前24小时可免费取消'}</Text>
              </View>
              {bookingInfo.immediateConfirm && (
                <View className='policy-item'>
                  <AtIcon value='check-circle' size='16' color='#07c160' />
                  <Text>立即确认</Text>
                </View>
              )}
            </View>
          </View>
        </>
      )}

      {/* 提示条 */}
      <View className='tip-bar'>
        <AtIcon value='volume' size='16' color='#ff976a' />
        <Text>精选好房正在路上</Text>
      </View>

      {/* 订房信息 */}
      <View className='booking-info-section'>
        <View className='section-title'>
          <Text>订房信息</Text>
          <AtIcon value='question-circle' size='16' color='#999' />
        </View>
        <View className='remaining-rooms'>
          <Text className='red'>仅剩{bookingInfo.remainingRooms}间</Text>
          <View className='quantity-selector'>
            <AtIcon value='minus-circle' size='20' color='#ccc' />
            <Text>1间</Text>
            <AtIcon value='plus-circle' size='20' color='#07c160' />
          </View>
        </View>

        <View className='form-item'>
          <Text className='label'>住客姓名*</Text>
          <Input
            value={guestInfo.name}
            placeholder='请输入住客姓名'
            onInput={(e) => setGuestInfo({ ...guestInfo, name: e.detail.value })}
          />
          <AtIcon value='user' size='20' color='#999' />
        </View>

        <View className='form-item'>
          <Text className='label'>联系手机*</Text>
          <View className='phone-input'>
            <Text>+86</Text>
            <Input
              value={guestInfo.phone}
              placeholder='请输入手机号码'
              onInput={(e) => setGuestInfo({ ...guestInfo, phone: e.detail.value })}
            />
            <AtIcon value='book' size='20' color='#999' />
          </View>
        </View>

        <View className='phone-tip'>
          <Text>请注意是否用此号码接收订单信息</Text>
          <AtIcon value='close' size='16' color='#999' />
        </View>
      </View>

      {/* 本单可享 */}
      <View className='benefits-section'>
        <View className='section-title'>
          <Text>本单可享</Text>
          <Text className='final-price'>已享最大优惠 ¥{bookingInfo.price.original}</Text>
        </View>

        <View className='benefit-item'>
          <Text>促销优惠</Text>
          <View className='benefit-value'>
            <Text>3项优惠 共减¥{bookingInfo.price.discount}</Text>
            <AtIcon value='chevron-down' size='16' color='#999' />
          </View>
        </View>

        <View className='benefit-item'>
          <Text>优惠券</Text>
          <View className='benefit-value'>
            <Text>满减券 减¥{bookingInfo.price.coupon}</Text>
            <AtIcon value='chevron-right' size='16' color='#999' />
          </View>
        </View>

        <View className='benefit-item'>
          <Text>离店赚积分</Text>
          <View className='benefit-value'>
            <Text>{bookingInfo.price.points}积分</Text>
            <AtIcon value='chevron-right' size='16' color='#999' />
          </View>
        </View>
      </View>

      {/* 特殊要求 */}
      <View className='special-requests-section'>
        <View className='section-title'>
          <Text>特殊要求</Text>
        </View>
        <View className='request-tags'>
          {specialRequests.map(item => (
            <View
              key={item.id}
              className={`request-tag ${item.selected ? 'selected' : ''}`}
              onClick={() => handleSpecialRequestToggle(item.id)}
            >
              <Text>{item.name}</Text>
            </View>
          ))}
          <View className='more-requests'>
            <Text>更多入住要求</Text>
            <AtIcon value='chevron-right' size='16' color='#999' />
          </View>
        </View>
      </View>

      {/* 发票 */}
      <View className='invoice-section'>
        <View className='section-title'>
          <Text>发票</Text>
        </View>
        <View className='invoice-info'>
          <Text>{invoiceInfo.type}</Text>
          <AtIcon value='question-circle' size='16' color='#999' />
        </View>
      </View>

      {/* 底部支付栏（已缩小） */}
      <View className='bottom-bar'>
        <View className='price-info'>
          <Text>在线付</Text>
          <Text className='final-price'>¥{bookingInfo.price.final}</Text>
          <View className='price-detail'>
            <Text>查看明细</Text>
            <AtIcon value='chevron-down' size='14' color='#999' />
            <View className='new-user-tag'>新人价</View>
          </View>
        </View>
        {/* 关键：确保onClick绑定正确，无拼写错误 */}
        <Button
          className='pay-btn'
          onClick={handleSubmitBooking}
          loading={loading}
          disabled={loading}
          hoverClass='pay-btn-hover' // 增加点击反馈
        >
          立即支付
        </Button>
      </View>
    </View>
  )
}

export default BookingConfirm