import { View, Text, Image, ScrollView, Button, Switch } from '@tarojs/components'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, showToast, navigateTo, redirectTo, showModal, startPullDownRefresh, stopPullDownRefresh } from '@tarojs/taro'
import { hotelApi } from '../../services/api'
import DateSelector from '../../components/DateSelector'
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
  const [showDateSelector, setShowDateSelector] = useState(false)
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
  const scrollViewRef = useRef(null)

  // 初始化页面
  useEffect(() => {
    initPage()
  }, [router.query])

  // 当showFilter为true时，同步tempFilters为当前filters的值
  useEffect(() => {
    if (showFilter) {
      setTempFilters({ ...filters })
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
      
      if (searchResult.code === 0 && searchResult.data) {
        const newHotels = searchResult.data.hotels || []
        
        if (params.page === 1) {
          setHotels(newHotels)
        } else {
          setHotels(prev => [...prev, ...newHotels])
        }
        
        setTotalCount(searchResult.data.total || 0)
        // 修正hasMore判断逻辑：是否还有更多数据 = 当前加载的数量 < 总数量
        setHasMore((params.page * (params.pageSize || 10)) < searchResult.data.total)
        setPage(params.page)
      } else {
        showToast({
          title: searchResult.message || '搜索失败，请稍后重试',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('搜索酒店失败', error)
      showToast({
        title: error.message || '搜索失败，请稍后重试',
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
      // 检查是否从首页传递了查询参数
      const paramsFromHome = router.query && router.query.params
      let searchParamsData = {}
      
      if (paramsFromHome) {
        try {
          // 解析从首页传递的参数
          searchParamsData = JSON.parse(decodeURIComponent(paramsFromHome))
          console.log('从首页获取的查询参数:', searchParamsData)
        } catch (error) {
          console.error('解析参数失败:', error)
          searchParamsData = {}
        }
      }
      
      // 检查是否从城市选择页面返回
      const cityFromParams = router.query && router.query.city
      console.log('从路由参数获取的城市:', cityFromParams)
      
      // 使用传递的参数或默认参数初始化
      const defaultParams = {
        city: cityFromParams || searchParamsData.city || '北京',
        keyword: searchParamsData.keyword || '',
        checkInDate: searchParamsData.checkInDate || new Date().toISOString().split('T')[0],
        checkOutDate: searchParamsData.checkOutDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
        nights: searchParamsData.nights || 1,
        selectedTags: searchParamsData.selectedTags || [],
        selectedFilterValue: searchParamsData.selectedFilterValue || '',
        selectedFacilities: searchParamsData.selectedFacilities || [],
        currentFilterType: searchParamsData.currentFilterType || '',
        pageSize: 10
      }
      
      console.log('使用参数初始化:', defaultParams)
      
      setSearchParams(defaultParams)
      
      // 重置分页
      setPage(1)
      setHotels([])
      setHasMore(true)
      
      // 处理从首页传递的筛选条件
      if (searchParamsData.selectedFacilities && searchParamsData.selectedFacilities.length > 0) {
        setFilters(prev => ({
          ...prev,
          amenities: searchParamsData.selectedFacilities
        }))
      }
      
      // 搜索酒店
      console.log('开始搜索酒店...')
      await searchHotels({ ...defaultParams, page: 1 })
      
    } catch (error) {
      console.error('初始化页面失败', error)
      showToast({
        title: '加载失败，请稍后重试',
        icon: 'none'
      })
    }
  }, [searchHotels, router.query])

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    // 手动触发下拉刷新动画（兼容部分端）
    startPullDownRefresh()
    setPage(1)
    setHotels([])
    setHasMore(true)
    await searchHotels({ ...searchParams, page: 1 })
  }, [searchParams, searchHotels])

  // 加载更多
  const handleLoadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return
    
    setLoadingMore(true)
    await searchHotels({ ...searchParams, page: page + 1 })
  }, [hasMore, loadingMore, loading, page, searchParams, searchHotels])

  // 查看酒店详情 - 修复：修改跳转路径为正确的详情页路径
  const handleHotelClick = useCallback((hotelId) => {
    navigateTo({
      url: `/pages/hotel-detail/index?id=${hotelId}&returnUrl=/pages/hotel-list/hotel-list`
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
    const resetFilters = {
      priceRange: [0, 5000],
      starLevels: [],
      amenities: [],
      minRating: 0
    }
    setFilters(resetFilters)
    setTempFilters(resetFilters)
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
    // 使用redirectTo替换当前页面，避免在导航栈中添加新页面
    redirectTo({
      url: `/pages/city-select/city-select?returnUrl=/pages/hotel-list/hotel-list`
    })
  }, [])

  // 处理日期选择
  const handleDateSelect = useCallback(() => {
    setShowDateSelector(true)
  }, [])

  // 处理日期选择确认
  const handleDateConfirm = useCallback((checkInDate, checkOutDate, nights) => {
    const newParams = {
      ...searchParams,
      checkInDate,
      checkOutDate,
      nights
    }
    
    setSearchParams(newParams)
    setShowDateSelector(false)
    setPage(1)
    setHotels([])
    setHasMore(true)
    searchHotels({ ...newParams, page: 1 })
  }, [searchParams, searchHotels])

  // 处理日期选择取消
  const handleDateCancel = useCallback(() => {
    setShowDateSelector(false)
  }, [])

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
    setFilters({ ...tempFilters })
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
          <Text className='filter-reset' onClick={handleResetFilter}>重置</Text>
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
                  const targetLevel = index + 2
                  if (newStarLevels.includes(targetLevel)) {
                    newStarLevels.splice(newStarLevels.indexOf(targetLevel), 1)
                  } else {
                    newStarLevels.push(targetLevel)
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
  }, [tempFilters, handleFilterConfirm, handleFilterCancel, handleResetFilter])

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
        <View className='filter-header-top'>
          {/* 返回按钮 */}
          <View className='back-button' onClick={() => Taro.navigateBack()}>
            <Text style={{ fontSize: '20px' }}>←</Text>
            <Text>返回</Text>
          </View>
          <Text className='page-title'>酒店列表</Text>
          <View style={{ width: 60 }} />
        </View>
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
          <View style={{ position: 'relative' }}>
            <View className='action-button' onClick={() => setShowSort(!showSort)}>
              <Text style={{ fontSize: '20px' }}>🔽</Text>
              <Text>排序</Text>
            </View>
            
            {/* 排序选项 */}
            {showSort && renderSortOptions()}
          </View>
        </View>
      </View>

      {/* 详细筛选区域 */}
      {showFilter && renderFilterSection()}

      {/* 已选筛选标签 */}
      <View className='selected-filters'>
        {filters.starLevels.length > 0 && (
          <View className='filter-tag'>
            <Text className='tag-label'>星级</Text>
            <Text className='tag-value'>{filters.starLevels.join('、')}星</Text>
          </View>
        )}
        {(filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) && (
          <View className='filter-tag'>
            <Text className='tag-label'>价格</Text>
            <Text className='tag-value'>{filters.priceRange[0]}-{filters.priceRange[1]}元</Text>
          </View>
        )}
        {filters.amenities.length > 0 && (
          <View className='filter-tag'>
            <Text className='tag-label'>设施</Text>
            <Text className='tag-value'>{filters.amenities.length}项</Text>
          </View>
        )}
        {filters.minRating > 0 && (
          <View className='filter-tag'>
            <Text className='tag-label'>评分</Text>
            <Text className='tag-value'>≥{filters.minRating}分</Text>
          </View>
        )}
      </View>

      {/* 日期选择器 */}
      <DateSelector
        visible={showDateSelector}
        onCancel={handleDateCancel}
        onConfirm={handleDateConfirm}
        initialCheckIn={searchParams.checkInDate}
        initialCheckOut={searchParams.checkOutDate}
      />

      {/* 酒店列表 */}
      <ScrollView 
        className='hotel-container' 
        scrollY
        ref={scrollViewRef}
        enablePullDownRefresh={true}
        onPullDownRefresh={handleRefresh}
        onReachBottom={handleLoadMore}
        onReachBottomDistance={50}
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