import { View, Text, Image, ScrollView, Button, Swiper, Switch } from '@tarojs/components'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, showToast, navigateTo, showModal, startPullDownRefresh, stopPullDownRefresh } from '@tarojs/taro'
import { hotelApi } from '../../services/api'
import './hotel-list.less'

export default function HotelList () {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hotels, setHotels] = useState([])
  const [searchParams, setSearchParams] = useState({})
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showFilter, setShowFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [sortType, setSortType] = useState('default') // default, price_asc, price_desc, distance
  const [filters, setFilters] = useState({
    priceRange: [0, 5000],
    starLevels: [],
    amenities: [],
    minRating: 0
  })
  const [tempFilters, setTempFilters] = useState({
    priceRange: [0, 5000],
    starLevels: [],
    amenities: [],
    minRating: 0
  })
  const [collectedHotels, setCollectedHotels] = useState(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const scrollViewRef = useRef(null)

  // 初始化页面
  useEffect(() => {
    initPage()
  }, [])

  // 当showFilter为true时，同步tempFilters为当前filters的值
  useEffect(() => {
    if (showFilter) {
      setTempFilters(filters)
    }
  }, [showFilter, filters])

  // 搜索酒店
  const searchHotels = useCallback(async (params) => {
    try {
      setLoading(true)
      
      // 调用后端API搜索酒店，优先使用传入的sort参数
      const searchResult = await hotelApi.searchHotels({
        ...params,
        sort: params.sort || sortType,
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
      setLoadingMore(false)
      setRefreshing(false)
      if (refreshing) {
        stopPullDownRefresh()
      }
    }
  }, [sortType, filters, refreshing])

  // 初始化页面数据
  const initPage = useCallback(async () => {
    try {
      // 无论是否有参数，都使用默认参数初始化
      const defaultParams = {
        city: '北京',
        keyword: '',
        checkInDate: new Date().toISOString().split('T')[0],
        checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        nights: 1
      }
      
      console.log('使用默认参数初始化:', defaultParams)
      
      setSearchParams(defaultParams)
      
      // 重置分页
      setPage(1)
      setHotels([])
      setHasMore(true)
      
      // 搜索酒店
      console.log('开始搜索酒店...')
      await searchHotels({ ...defaultParams, page: 1 })
      
    } catch (error) {
      console.log('初始化页面失败', error)
      showToast({
        title: '加载失败，请稍后重试',
        icon: 'none'
      })
    }
  }, [searchHotels])

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    setPage(1)
    setHotels([])
    setHasMore(true)
    await searchHotels({ ...searchParams, page: 1 })
  }, [searchParams, searchHotels])

  // 加载更多
  const handleLoadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return
    
    setLoadingMore(true)
    await searchHotels({ ...searchParams, page: page + 1 })
  }, [hasMore, loadingMore, page, searchParams, searchHotels])

  // 查看酒店详情
  const handleHotelClick = useCallback((hotelId) => {
    navigateTo({
      url: `/pages/hotel-detail/hotel-detail?id=${hotelId}&returnUrl=/pages/hotel-list/hotel-list`
    })
  }, [])

  // 切换收藏状态
  const handleCollect = useCallback((hotelId, e) => {
    e.stopPropagation()
    
    setCollectedHotels(prev => {
      const newCollected = new Set(prev)
      if (newCollected.has(hotelId)) {
        newCollected.delete(hotelId)
        showToast({
          title: '取消收藏成功',
          icon: 'success'
        })
      } else {
        newCollected.add(hotelId)
        showToast({
          title: '收藏成功',
          icon: 'success'
        })
      }
      return newCollected
    })
  }, [])

  // 处理排序
  const handleSort = useCallback((type) => {
    setSortType(type)
    setShowSort(false)
    setPage(1)
    setHotels([])
    setHasMore(true)
    // 直接传递type参数给searchHotels函数，确保使用最新的排序类型
    searchHotels({ ...searchParams, page: 1, sort: type })
  }, [searchParams, searchHotels])

  // 处理筛选
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters)
    setPage(1)
    setHotels([])
    setHasMore(true)
    searchHotels({ ...searchParams, page: 1 })
  }, [searchParams, searchHotels])

  // 重置筛选
  const handleResetFilter = useCallback(() => {
    setFilters({
      priceRange: [0, 5000],
      starLevels: [],
      amenities: [],
      minRating: 0
    })
    setPage(1)
    setHotels([])
    setHasMore(true)
    searchHotels({ ...searchParams, page: 1 })
  }, [searchParams, searchHotels])

  // 处理长按
  const handleLongPress = useCallback((hotelId, e) => {
    e.stopPropagation()
    
    showModal({
      title: '操作',
      content: '选择操作',
      confirmText: '不感兴趣',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          setHotels(prev => prev.filter(hotel => hotel.id !== hotelId))
          showToast({
            title: '已隐藏该酒店',
            icon: 'success'
          })
        }
      }
    })
  }, [])

  // 处理城市选择
  const handleCitySelect = useCallback(() => {
    navigateTo({
      url: `/pages/city-select/city-select?returnUrl=/pages/hotel-list/hotel-list`
    })
  }, [])

  // 处理日期选择
  const handleDateSelect = useCallback(() => {
    // 这里可以跳转到日期选择页面，或者使用弹窗选择日期
    showModal({
      title: '日期选择',
      content: '选择入住和退房日期',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 模拟选择了新日期
          const newCheckInDate = new Date().toISOString().split('T')[0]
          const newCheckOutDate = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
          
          const newParams = {
            ...searchParams,
            checkInDate: newCheckInDate,
            checkOutDate: newCheckOutDate,
            nights: 2
          }
          
          setSearchParams(newParams)
          setPage(1)
          setHotels([])
          setHasMore(true)
          searchHotels({ ...newParams, page: 1 })
        }
      }
    })
  }, [searchParams, searchHotels])

  // 渲染酒店卡片
  const renderHotelCard = useCallback((hotel) => {
    const isCollected = collectedHotels.has(hotel.id)
    
    return (
      <View 
        key={hotel.id} 
        className='hotel-card' 
        onClick={() => handleHotelClick(hotel.id)}
        onLongPress={(e) => handleLongPress(hotel.id, e)}
      >
        <View className='hotel-image-container'>
          <Image 
            src={hotel.image} 
            className='hotel-image'
            mode="aspectFill"
            onError={(e) => {
              e.target.src = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20room%20interior%20default%20placeholder&image_size=landscape_4_3'
            }}
          />
          <View className='hotel-tags'>
            {hotel.available && <View className='tag available'>可订</View>}
            {hotel.freeCancellation && <View className='tag free-cancel'>免费取消</View>}
          </View>
          <View 
            className={`collect-button ${isCollected ? 'collected' : ''}`}
            onClick={(e) => handleCollect(hotel.id, e)}
          >
            <Text style={{ fontSize: '20px' }}>{isCollected ? '⭐' : '☆'}</Text>
          </View>
        </View>
        
        <View className='hotel-info'>
          <View className='hotel-header'>
            <Text className='hotel-name'>{hotel.name}</Text>
            <View className='hotel-rating'>
              <Text className='rating-value'>{hotel.rating}</Text>
              <Text className='rating-label'>分</Text>
            </View>
          </View>
          
          <View className='hotel-stats'>
            <Text className='hotel-collection'>收藏 {hotel.collectionCount || 0}</Text>
            <Text className='hotel-distance'>距离 {hotel.distance}</Text>
          </View>
          
          <Text className='hotel-address'>{hotel.address}</Text>
          
          <View className='hotel-amenities'>
            {hotel.amenities && hotel.amenities.slice(0, 3).map((amenity, index) => (
              <View key={index} className='amenity-tag'>
                <Text className='amenity-text'>{amenity}</Text>
              </View>
            ))}
          </View>
          
          <View className='hotel-bottom'>
            <View className='hotel-price'>
              <Text className='price-symbol'>¥</Text>
              <Text className='price-value'>{hotel.price}</Text>
              <Text className='price-unit'>/晚</Text>
            </View>
            <Button className='book-button'>预订</Button>
          </View>
        </View>
      </View>
    )
  }, [handleHotelClick, handleCollect, handleLongPress, collectedHotels])

  // 处理筛选确认
  const handleFilterConfirm = useCallback(() => {
    setFilters(tempFilters)
    setShowFilter(false)
    setPage(1)
    setHotels([])
    setHasMore(true)
    searchHotels({ ...searchParams, page: 1 })
  }, [tempFilters, searchParams, searchHotels])

  // 处理筛选取消
  const handleFilterCancel = useCallback(() => {
    setShowFilter(false)
  }, [])

  // 渲染筛选区域
  const renderFilterSection = useCallback(() => {
    return (
      <View className='filter-section'>
        <View className='filter-header'>
          <Text className='filter-title'>筛选条件</Text>
          <Text className='filter-reset' onClick={() => setTempFilters({ priceRange: [0, 5000], starLevels: [], amenities: [], minRating: 0 })}>重置</Text>
        </View>
        
        {/* 价格区间 */}
        <View className='filter-item'>
          <Text className='filter-item-title'>价格区间</Text>
          <View className='price-range'>
            <Text className='price-value'>{tempFilters.priceRange[0]}元</Text>
            <Text className='price-separator'>-</Text>
            <Text className='price-value'>{tempFilters.priceRange[1]}元</Text>
          </View>
          {/* 价格滑块 */}
          <View className='price-slider'>
            {/* 这里可以集成价格滑块组件 */}
          </View>
        </View>
        
        {/* 酒店星级 */}
        <View className='filter-item'>
          <Text className='filter-item-title'>酒店星级</Text>
          <View className='star-options'>
            {['二星及以下', '三星', '四星', '五星'].map((star, index) => (
              <View 
                key={index} 
                className={`star-option ${tempFilters.starLevels.includes(index + 2) ? 'selected' : ''}`}
                onClick={() => {
                  const newStarLevels = [...tempFilters.starLevels]
                  if (newStarLevels.includes(index + 2)) {
                    newStarLevels.splice(newStarLevels.indexOf(index + 2), 1)
                  } else {
                    newStarLevels.push(index + 2)
                  }
                  setTempFilters({ ...tempFilters, starLevels: newStarLevels })
                }}
              >
                <Text>{star}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* 设施服务 */}
        <View className='filter-item'>
          <Text className='filter-item-title'>设施服务</Text>
          <View className='amenity-options'>
            {['免费WiFi', '游泳池', '24小时前台', '停车场', '健身房', '餐厅'].map((amenity, index) => (
              <View 
                key={index} 
                className={`amenity-option ${tempFilters.amenities.includes(amenity) ? 'selected' : ''}`}
                onClick={() => {
                  const newAmenities = [...tempFilters.amenities]
                  if (newAmenities.includes(amenity)) {
                    newAmenities.splice(newAmenities.indexOf(amenity), 1)
                  } else {
                    newAmenities.push(amenity)
                  }
                  setTempFilters({ ...tempFilters, amenities: newAmenities })
                }}
              >
                <Text>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* 用户评分 */}
        <View className='filter-item'>
          <Text className='filter-item-title'>用户评分</Text>
          <View className='rating-options'>
            {[0, 3, 4, 4.5].map((rating) => (
              <View 
                key={rating} 
                className={`rating-option ${tempFilters.minRating === rating ? 'selected' : ''}`}
                onClick={() => setTempFilters({ ...tempFilters, minRating: rating })}
              >
                <Text>{rating === 0 ? '不限' : `≥${rating}分`}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* 确定和取消按钮 */}
        <View className='filter-buttons'>
          <View className='cancel-button' onClick={handleFilterCancel}>
            <Text>取消</Text>
          </View>
          <View className='confirm-button' onClick={handleFilterConfirm}>
            <Text>确定</Text>
          </View>
        </View>
      </View>
    )
  }, [tempFilters, handleFilterConfirm, handleFilterCancel])

  // 渲染排序选项
  const renderSortOptions = useCallback(() => {
    const sortOptions = [
      { key: 'default', label: '综合排序' },
      { key: 'price_asc', label: '价格升序' },
      { key: 'price_desc', label: '价格降序' },
      { key: 'distance', label: '距离由近及远' }
    ]
    
    return (
      <View className='sort-options'>
        {sortOptions.map((option) => (
          <View 
            key={option.key} 
            className={`sort-option ${sortType === option.key ? 'selected' : ''}`}
            onClick={() => handleSort(option.key)}
          >
            <Text>{option.label}</Text>
          </View>
        ))}
      </View>
    )
  }, [sortType, handleSort])

  return (
    <View className='hotel-list'>
      {/* 顶部核心筛选头 */}
      <View className='filter-header-fixed'>
        <View className='filter-info'>
          <View className='filter-item' onClick={handleCitySelect}>
            <Text className='filter-label'>城市</Text>
            <Text className='filter-value'>{searchParams.city || '未知'}</Text>
            <Text className="chevron-down">▼</Text>
          </View>
          
          <View className='filter-item' onClick={handleDateSelect}>
            <Text className='filter-label'>日期</Text>
            <Text className='filter-value'>
              {searchParams.checkInDate} - {searchParams.checkOutDate}
            </Text>
            <Text className="chevron-down">▼</Text>
          </View>
          
          <View className='filter-item'>
            <Text className='filter-label'>晚数</Text>
            <Text className='filter-value'>{searchParams.nights || 0}晚</Text>
          </View>
        </View>
        
        <View className='filter-actions'>
          <View className='action-button' onClick={() => setShowFilter(!showFilter)}>
            <Text style={{ fontSize: '20px' }}>⚙️</Text>
            <Text>筛选</Text>
          </View>
          <View className='action-button' onClick={() => setShowSort(!showSort)}>
            <Text style={{ fontSize: '20px' }}>🔽</Text>
            <Text>排序</Text>
          </View>
        </View>
      </View>

      {/* 详细筛选区域 */}
      {showFilter && renderFilterSection()}
      
      {/* 排序选项 */}
      {showSort && renderSortOptions()}

      {/* 酒店列表 */}
      <ScrollView 
        className='hotel-container' 
        scrollY
        ref={scrollViewRef}
        enablePullDownRefresh={true}
        onPullDownRefresh={handleRefresh}
        onReachBottom={handleLoadMore}
        refreshing={refreshing}
      >
        {loading && page === 1 ? (
          <View className='loading-container'>
            <Text className='loading-text'>加载中...</Text>
          </View>
        ) : hotels.length > 0 ? (
          <>
            {hotels.map(renderHotelCard)}
            {loadingMore && (
              <View className='loading-more'>
                <Text>加载中...</Text>
              </View>
            )}
            {!hasMore && hotels.length > 0 && (
              <View className='no-more'>
                <Text>已到底部</Text>
              </View>
            )}
          </>
        ) : (
          <View className='empty-container'>
            <Text className='empty-text'>暂无匹配酒店</Text>
            <Button className='reset-button' onClick={handleResetFilter}>
              重置筛选
            </Button>
            <Button className='back-button' onClick={() => navigateTo({ url: '/pages/index/index' })}>
              返回首页
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

