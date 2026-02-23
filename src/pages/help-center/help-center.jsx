import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { helpApi } from '../../services/api'
import './help-center.less'

export default function HelpCenterPage () {
  // 状态管理
  const [faqItems, setFaqItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 处理返回按钮点击
  const handleBackPress = () => {
    Taro.navigateBack()
  }

  // 从后端获取帮助中心数据
  useEffect(() => {
    const fetchHelpCenterData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await helpApi.getHelpCenter()
        if (response.code === 0 && response.data && response.data.faqItems) {
          setFaqItems(response.data.faqItems)
        } else {
          setError('获取帮助中心数据失败')
        }
      } catch (err) {
        console.error('获取帮助中心数据错误:', err)
        setError('网络连接失败，请稍后重试')
      } finally {
        setLoading(false)
      }
    }

    fetchHelpCenterData()
  }, [])

  return (
    <View style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* 返回按钮 */}
      <View style={{ marginBottom: '20px' }}>
        <View 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            padding: '8px 12px',
            backgroundColor: '#fff',
            borderRadius: '4px',
            width: '80px'
          }} 
          onClick={handleBackPress}
        >
          <Text style={{ marginRight: '5px' }}>←</Text>
          <Text>返回</Text>
        </View>
      </View>

      {/* 加载状态 */}
      {loading && (
        <View style={{ padding: '40px', backgroundColor: '#fff', textAlign: 'center' }}>
          <Text>加载中...</Text>
        </View>
      )}

      {/* 错误状态 */}
      {error && (
        <View style={{ padding: '40px', backgroundColor: '#fff', textAlign: 'center' }}>
          <Text style={{ color: '#ff4d4f' }}>{error}</Text>
          <View 
            style={{ 
              marginTop: '20px', 
              padding: '8px 16px', 
              backgroundColor: '#1890ff', 
              color: '#fff', 
              borderRadius: '4px', 
              display: 'inline-block',
              cursor: 'pointer'
            }} 
            onClick={() => window.location.reload()}
          >
            <Text>重新加载</Text>
          </View>
        </View>
      )}

      {/* 帮助中心内容 */}
      {!loading && !error && (
        <ScrollView>
          {/* 帮助中心标题 */}
          <View style={{ padding: '20px', backgroundColor: '#fff', marginBottom: '10px' }}>
            <Text style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>常见问题</Text>
            <Text style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>以下是我们收集的常见问题，希望能帮助您快速解决疑问</Text>
          </View>

          {/* 常见问题列表 */}
          {faqItems.map((item) => (
            <View key={item.id} style={{ backgroundColor: '#fff', padding: '20px', marginBottom: '10px' }}>
              <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '15px' }}>{item.category}</Text>
              {item.questions.map((question, index) => (
                <View key={index} style={{ marginBottom: '15px' }}>
                  <Text style={{ fontSize: '15px', color: '#333', marginBottom: '10px', display: 'block' }}>{question.q}</Text>
                  <Text style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>{question.a}</Text>
                </View>
              ))}
            </View>
          ))}

          {/* 联系客服入口 */}
          <View style={{ backgroundColor: '#fff', padding: '20px', marginBottom: '30px', textAlign: 'center' }}>
            <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>仍有疑问？</Text>
            <Text style={{ fontSize: '14px', color: '#666', marginBottom: '20px', lineHeight: '1.4' }}>如果以上问题无法解决您的疑问，您可以联系我们的客服人员</Text>
            <View 
              style={{ backgroundColor: '#1890ff', color: '#fff', padding: '12px 0', borderRadius: '6px', cursor: 'pointer' }}
              onClick={() => Taro.navigateTo({ url: '/pages/customer-service/customer-service' })}
            >
              <Text style={{ fontSize: '15px', fontWeight: '500' }}>在线客服</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  )
}