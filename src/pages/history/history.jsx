import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useCallback, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { historyApi } from '../../services/api'
import './history.less'

export default function HistoryPage () {
  // 状态管理
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  // 初始化时获取浏览历史
  useEffect(() => {
    fetchHistory()
  }, [])

  // 获取浏览历史
  const fetchHistory = async () => {
    try {
      setLoading(true)
      
      // 调用后端API获取浏览历史
      const response = await historyApi.getHistory()
      
      if (response.code === 0 && response.data) {
        setHistory(response.data.history || [])
      } else {
        Taro.showToast({
          title: response.message || '获取浏览历史失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('获取浏览历史失败:', error)
      Taro.showToast({
        title: error.message || '获取浏览历史失败，请检查网络连接',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  // 处理酒店点击，跳转到酒店详情页面
  const handleHotelClick = useCallback((hotelId) => {
    Taro.navigateTo({
      url: `/pages/hotel-detail/index?hotelId=${hotelId}`
    })
  }, [])

  // 处理删除单个历史记录
  const handleDeleteHistory = useCallback((historyId) => {
    Taro.showModal({
      title: '删除历史记录',
      content: '确定要删除这条历史记录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 调用后端API删除历史记录
            const response = await historyApi.removeHistory(historyId)
            
            if (response.code === 0) {
              // 更新本地历史记录
              setHistory(prev => prev.filter(item => item.id !== historyId))
              Taro.showToast({
                title: '已删除',
                icon: 'success'
              })
            } else {
              Taro.showToast({
                title: response.message || '删除失败',
                icon: 'none'
              })
            }
          } catch (error) {
            console.error('删除历史记录失败:', error)
            Taro.showToast({
              title: error.message || '删除失败，请检查网络连接',
              icon: 'none'
            })
          }
        }
      }
    })
  }, [])

  // 处理清空所有历史记录
  const handleClearAllHistory = useCallback(() => {
    if (history.length === 0) {
      Taro.showToast({
        title: '暂无历史记录',
        icon: 'none'
      })
      return
    }

    Taro.showModal({
      title: '清空历史记录',
      content: '确定要清空所有历史记录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 调用后端API清空历史记录
            const response = await historyApi.clearHistory()
            
            if (response.code === 0) {
              setHistory([])
              Taro.showToast({
                title: '已清空',
                icon: 'success'
              })
            } else {
              Taro.showToast({
                title: response.message || '清空失败',
                icon: 'none'
              })
            }
          } catch (error) {
            console.error('清空历史记录失败:', error)
            Taro.showToast({
              title: error.message || '清空失败，请检查网络连接',
              icon: 'none'
            })
          }
        }
      }
    })
  }, [history.length])

  return (
    <View className='history-page'>
      {/* 返回按钮 */}
      <View className='back-button' onClick={() => Taro.navigateTo({ url: '/pages/my/my' })}>
        <Text className='back-icon'>←</Text>
        <Text className='back-text'>返回</Text>
      </View>
      
      {/* 页面标题和操作 */}
      <View className='page-header'>
        <Text className='page-title'>浏览历史</Text>
        <View 
          className='clear-all-btn'
          onClick={handleClearAllHistory}
        >
          <Text className='clear-all-text'>清空</Text>
        </View>
      </View>
      
      {/* 历史记录列表 */}
      <ScrollView className='history-list'>
        {loading ? (
          <View className='loading-container'>
            <Text className='loading-text'>加载中...</Text>
          </View>
        ) : history.length > 0 ? (
          history.map(item => {
            const hotel = item.hotel || item
            return (
              <View key={item.id} className='history-item'>
                <Image 
                  className='item-image' 
                  src={hotel.image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20exterior%20default%20placeholder&image_size=square'} 
                />
                <View className='item-info'>
                  <View className='item-header'>
                    <Text className='item-title'>{hotel.name || hotel.title}</Text>
                    <View 
                      className='delete-btn' 
                      onClick={() => handleDeleteHistory(item.id)}
                    >
                      <Text className='delete-icon'>×</Text>
                    </View>
                  </View>
                  <Text className='item-address'>{hotel.address}</Text>
                  <View className='item-footer'>
                    <View className='item-price'>
                      <Text className='price-symbol'>¥</Text>
                      <Text className='price-value'>{hotel.price}</Text>
                      <Text className='price-unit'>/晚</Text>
                    </View>
                    <Text className='item-time'>{item.viewed_at || item.time}</Text>
                  </View>
                </View>
              </View>
            )
          })
        ) : (
          <View className='empty-state'>
            <Text className='empty-icon'>🕐</Text>
            <Text className='empty-text'>暂无浏览历史</Text>
            <Text className='empty-hint'>浏览酒店后会自动记录到这里</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}