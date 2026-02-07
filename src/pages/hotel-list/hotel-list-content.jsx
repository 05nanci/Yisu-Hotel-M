import { View, Text, Image, ScrollView, Button } from '@tarojs/components'
import { useState, useEffect, useCallback } from 'react'
import { showToast } from '@tarojs/taro'
import { hotelApi } from '../../services/api'

// 酒店列表内容组件
export default function HotelListContent ({ searchParams }) {
  const [loading, setLoading] = useState(false)
  const [hotels, setHotels] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [sortType, setSortType] = useState('default') // default, price_asc, price_desc, distance
  const [filters, setFilters] = useState({
    priceRange: [0, 5000],
    starLevels: [],
    amenities: [],
    minRating: 0
  })
  const [collectedHotels, setCollectedHotels] = useState(new Set())

  // 初始化页面
  useEffect(() => {
    if (searchParams) {
      initPage()
    }
  }, [searchParams, initPage])

  // 初始化页面数据
  const initPage = useCallback(async () => {
    try {
      setLoading(true)
      
      // 重置分页
      setPage(1)
      setHotels([])
      setHasMore(true)
      
      // 搜索酒店
      await searchHotels({ ...searchParams, page: 1 })
    } catch (error) {
      console.log('初始化页面失败', error)
      showToast({
        title: '加载失败，请稍后重试',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }, [searchParams, searchHotels])

  // 搜索酒店
  const searchHotels = useCallback(async (params) => {
    try {
      setLoading(true)
      
      // 调用后端API搜索酒店
      const searchResult = await hotelApi.searchHotels({
        ...params,
        sort: sortType,
        ...filters
      })
      
      if (searchResult.success && searchResult.data) {
        const newHotels = searchResult.data.hotels || []
        
        if (params.page === 1) {
          setHotels(newHotels)
        } else {
          setHotels(prev => [...prev, ...newHotels])
        }
        
        setTotalCount(searchResult.data.total || 0)
        setHasMore(newHotels.length >= (params.pageSize || 10))
        setPage(params.page)
      } else {
        showToast({
          title: '搜索失败，请稍后重试',
          icon: 'none'
        })
      }
    } catch (error) {
      console.log('搜索酒店失败', error)
      showToast({
        title: '搜索失败，请稍后重试',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }, [sortType, filters])

  // 切换收藏状态
  const toggleCollection = useCallback((hotelId) => {
    setCollectedHotels(prev => {
      const newSet = new Set(prev)
      if (newSet.has(hotelId)) {
        newSet.delete(hotelId)
      } else {
        newSet.add(hotelId)
      }
      return newSet
    })
  }, [])

  // 渲染酒店项
  const renderHotelItem = useCallback((hotel) => {
    return (
      <View key={hotel.id} className='hotel-item'>
        <Image className='hotel-image' src={hotel.imageUrl || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hotel%20exterior%20building%20architecture&image_size=square'} />
        <View className='hotel-info'>
          <View className='hotel-header'>
            <Text className='hotel-name'>{hotel.name}</Text>
            <Button 
              className={`collect-btn ${collectedHotels.has(hotel.id) ? 'collected' : ''}`}
              onClick={() => toggleCollection(hotel.id)}
            >
              {collectedHotels.has(hotel.id) ? '已收藏' : '收藏'}
            </Button>
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
  }, [collectedHotels, toggleCollection])

  return (
    <View className='hotel-list-content'>
      {/* 搜索结果统计 */}
      <View className='search-result'>
        <Text>共找到 {totalCount} 家酒店</Text>
      </View>
      
      {/* 酒店列表 */}
      {loading ? (
        <View className='loading-container'>
          <Text>加载中...</Text>
        </View>
      ) : hotels.length > 0 ? (
        <ScrollView className='hotel-list'>
          {hotels.map(renderHotelItem)}
        </ScrollView>
      ) : (
        <View className='empty-container'>
          <Text>暂无符合条件的酒店</Text>
        </View>
      )}
    </View>
  )
}
