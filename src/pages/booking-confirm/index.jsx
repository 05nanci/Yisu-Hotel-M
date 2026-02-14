import { useState, useEffect } from 'react'
import { View, Text, Image, Button, Input, Checkbox, Swiper, SwiperItem, Navigator } from '@tarojs/components'
import { AtIcon, AtToast } from 'taro-ui'
import Taro from '@tarojs/taro'
import './index.less'

const BookingConfirm = () => {
  // 1. 页面状态管理
  const [bookingInfo, setBookingInfo] = useState({
    hotelName: '回坊轩礼精品酒店(西安回民街钟楼地铁站店)',
    checkInDate: '2月7日 今天',
    checkOutDate: '2月8日 明天',
    nights: '1晚',
    roomType: '舒雅大床房',
    bedInfo: '1张1.8米大床',
    breakfast: '无早餐',
    freeCancel: '02月07日23:00前可免费取消',
    immediateConfirm: true,
    remainingRooms: 1,
    price: {
      original: 228,
      discount: 218,
      coupon: 10,
      final: 141,
      points: 71
    }
  })

  const [guestInfo, setGuestInfo] = useState({
    name: '张三', 
    phone: '12345678901'
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

  // 2. 页面加载时获取路由参数
  useEffect(() => {
    const routerParams = Taro.getCurrentInstance().router?.params || {}
    setBookingToken(routerParams.bookingToken || '')
  }, [])

  // 3. 简化的验证逻辑（降低验证门槛，优先保证跳转）
  const validateGuestInfo = () => {
    // 临时简化：只要有内容就通过，方便测试跳转
    if (!guestInfo.name || guestInfo.name.trim() === '') {
      AtToast({ text: '请输入住客姓名', type: 'error', duration: 2000 })
      return false
    }
    // 简化手机号验证：只要长度够就通过
    if (!guestInfo.phone || guestInfo.phone.replace(/\s+/g, '').length !== 11) {
      AtToast({ text: '请输入正确的手机号码', type: 'error', duration: 2000 })
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
      
      // 模拟生成订单ID（后续替换为真实接口返回）
      const mockBookingId = 'BK_' + Date.now()
      console.log('跳转支付页，订单ID：', mockBookingId)
      
      // 关键：跳转到支付页（确保路由路径正确）
      Taro.navigateTo({
        url: `/pages/payment/index?booking_id=${mockBookingId}`,
        success: () => {
          console.log('跳转支付页成功')
        },
        fail: (err) => {
          console.error('跳转失败：', err)
          AtToast({ text: '跳转支付页失败', type: 'error', duration: 2000 })
        }
      })
    } catch (error) {
      console.error('提交订单异常：', error)
      AtToast({ text: '提交订单失败', type: 'error', duration: 2000 })
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
      {/* 顶部酒店信息 */}
      <View className='header-section'>
        <View className='hotel-info'>
          <Text className='hotel-name'>{bookingInfo.hotelName}</Text>
        </View>
        <View className='booking-dates'>
          <Text>{bookingInfo.checkInDate} - {bookingInfo.checkOutDate}</Text>
          <Text className='nights'>{bookingInfo.nights}</Text>
          <Navigator url='/pages/room-detail/index' className='room-detail-link'>房型详情</Navigator>
        </View>
        <View className='room-info'>
          <Text>{bookingInfo.roomType} | {bookingInfo.bedInfo} | {bookingInfo.breakfast}</Text>
        </View>
        <View className='cancel-policy'>
          <View className='policy-item'>
            <AtIcon value='check-circle' size='16' color='#07c160' />
            <Text>{bookingInfo.freeCancel}</Text>
          </View>
          {bookingInfo.immediateConfirm && (
            <View className='policy-item'>
              <AtIcon value='check-circle' size='16' color='#07c160' />
              <Text>立即确认</Text>
            </View>
          )}
        </View>
      </View>

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