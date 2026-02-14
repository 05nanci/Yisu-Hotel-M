import { useState, useEffect } from 'react'
import { View, Text, Image, Button, Radio, RadioGroup, Navigator } from '@tarojs/components'
import { AtIcon, AtToast } from 'taro-ui'
import Taro from '@tarojs/taro'
import './index.less'

const PaymentPage = () => {
  // 页面状态管理
  const [paymentInfo, setPaymentInfo] = useState({
    orderTitle: '回坊轩礼精品酒店(西安回民街钟楼地铁站店)',
    totalAmount: 180.00,
    discount: '立减2-30元',
    remainingTime: '00:29:51',
    paymentMethods: [
      {
        id: 'chengpay',
        name: '程支付',
        type: 'group',
        items: [
          {
            id: 'new_card',
            name: '使用新卡支付',
            tag: '立减2-30元',
            checked: true
          },
          {
            id: 'add_icbc',
            name: '添加工商银行信用卡',
            tag: '最高立减10元',
            checked: false
          },
          {
            id: 'change_card',
            name: '换卡支付，支持境外卡',
            tag: '',
            checked: false
          }
        ]
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
      },
      {
        id: 'more',
        name: '其他支付方式',
        checked: false
      }
    ],
    financialServices: [
      {
        id: 'naquhua',
        name: '拿去花 | 信用购',
        tag: '官方推荐',
        discount: '立减10元',
        checked: false,
        installments: [
          {
            id: 'no_installment',
            name: '不分期',
            discount: '立减10元',
            desc: '最长40天免息，0服务费'
          },
          {
            id: 'installment_3',
            name: '¥58.41 X 3期',
            discount: '立减10元',
            desc: '含服务费¥1.74/期'
          }
        ]
      }
    ]
  })

  const [selectedMethod, setSelectedMethod] = useState('new_card')
  const [loading, setLoading] = useState(false)
  const [bookingId, setBookingId] = useState('')

  // 页面加载时获取支付信息
  useEffect(() => {
    const fetchPaymentInfo = async () => {
      try {
        setLoading(true)
        // 从路由参数获取 booking_id
        const { booking_id } = Taro.getCurrentInstance().router?.params || {}
        setBookingId(booking_id)

        // 调用 API 获取支付信息
        const res = await Taro.request({
          url: `/mobile/payments/${booking_id}/info`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${Taro.getStorageSync('token')}`
          }
        })

        if (res.data.code === 0) {
          setPaymentInfo(res.data.data)
        } else {
          AtToast({ text: '获取支付信息失败', type: 'error' })
        }
      } catch (error) {
        console.error(error)
        AtToast({ text: '网络异常', type: 'error' })
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentInfo()
  }, [])

  // 选择支付方式
  const handleSelectMethod = (methodId) => {
    setSelectedMethod(methodId)
  }

  // 发起支付
  const handlePay = async () => {
    try {
      setLoading(true)
      // 先选择支付方式
      await Taro.request({
        url: `/mobile/payments/${bookingId}/select-method`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${Taro.getStorageSync('token')}`
        },
        data: {
          payment_method: selectedMethod
        }
      })

      // 发起支付
      const res = await Taro.request({
        url: `/mobile/payments/${bookingId}/create`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${Taro.getStorageSync('token')}`
        },
        data: {
          payment_method: selectedMethod
        }
      })

      if (res.data.code === 0) {
        // 跳转到支付链接或唤起支付
        const { payUrl } = res.data.data
        Taro.navigateTo({
          url: payUrl
        })
      } else {
        AtToast({ text: '发起支付失败', type: 'error' })
      }
    } catch (error) {
      console.error(error)
      AtToast({ text: '网络异常', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='payment-page'>
      {/* 返回按钮 */}
      <View className='back-button' onClick={() => Taro.navigateBack()}>
        <Text className='back-icon'>←</Text>
        <Text className='back-text'>返回</Text>
      </View>
      {/* 顶部安全收银台 */}
      <View className='header-section'>
        <Text className='title'>安全收银台</Text>
        <Text className='countdown'>剩余时间: {paymentInfo.remainingTime}</Text>
        <Text className='amount'>¥{paymentInfo.totalAmount.toFixed(2)}</Text>
        <Text className='discount'>{paymentInfo.discount}</Text>
        <View className='order-info'>
          <Text className='order-title'>{paymentInfo.orderTitle}</Text>
          <AtIcon value='chevron-down' size='16' color='#999' />
        </View>
      </View>

      {/* 支付方式 */}
      <View className='payment-methods-section'>
        <Text className='section-title'>支付方式</Text>

        {paymentInfo.paymentMethods.map(method => {
          if (method.type === 'group') {
            return (
              <View key={method.id} className='payment-group'>
                <View className='group-header'>
                  <AtIcon value='credit-card' size='24' color='#007aff' />
                  <Text className='group-name'>{method.name}</Text>
                </View>
                {method.items.map(item => (
                  <View
                    key={item.id}
                    className={`payment-item ${item.checked ? 'checked' : ''}`}
                    onClick={() => handleSelectMethod(item.id)}
                  >
                    <View className='item-left'>
                      {item.id === 'new_card' && <AtIcon value='credit-card' size='20' color='#007aff' />}
                      {item.id === 'add_icbc' && <View className='icbc-icon'>工</View>}
                      <Text className='item-name'>{item.name}</Text>
                    </View>
                    <View className='item-right'>
                      {item.tag && <Text className='item-tag'>{item.tag}</Text>}
                      {item.checked && <AtIcon value='check-circle' size='20' color='#007aff' />}
                      {!item.checked && <AtIcon value='chevron-right' size='16' color='#ccc' />}
                    </View>
                  </View>
                ))}
              </View>
            )
          } else {
            return (
              <View
                key={method.id}
                className={`payment-item ${method.checked ? 'checked' : ''}`}
                onClick={() => handleSelectMethod(method.id)}
              >
                <View className='item-left'>
                  {method.icon && <Image className='item-icon' src={method.icon} />}
                  <Text className='item-name'>{method.name}</Text>
                </View>
                <View className='item-right'>
                  <Radio
                    checked={method.checked}
                    onClick={() => handleSelectMethod(method.id)}
                  />
                </View>
              </View>
            )
          }
        })}
      </View>

      {/* 金融服务 */}
      <View className='financial-section'>
        <Text className='section-title'>金融服务</Text>
        <View className='new-user-banner'>
          <AtIcon value='gift' size='16' color='#ff976a' />
          <Text>新人专享，拿去花更优惠</Text>
          <AtIcon value='info' size='16' color='#999' />
        </View>

        {paymentInfo.financialServices.map(service => (
          <View key={service.id} className='financial-item'>
            <View
              className={`item-header ${service.checked ? 'checked' : ''}`}
              onClick={() => handleSelectMethod(service.id)}
            >
              <View className='item-left'>
                <Image className='service-icon' src='https://img.icons8.com/color/96/coin.png' />
                <View className='service-info'>
                  <Text className='service-name'>{service.name}</Text>
                  {service.tag && <Text className='service-tag'>{service.tag}</Text>}
                </View>
              </View>
              <View className='item-right'>
                <Text className='service-discount'>{service.discount}</Text>
                <Radio
                  checked={service.checked}
                  onClick={() => handleSelectMethod(service.id)}
                />
              </View>
            </View>

            {service.checked && (
              <View className='installment-options'>
                {service.installments.map(installment => (
                  <View key={installment.id} className='installment-item'>
                    <Text className='installment-name'>{installment.name}</Text>
                    <Text className='installment-discount'>{installment.discount}</Text>
                    <Text className='installment-desc'>{installment.desc}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>

      {/* 底部支付按钮 */}
      <View className='bottom-bar'>
        <Button
          className='pay-btn'
          onClick={handlePay}
          loading={loading}
          disabled={loading}
        >
          使用银行卡支付¥{paymentInfo.totalAmount.toFixed(2)}
        </Button>
      </View>
    </View>
  )
}

export default PaymentPage