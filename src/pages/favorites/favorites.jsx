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
      // 检查用户是否已登录
      const token = Taro.getStorageSync('token')
      if (!token) {
        // 用户未登录，跳转到登录页
        Taro.showToast({
          title: '请先登录',
          icon: 'none'
        })
        Taro.navigateTo({
          url: '/pages/login/login'
        })
        return
      }
      
      setLoading(true)
      
      // 调用后端API获取收藏列表
      const response = await favoriteApi.getFavorites()
      
      console.log('收藏列表API响应:', response)
      
      if (response.code === 0 && response.data) {
        // 处理不同的数据结构
        const favoritesData = response.data.favorites || response.data.list || response.data || []
        console.log('处理后的收藏数据:', favoritesData)
        setFavorites(favoritesData)
      } else if (response.code === 4008) {
        // Token 无效或已过期，已经在API服务层处理了跳转到登录页的逻辑
        // 这里不需要重复处理
      } else {
        Taro.showToast({
          title: response.msg || response.message || '获取收藏列表失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('获取收藏列表失败:', error)
      // 检查是否是认证错误
      if (error.message.includes('401') || error.message.includes('Token')) {
        // 登录已过期，清除本地token并跳转到登录页
        Taro.removeStorageSync('token')
        Taro.removeStorageSync('isLoggedIn')
        Taro.showToast({
          title: '登录已过期，请重新登录',
          icon: 'none'
        })
        Taro.navigateTo({
          url: '/pages/login/login'
        })
      } else {
        Taro.showToast({
          title: error.message || '获取收藏列表失败，请检查网络连接',
          icon: 'none'
        })
      }
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
    // 检查用户是否已登录
    const token = Taro.getStorageSync('token')
    if (!token) {
      // 用户未登录，跳转到登录页
      Taro.showToast({
        title: '请先登录',
        icon: 'none'
      })
      Taro.navigateTo({
        url: '/pages/login/login'
      })
      return
    }
    
    Taro.showModal({
      title: '取消收藏',
      content: '确定要取消收藏这个酒店吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 调用后端API取消收藏
            const response = await favoriteApi.removeFavorite(hotelId)
            
            if (response.code === 0) {
              // 更新本地收藏列表，处理不同的数据结构
              setFavorites(prev => prev.filter(item => {
                // 处理不同的数据结构
                const currentHotelId = item.hotel?.id || item.id || item.hotel_id
                return currentHotelId !== hotelId
              }))
              Taro.showToast({
                title: '已取消收藏',
                icon: 'success'
              })
            } else if (response.code === 4008) {
              // Token 无效或已过期，已经在API服务层处理了跳转到登录页的逻辑
              // 这里不需要重复处理
            } else {
              Taro.showToast({
                title: response.msg || response.message || '取消收藏失败',
                icon: 'none'
              })
            }
          } catch (error) {
            console.error('取消收藏失败:', error)
            // 检查是否是认证错误
            if (error.message.includes('401') || error.message.includes('Token')) {
              // 登录已过期，清除本地token并跳转到登录页
              Taro.removeStorageSync('token')
              Taro.removeStorageSync('isLoggedIn')
              Taro.showToast({
                title: '登录已过期，请重新登录',
                icon: 'none'
              })
              Taro.navigateTo({
                url: '/pages/login/login'
              })
            } else {
              Taro.showToast({
                title: error.message || '取消收藏失败，请检查网络连接',
                icon: 'none'
              })
            }
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
            console.log('渲染的收藏项:', item)
            return (
              <View key={item.hotel_id || item.id} className='favorite-item'>
                <Image 
                  className='hotel-image' 
                  src={((item.main_image_url && !item.main_image_url.includes('example.com')) ? item.main_image_url : ((item.hotel_image && !item.hotel_image.includes('example.com')) ? item.hotel_image : ((item.image && !item.image.includes('example.com')) ? item.image : 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20exterior%20default%20placeholder&image_size=square')))} 
                />
                <View className='hotel-info'>
                  <View className='hotel-header'>
                    <Text className='hotel-name'>{item.hotel_name || item.name || item.hotel_name_cn}</Text>
                    <View 
                      className='unfavorite-btn' 
                      onClick={() => handleUnfavorite(item.hotel_id || item.id)}
                    >
                      <Text className='unfavorite-icon'>★</Text>
                    </View>
                  </View>
                  <Text className='hotel-address'>{item.hotel_address || item.address || item.nearby_info || item.location}</Text>
                  <View className='hotel-footer'>
                    <View className='hotel-price'>
                      <Text className='price-symbol'>¥</Text>
                      <Text className='price-value'>{item.price || item.min_price || item.rate || 0}</Text>
                      <Text className='price-unit'>/晚</Text>
                    </View>
                    <View className='hotel-rating'>
                      <Text className='rating-value'>{item.rating || item.score || 0}</Text>
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
