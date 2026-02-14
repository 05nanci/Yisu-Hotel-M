import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useCallback, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { favoriteApi } from '../../services/api'
import './favorites.less'

export default function FavoritesPage () {
  // 状态管理
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)

  // 初始化时获取收藏列表
  useEffect(() => {
    fetchFavorites()
  }, [])

  // 获取收藏列表
  const fetchFavorites = async () => {
    try {
      setLoading(true)
      
      // 调用后端API获取收藏列表
      const response = await favoriteApi.getFavorites()
      
      if (response.code === 0 && response.data) {
        setFavorites(response.data.favorites || [])
      } else {
        Taro.showToast({
          title: response.message || '获取收藏列表失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('获取收藏列表失败:', error)
      Taro.showToast({
        title: error.message || '获取收藏列表失败，请检查网络连接',
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

  // 处理取消收藏
  const handleUnfavorite = useCallback((hotelId) => {
    Taro.showModal({
      title: '取消收藏',
      content: '确定要取消收藏这个酒店吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 调用后端API取消收藏
            const response = await favoriteApi.removeFavorite(hotelId)
            
            if (response.code === 0) {
              // 更新本地收藏列表
              setFavorites(prev => prev.filter(item => item.hotel.id !== hotelId))
              Taro.showToast({
                title: '已取消收藏',
                icon: 'success'
              })
            } else {
              Taro.showToast({
                title: response.message || '取消收藏失败',
                icon: 'none'
              })
            }
          } catch (error) {
            console.error('取消收藏失败:', error)
            Taro.showToast({
              title: error.message || '取消收藏失败，请检查网络连接',
              icon: 'none'
            })
          }
        }
      }
    })
  }, [])

  return (
    <View className='favorites-page'>
      {/* 返回按钮 */}
      <View className='back-button' onClick={() => Taro.navigateBack()}>
        <Text className='back-icon'>←</Text>
        <Text className='back-text'>返回</Text>
      </View>
      
      {/* 页面标题 */}
      <View className='page-header'>
        <Text className='page-title'>我的收藏</Text>
      </View>
      
      {/* 收藏列表 */}
      <ScrollView className='favorites-list'>
        {loading ? (
          <View className='loading-container'>
            <Text className='loading-text'>加载中...</Text>
          </View>
        ) : favorites.length > 0 ? (
          favorites.map(item => {
            const hotel = item.hotel
            return (
              <View key={hotel.id} className='favorite-item'>
                <Image 
                  className='hotel-image' 
                  src={hotel.image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20exterior%20default%20placeholder&image_size=square'} 
                />
                <View className='hotel-info'>
                  <View className='hotel-header'>
                    <Text className='hotel-name'>{hotel.name}</Text>
                    <View 
                      className='unfavorite-btn' 
                      onClick={() => handleUnfavorite(hotel.id)}
                    >
                      <Text className='unfavorite-icon'>★</Text>
                    </View>
                  </View>
                  <Text className='hotel-address'>{hotel.address}</Text>
                  <View className='hotel-footer'>
                    <View className='hotel-price'>
                      <Text className='price-symbol'>¥</Text>
                      <Text className='price-value'>{hotel.price}</Text>
                      <Text className='price-unit'>/晚</Text>
                    </View>
                    <View className='hotel-rating'>
                      <Text className='rating-value'>{hotel.rating}</Text>
                      <Text className='rating-label'>分</Text>
                    </View>
                  </View>
                </View>
              </View>
            )
          })
        ) : (
          <View className='empty-state'>
            <Text className='empty-icon'>⭐</Text>
            <Text className='empty-text'>暂无收藏的酒店</Text>
            <Text className='empty-hint'>浏览酒店时点击五角星图标进行收藏</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
