import React, { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, Image, Input, ScrollView, Picker, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { hotelApi } from '../../services/api'
import './hotel-list-new.less'

export default function HotelListNew() {
  const router = useRouter()
  
  // 核心筛选条件 (立即触发)
  const [city, setCity] = useState('Beijing')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [keyword, setKeyword] = useState('')
  
  // 更多筛选条件 (需确认)
  // 正式生效的筛选状态
  const [activeFilters, setActiveFilters] = useState({
    starRating: [],
    minPrice: '',
    maxPrice: '',
    rating: '',
    facilities: [],
    services: []
  })
  
  // 页面状态
  const [hotelList, setHotelList] = useState([])
  const [loading, setLoading] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // 新增状态：日历和城市选择器
  const [showCalendar, setShowCalendar] = useState(false)
  const [showCitySelector, setShowCitySelector] = useState(false)
  const [citySearchKeyword, setCitySearchKeyword] = useState('')
  const [filteredCities, setFilteredCities] = useState([])
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [calendarDays, setCalendarDays] = useState([])

  // 全国城市数据
  const citiesData = {
    hot: [
      { id: 1, name: '北京' },
      { id: 2, name: '上海' },
      { id: 3, name: '广州' },
      { id: 4, name: '深圳' },
      { id: 5, name: '杭州' },
      { id: 6, name: '成都' },
      { id: 7, name: '重庆' },
      { id: 8, name: '西安' }
    ],
    A: [
      { id: 9, name: '鞍山' },
      { id: 10, name: '安庆' },
      { id: 11, name: '安阳' },
      { id: 12, name: '安顺' }
    ],
    B: [
      { id: 13, name: '北京' },
      { id: 14, name: '上海' },
      { id: 15, name: '广州' },
      { id: 16, name: '深圳' },
      { id: 17, name: '杭州' },
      { id: 18, name: '成都' },
      { id: 19, name: '重庆' },
      { id: 20, name: '西安' },
      { id: 21, name: '南京' },
      { id: 22, name: '武汉' },
      { id: 23, name: '天津' },
      { id: 24, name: '苏州' },
      { id: 25, name: '厦门' },
      { id: 26, name: '青岛' },
      { id: 27, name: '大连' },
      { id: 28, name: '宁波' },
      { id: 29, name: '济南' },
      { id: 30, name: '哈尔滨' }
    ],
    C: [
      { id: 31, name: '长沙' },
      { id: 32, name: '长春' },
      { id: 33, name: '常州' },
      { id: 34, name: '巢湖' },
      { id: 35, name: '郴州' },
      { id: 36, name: '常德' },
      { id: 37, name: '潮州' }
    ],
    D: [
      { id: 38, name: '大连' },
      { id: 39, name: '东莞' },
      { id: 40, name: '德州' },
      { id: 41, name: '德阳' },
      { id: 42, name: '丹东' }
    ],
    E: [
      { id: 43, name: '鄂尔多斯' },
      { id: 44, name: '鄂州' }
    ],
    F: [
      { id: 45, name: '福州' },
      { id: 46, name: '佛山' },
      { id: 47, name: '抚顺' },
      { id: 48, name: '阜新' }
    ],
    G: [
      { id: 49, name: '广州' },
      { id: 50, name: '贵阳' },
      { id: 51, name: '桂林' },
      { id: 52, name: '赣州' }
    ],
    H: [
      { id: 53, name: '杭州' },
      { id: 54, name: '哈尔滨' },
      { id: 55, name: '海口' },
      { id: 56, name: '合肥' },
      { id: 57, name: '呼和浩特' },
      { id: 58, name: '惠州' },
      { id: 59, name: '湖州' },
      { id: 60, name: '淮安' },
      { id: 61, name: '菏泽' }
    ],
    J: [
      { id: 62, name: '济南' },
      { id: 63, name: '南京' },
      { id: 64, name: '南昌' },
      { id: 65, name: '吉林' },
      { id: 66, name: '济宁' },
      { id: 67, name: '嘉兴' },
      { id: 68, name: '江门' }
    ],
    K: [
      { id: 69, name: '昆明' },
      { id: 70, name: '开封' }
    ],
    L: [
      { id: 71, name: '兰州' },
      { id: 72, name: '洛阳' },
      { id: 73, name: '泸州' },
      { id: 74, name: '柳州' },
      { id: 75, name: '廊坊' }
    ],
    M: [
      { id: 76, name: '绵阳' },
      { id: 77, name: '茂名' },
      { id: 78, name: '马鞍山' },
      { id: 79, name: '梅州' }
    ],
    N: [
      { id: 80, name: '南京' },
      { id: 81, name: '南昌' },
      { id: 82, name: '南宁' },
      { id: 83, name: '宁波' },
      { id: 84, name: '南充' },
      { id: 85, name: '南阳' }
    ],
    P: [
      { id: 86, name: '莆田' },
      { id: 87, name: '萍乡' }
    ],
    Q: [
      { id: 88, name: '青岛' },
      { id: 89, name: '泉州' },
      { id: 90, name: '曲靖' },
      { id: 91, name: '衢州' }
    ],
    R: [
      { id: 92, name: '日照' },
      { id: 93, name: '荣成' }
    ],
    S: [
      { id: 94, name: '上海' },
      { id: 95, name: '深圳' },
      { id: 96, name: '苏州' },
      { id: 97, name: '沈阳' },
      { id: 98, name: '石家庄' },
      { id: 99, name: '绍兴' },
      { id: 100, name: '汕头' },
      { id: 101, name: '汕尾' },
      { id: 102, name: '韶关' },
      { id: 103, name: '邵阳' }
    ],
    T: [
      { id: 104, name: '天津' },
      { id: 105, name: '太原' },
      { id: 106, name: '唐山' },
      { id: 107, name: '台州' },
      { id: 108, name: '泰州' }
    ],
    W: [
      { id: 109, name: '武汉' },
      { id: 110, name: '无锡' },
      { id: 111, name: '温州' },
      { id: 112, name: '潍坊' },
      { id: 113, name: '威海' }
    ],
    X: [
      { id: 114, name: '西安' },
      { id: 115, name: '厦门' },
      { id: 116, name: '徐州' },
      { id: 117, name: '西宁' },
      { id: 118, name: '襄阳' }
    ],
    Y: [
      { id: 119, name: '宜昌' },
      { id: 120, name: '岳阳' },
      { id: 121, name: '运城' },
      { id: 122, name: '阳江' }
    ],
    Z: [
      { id: 123, name: '郑州' },
      { id: 124, name: '重庆' },
      { id: 125, name: '长沙' },
      { id: 126, name: '成都' },
      { id: 127, name: '长春' },
      { id: 128, name: '常州' },
      { id: 129, name: '漳州' },
      { id: 130, name: '株洲' }
    ]
  }

  // 所有城市字母
  const letters = Object.keys(citiesData).filter(key => key !== 'hot')

  // 生成日历数据
  useEffect(() => {
    generateCalendarDays()
  }, [currentYear, currentMonth])

  // 生成日历天数数据
  const generateCalendarDays = useCallback(() => {
    const days = []
    const firstDay = new Date(currentYear, currentMonth - 1, 1)
    const lastDay = new Date(currentYear, currentMonth, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    for (let i = 0; i < 42; i++) { // 6 rows x 7 days
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      
      const y = currentDate.getFullYear()
      const m = String(currentDate.getMonth() + 1).padStart(2, '0')
      const d = String(currentDate.getDate()).padStart(2, '0')
      const dateStr = `${y}-${m}-${d}`
      
      days.push({
        date: dateStr,
        day: currentDate.getDate(),
        month: currentDate.getMonth() + 1
      })
    }
    
    setCalendarDays(days)
  }, [currentYear, currentMonth])

  // 处理上一月
  const handlePrevMonth = useCallback(() => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1)
      setCurrentMonth(12)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }, [currentYear, currentMonth])

  // 处理下一月
  const handleNextMonth = useCallback(() => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1)
      setCurrentMonth(1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }, [currentYear, currentMonth])

  // 处理日期单元格点击
  const handleDateCellClick = useCallback((date) => {
    if (!checkInDate || (checkInDate && checkOutDate)) {
      // 第一次点击或已选择完整范围，设置为入住日期
      setCheckInDate(date)
      setCheckOutDate('')
    } else if (date > checkInDate) {
      // 第二次点击且日期晚于入住日期，设置为离店日期
      setCheckOutDate(date)
    } else {
      // 点击日期早于或等于入住日期，重新设置为入住日期
      setCheckInDate(date)
      setCheckOutDate('')
    }
  }, [checkInDate, checkOutDate])

  // 计算住宿晚数
  const calculateNights = useCallback((checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0
    
    const startDate = new Date(checkIn)
    const endDate = new Date(checkOut)
    const timeDiff = endDate.getTime() - startDate.getTime()
    const nightCount = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    return nightCount
  }, [])

  // 处理日历确认
  const handleCalendarConfirm = useCallback(() => {
    // 确保有完整的日期范围
    if (checkInDate && checkOutDate) {
      setShowCalendar(false)
    } else {
      Taro.showToast({
        title: '请选择完整的入住和离店日期',
        icon: 'none'
      })
    }
  }, [checkInDate, checkOutDate])

  // 处理城市搜索
  const handleCitySearch = (keyword) => {
    setCitySearchKeyword(keyword)
    if (!keyword) {
      setFilteredCities([])
      return
    }

    // 过滤城市
    const filtered = []
    Object.values(citiesData).forEach(cityList => {
      cityList.forEach(city => {
        if (city.name.includes(keyword)) {
          filtered.push(city)
        }
      })
    })
    setFilteredCities(filtered)
  }

  // 处理城市选择
  const handleCitySelect = (cityItem) => {
    setCity(cityItem.name)
    setShowCitySelector(false)
  }
  
  // 临时筛选状态 (用于筛选面板未确认时)
  const [tempFilters, setTempFilters] = useState({
    starRating: [],
    minPrice: '',
    maxPrice: '',
    rating: '',
    facilities: [],
    services: []
  })

  // 选项数据
  const STAR_OPTIONS = [2, 3, 4, 5]
  const FACILITY_OPTIONS = [
    { id: 'wifi', name: '免费WiFi', icon: 'wifi' },
    { id: 'parking', name: '免费停车场', icon: 'local_parking' },
    { id: 'gym', name: '健身房', icon: 'fitness_center' },
    { id: 'pool', name: '游泳池', icon: 'pool' },
    { id: 'restaurant', name: '餐厅', icon: 'restaurant' },
    { id: 'meeting', name: '会议室', icon: 'meeting_room' }
  ]
  const SERVICE_OPTIONS = [
    { id: 'reception', name: '24小时前台' },
    { id: 'luggage', name: '行李寄存' },
    { id: 'wakeup', name: '叫醒服务' },
    { id: 'room_service', name: '送餐服务' },
    { id: 'car_rental', name: '租车服务' }
  ]
  const RATING_OPTIONS = [
    { value: 4.8, label: '4.8分+' },
    { value: 4.5, label: '4.5分+' },
    { value: 4.0, label: '4.0分+' },
    { value: 3.5, label: '3.5分+' }
  ]

  // 初始化
  useEffect(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    const formatDate = (date) => {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }

    try {
      // 优先从全局搜索参数读取 (替代URL传参)
      const savedParams = Taro.getStorageSync('global_search_params') || {}
      
      // 核心条件
      const initCity = savedParams.city || '北京'
      const initCheckIn = savedParams.check_in_date || formatDate(today)
      const initCheckOut = savedParams.check_out_date || formatDate(tomorrow)
      const initKeyword = savedParams.keyword || ''
      
      setCity(initCity)
      setCheckInDate(initCheckIn)
      setCheckOutDate(initCheckOut)
      setKeyword(initKeyword)

      // 解析价格区间 (从首页传入的 max_min_price 格式如 "0-150")
      let initMinPrice = savedParams.min_price || ''
      let initMaxPrice = savedParams.max_price || ''
      
      if (savedParams.max_min_price && (!initMinPrice && !initMaxPrice)) {
          const parts = String(savedParams.max_min_price).split('-')
          if (parts.length === 2) {
              initMinPrice = parts[0]
              initMaxPrice = parts[1]
          }
      }

      // 更多筛选条件
      const initFilters = {
        starRating: savedParams.star_rating ? (Array.isArray(savedParams.star_rating) ? savedParams.star_rating : String(savedParams.star_rating).split(',')) : [],
        minPrice: initMinPrice,
        maxPrice: initMaxPrice,
        rating: savedParams.rating || '',
        facilities: savedParams.facilities ? (Array.isArray(savedParams.facilities) ? savedParams.facilities : String(savedParams.facilities).split(',')) : [],
        services: savedParams.services ? (Array.isArray(savedParams.services) ? savedParams.services : String(savedParams.services).split(',')) : []
      }

      setActiveFilters(initFilters)
      setTempFilters(initFilters)
      
    } catch (e) {
      console.error('Failed to load search params from storage', e)
    }
  }, [])

  // 监听状态变化并同步到本地缓存，确保刷新后恢复状态
  useEffect(() => {
      const currentParams = {
        city,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        keyword,
        star_rating: activeFilters.starRating,
        min_price: activeFilters.minPrice,
        max_price: activeFilters.maxPrice,
        rating: activeFilters.rating,
        facilities: activeFilters.facilities,
        services: activeFilters.services
      }
      Taro.setStorageSync('global_search_params', currentParams)
  }, [city, checkInDate, checkOutDate, keyword, activeFilters])

  // 监听核心条件变化，触发搜索
  useEffect(() => {
    if (city && checkInDate && checkOutDate) {
      fetchHotelList()
    }
  }, [city, checkInDate, checkOutDate, keyword, activeFilters]) 

  // 获取酒店列表
  const fetchHotelList = async () => {
    setLoading(true)
    try {
      const params = {
        city: city, // Map location/city to 'city' as per test file
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        keyword: keyword,
        star_rating: activeFilters.starRating.join(','),
        min_price: activeFilters.minPrice,
        max_price: activeFilters.maxPrice,
        rating: activeFilters.rating,
        facilities: activeFilters.facilities,
        services: activeFilters.services,
        page: 1,
        pageSize: 50
      }

      console.log('Calling API with params:', params)
      const res = await hotelApi.getHotelList(params)
      if (res.code === 0 && res.data && res.data.list) {
        setHotelList(res.data.list)
      } else {
        setHotelList([])
      }
    } catch (error) {
      console.error('Fetch error:', error)
      Taro.showToast({ title: 'Failed to load hotels', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // 打开筛选面板
  const openFilterDrawer = () => {
    // 将当前生效的 filters 同步到 temp
    setTempFilters({ ...activeFilters })
    setIsFilterOpen(true)
  }

  // 关闭筛选面板
  const closeFilterDrawer = () => {
    setIsFilterOpen(false)
  }

  // 确认筛选
  const handleConfirmFilter = () => {
    // 更新正式状态
    setActiveFilters({ ...tempFilters })
    
    setIsFilterOpen(false)
    // useEffect 会监听 activeFilters 变化并触发搜索和缓存更新
  }

  // 重置筛选
  const handleResetFilter = () => {
    setTempFilters({
        starRating: [],
        minPrice: '',
        maxPrice: '',
        rating: '',
        facilities: [],
        services: []
    })
  }

  // 处理临时筛选改变
  const toggleTempListOption = (field, value) => {
    setTempFilters(prev => {
      const list = prev[field]
      const valueStr = String(value)
      // Check if value exists (handling both numbers and strings)
      const exists = list.some(item => String(item) === valueStr)
      
      if (exists) {
        return { ...prev, [field]: list.filter(i => String(i) !== valueStr) }
      } else {
        return { ...prev, [field]: [...list, value] }
      }
    })
  }

  const setTempSingleOption = (field, value) => {
    setTempFilters(prev => ({ ...prev, [field]: value }))
  }

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const m = date.getMonth() + 1
    const d = date.getDate()
    return `${m}月${d}日`
  }

  const formatDate = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

    return (
    <View className='hotel-list-page'>
      {/* Header Section */}
      <View className='header'>
        <View className='search-bar-container'>
            <View className='search-inputs'>
                <View className='input-group border-r' onClick={() => setShowCitySelector(true)}>
                  <Text className='label'>城市</Text>
                  <View className='value-text'>{city}</View>
              </View>
              <View className='input-group' onClick={() => setShowCalendar(true)}>
                  <Text className='label'>日期</Text>
                  <View className='value-text'>
                      {formatDateDisplay(checkInDate)} - {formatDateDisplay(checkOutDate)}
                  </View>
              </View>
                <View className='filter-btn' onClick={openFilterDrawer}>
                    <Text className='material-icons'>tune</Text>
                </View>
            </View>

            <View className='search-input-container' style={{ position: 'relative', zIndex: 100 }}>
                <Text className='search-icon'>🔍</Text>
                <Input 
                    className='search-input' 
                    placeholder="输入酒店名称 / 品牌 / 位置" 
                    value={keyword}
                    onInput={(e) => setKeyword(e.detail.value)}
                    style={{ 
                      flex: 1, 
                      fontSize: '14px', 
                      color: '#333', 
                      background: 'transparent', 
                      padding: '4px 0', 
                      outline: 'none', 
                      border: 'none', 
                      minHeight: '20px'
                    }}
                />
            </View>
        </View>
      </View>

      {/* Hotel List */}
      <ScrollView scrollY className='hotel-list hotel-list-scroll'>
        {loading ? (
          <View className='loading-state'>加载中...</View>
        ) : hotelList.length === 0 ? (
          <View className='empty-state'>暂无酒店</View>
        ) : (
          hotelList.map((hotel, index) => (
            <View 
              key={hotel.hotel_id || hotel.id} 
              className={`hotel-item animate-fadeInUp delay-${(index % 5) * 100}`} 
              onClick={() => Taro.navigateTo({ url: `/pages/hotel-detail/index?id=${hotel.hotel_id || hotel.id}` })}
            >
              <Image 
                className='hotel-image' 
                src={Array.isArray(hotel.main_image_url) ? (hotel.main_image_url[0] || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hotel%20exterior%20building%20architecture&image_size=landscape_4_3') : (hotel.main_image_url || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hotel%20exterior%20building%20architecture&image_size=landscape_4_3')} 
                mode='aspectFill' 
                onError={(e) => {
                  e.target.src = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hotel%20exterior%20building%20architecture&image_size=landscape_4_3'
                }}
              />
              <View className='hotel-info'>
                <View className='hotel-header'>
                  <View style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '4px' }}>
                      <Text className='hotel-name' style={{ flex: '0 1 auto', marginRight: '8px', marginBottom: 0 }}>{hotel.hotel_name_cn}</Text>
                      {hotel.tags && hotel.tags.slice(0, 2).map((tag, tagIndex) => (
                        <View key={tagIndex} style={{ 
                          backgroundColor: '#E6F7FF', 
                          borderRadius: '4px', 
                          padding: '2px 6px', 
                          marginRight: '6px',
                          border: '1px solid #91D5FF',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Text style={{ fontSize: '10px', color: '#1890FF', lineHeight: 1 }}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                    {hotel.hotel_name_en && <Text style={{ fontSize: '11px', color: '#666', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{hotel.hotel_name_en}</Text>}
                  </View>
                  <View className='hotel-rating' style={{ marginLeft: '8px', flexShrink: 0 }}>
                    <Text className='rating-value'>{hotel.rating || 0}</Text>
                  </View>
                </View>
                
                <View style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', marginTop: '4px', fontSize: '11px', color: '#666' }}>
                  <Text>{hotel.star_rating}星级</Text>
                  <Text style={{ margin: '0 4px' }}>·</Text>
                  <Text>{hotel.review_count}点评</Text>
                  <Text style={{ margin: '0 4px' }}>·</Text>
                  <Text>{hotel.booking_count}预订</Text>
                  <Text style={{ margin: '0 4px' }}>·</Text>
                  <Text>{hotel.favorite_count}收藏</Text>
                </View>

                <Text className='hotel-address' style={{ marginTop: '4px' }}>{hotel.location_info?.formatted_address || hotel.formatted_address}</Text>
                {hotel.nearby_info && <Text style={{ fontSize: '11px', color: '#999', marginTop: '2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{hotel.nearby_info}</Text>}
                
                <View className='hotel-footer' style={{ marginTop: '8px' }}>
                  <View className='hotel-price'>
                    <Text className='price-symbol'>¥</Text>
                    <Text className='price-value'>{hotel.min_price}</Text>
                    <Text className='price-unit'>/晚</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Filter Drawer Overlay */}
      <View 
        className={`filter-drawer-mask ${isFilterOpen ? 'visible' : ''}`} 
        onClick={closeFilterDrawer}
      />
      
      {/* Filter Drawer Content */}
      <View className={`filter-drawer ${isFilterOpen ? 'open' : ''}`}>
        <View className='drawer-header'>
            <Text className='title'>筛选</Text>
            <View className='close-btn' onClick={closeFilterDrawer}>
                <Text className='material-icons'>close</Text>
            </View>
        </View>

        <View className='drawer-content'>
            {/* Price Range */}
            <View className='filter-section'>
                <Text className='section-title'>价格区间 (¥)</Text>
                <View className='options-grid grid-3'>
                    {[150, 300, 500, 800, 1000].map(price => (
                        <View 
                            key={price}
                            className={`filter-option ${tempFilters.maxPrice === String(price) ? 'selected' : ''}`}
                            onClick={() => {
                                const isSelected = tempFilters.maxPrice === String(price)
                                setTempFilters(prev => ({
                                    ...prev,
                                    minPrice: isSelected ? '' : '0',
                                    maxPrice: isSelected ? '' : String(price)
                                }))
                            }}
                        >
                            <Text className='option-label'>&lt; ¥{price}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Star Rating */}
            <View className='filter-section'>
                <Text className='section-title'>星级</Text>
                <View className='options-grid grid-4'>
                    {STAR_OPTIONS.map(star => (
                        <View 
                            key={star}
                            className={`filter-option ${tempFilters.starRating.some(s => String(s) === String(star)) ? 'selected' : ''}`}
                            onClick={() => toggleTempListOption('starRating', star)}
                        >
                            <View className='star-row'>
                                {Array.from({ length: star }).map((_, i) => (
                                    <Text key={i} className='material-icons star-icon'>star</Text>
                                ))}
                            </View>
                            <Text className='option-label'>{star}星</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* User Rating */}
            <View className='filter-section'>
                <Text className='section-title'>评分</Text>
                <View className='options-grid grid-3'>
                    {RATING_OPTIONS.map(opt => (
                        <View 
                            key={opt.value}
                            className={`filter-option ${String(tempFilters.rating) === String(opt.value) ? 'selected' : ''}`}
                            onClick={() => setTempSingleOption('rating', String(tempFilters.rating) === String(opt.value) ? '' : opt.value)}
                        >
                            <Text className='option-label'>{opt.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Facilities */}
            <View className='filter-section'>
                <Text className='section-title'>设施</Text>
                <View className='options-grid grid-3'>
                    {FACILITY_OPTIONS.map(fac => (
                        <View 
                            key={fac.id}
                            className={`filter-option ${tempFilters.facilities.includes(fac.id) ? 'selected' : ''}`}
                            onClick={() => toggleTempListOption('facilities', fac.id)}
                        >
                            <Text className='material-icons'>{fac.icon}</Text>
                            <Text className='option-label'>{fac.name}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Services */}
            <View className='filter-section'>
                <Text className='section-title'>服务</Text>
                <View className='options-grid grid-2'>
                    {SERVICE_OPTIONS.map(srv => (
                        <View 
                            key={srv.id}
                            className={`filter-option ${tempFilters.services.includes(srv.id) ? 'selected' : ''}`}
                            onClick={() => toggleTempListOption('services', srv.id)}
                        >
                            <Text className='option-label'>{srv.name}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>

        <View className='drawer-footer'>
            <View className='btn btn-reset' onClick={handleResetFilter}>重置</View>
            <View className='btn btn-confirm' onClick={handleConfirmFilter}>确定</View>
        </View>
      </View>

      {/* City Selector */}
      {showCitySelector && (
        <View className='city-selector-container'>
          <View className='city-selector-content'>
            {/* Fixed Header */}
            <View className='city-selector-header'>
              <Text className='city-selector-title'>选择城市</Text>
              <Text className='city-selector-close' onClick={() => setShowCitySelector(false)}>✕</Text>
            </View>
            
            {/* Fixed Search Box */}
            <View className='city-search-box'>
              <Text className='city-search-icon'>🔍</Text>
              <Input 
                  className='city-search-input'
                  placeholder='输入城市名称搜索'
                  value={citySearchKeyword}
                  onInput={(e) => handleCitySearch(e.detail.value)}
                />
            </View>
            
            {/* Scrollable City List */}
            <ScrollView 
              className='city-list-container'
              scrollY
            >
              {citySearchKeyword ? (
                /* Search Results */
                <View className='city-section'>
                  <Text className='section-title'>搜索结果</Text>
                  <View className='city-list'>
                    {filteredCities.length > 0 ? (
                      filteredCities.map(city => (
                        <View 
                          key={city.id} 
                          className='city-item'
                          onClick={() => handleCitySelect(city)}
                        >
                          <Text>{city.name}</Text>
                        </View>
                      ))
                    ) : (
                      <View className='no-result'>
                        <Text>未找到匹配的城市</Text>
                      </View>
                    )}
                  </View>
                </View>
              ) : (
                /* Hot Cities and Alphabetical List */
                <>
                  {/* Hot Cities */}
                  <View className='city-section'>
                    <Text className='section-title'>热门城市</Text>
                    <View className='hot-cities'>
                      {citiesData.hot.map(city => (
                        <View 
                          key={city.id} 
                          className='hot-city-item'
                          onClick={() => handleCitySelect(city)}
                        >
                          <Text>{city.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  
                  {/* Alphabetical List */}
                  {letters.map(letter => (
                    <View key={letter} className='city-section'>
                      <Text className='section-title'>{letter}</Text>
                      <View className='city-list'>
                        {citiesData[letter].map(city => (
                          <View 
                            key={city.id} 
                            className='city-item'
                            onClick={() => handleCitySelect(city)}
                          >
                            <Text>{city.name}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Calendar Component */}
      {showCalendar && (
        <View className='calendar-container'>
          <View className='calendar-content'>
            <View className='calendar-header'>
              <Text className='calendar-title'>选择日期</Text>
              <Text className='calendar-close' onClick={() => setShowCalendar(false)}>✕</Text>
            </View>
            
            <View className='calendar-range-info'>
              <Text className='range-info-item'>
                入住: <Text style={{ color: '#1890ff' }}>{checkInDate || '未选择'}</Text>
              </Text>
              <Text className='range-info-item'>
                离店: <Text style={{ color: '#1890ff' }}>{checkOutDate || '未选择'}</Text>
              </Text>
              <Text className='range-info-item'>
                晚数: <Text style={{ color: '#1890ff' }}>{calculateNights(checkInDate, checkOutDate)}晚</Text>
              </Text>
            </View>
            
            <View className='calendar-body' style={{ height: '500px' }}>
              <View className='full-calendar'>
                <View className='calendar-header-section'>
                  <Button className='month-nav-btn' onClick={handlePrevMonth}>◀</Button>
                  <Text className='current-month'>{currentYear}年{currentMonth}月</Text>
                  <Button className='month-nav-btn' onClick={handleNextMonth}>▶</Button>
                </View>
                
                <View className='week-header'>
                  {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
                    <Text key={index} className='week-day'>{day}</Text>
                  ))}
                </View>
                
                <View className='date-grid'>
                  {calendarDays.map((day, index) => {
                    const isToday = day.date === formatDate(new Date())
                    const isCheckIn = day.date === checkInDate
                    const isCheckOut = day.date === checkOutDate
                    const isInRange = checkInDate && checkOutDate && 
                      day.date >= checkInDate && day.date <= checkOutDate
                    const isDisabled = day.date < formatDate(new Date())
                    const isOtherMonth = day.month !== currentMonth
                    
                    return (
                      <View
                        key={index}
                        className={`date-cell ${isToday ? 'today' : ''} ${isCheckIn ? 'check-in' : ''} ${isCheckOut ? 'check-out' : ''} ${isInRange ? 'in-range' : ''} ${isDisabled ? 'disabled' : ''} ${isOtherMonth ? 'other-month' : ''}`}
                        onClick={() => !isDisabled && !isOtherMonth && handleDateCellClick(day.date)}
                      >
                        <Text className={`date-text ${isDisabled ? 'disabled-text' : ''} ${isOtherMonth ? 'disabled-text' : ''}`}>
                          {day.day}
                        </Text>
                      </View>
                    )
                  })}
                </View>
              </View>
            </View>
            
            <View className='calendar-footer'>
              <Button className='calendar-confirm-btn' onClick={handleCalendarConfirm}>
                确认
              </Button>
            </View>
          </View>
        </View>
      )}

    </View>
  )
}
