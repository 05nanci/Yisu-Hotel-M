import { View, Text, Button, Image, Input, ScrollView } from '@tarojs/components'
import { useCallback, useState, useEffect, useRef } from 'react'
import Taro, { getLocation, showModal, navigateTo, showToast, useRouter } from '@tarojs/taro'
import { hotelApi, cityApi, bannerApi } from '../../services/api'
import './index.less'

export default function Index () {
  const router = useRouter()
  // 状态管理
  const [currentCity, setCurrentCity] = useState('北京')
  const [keyword, setKeyword] = useState('')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [locationPermission, setLocationPermission] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showCitySelector, setShowCitySelector] = useState(false)
  const [citySearchKeyword, setCitySearchKeyword] = useState('')
  const [filteredCities, setFilteredCities] = useState([])
  const [showHotelList, setShowHotelList] = useState(false)
  const [searchParams, setSearchParams] = useState({})
  const [selectedTags, setSelectedTags] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  const [currentFilterType, setCurrentFilterType] = useState('')
  const [filterOptions, setFilterOptions] = useState({})
  const [selectedFilterValue, setSelectedFilterValue] = useState('')
  const [selectedFacilities, setSelectedFacilities] = useState([])
  const [selectedServices, setSelectedServices] = useState([])
  const [maxMinPrice, setMaxMinPrice] = useState('')
  const [minRating, setMinRating] = useState('')

  // 设施和服务列表
  const availableFacilities = [
    { id: 'wifi', name: '免费WiFi' },
    { id: 'parking', name: '免费停车场' },
    { id: 'gym', name: '健身房' },
    { id: 'pool', name: '游泳池' },
    { id: 'restaurant', name: '餐厅' },
    { id: 'meeting', name: '会议室' }
  ]

  const availableServices = [
    { id: 'reception', name: '24小时前台' },
    { id: 'luggage', name: '行李寄存' },
    { id: 'wakeup', name: '叫醒服务' },
    { id: 'room_service', name: '送餐服务' },
    { id: 'car_rental', name: '租车服务' }
  ]
  // 搜索历史和推荐状态
  const [searchHistory, setSearchHistory] = useState([])
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState([])
  
  // 从后端API获取的数据
  const [hotels, setHotels] = useState([])
  const [banners, setBanners] = useState([])
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [bannerTimer, setBannerTimer] = useState(null)
  const scrollViewRef = useRef(null)
  
  // 返回到搜索页面
  const handleBackToSearch = useCallback(() => {
    setShowHotelList(false)
  }, [])
  
  // 日历状态
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [calendarDays, setCalendarDays] = useState([])

  // 初始化日期为今天和明天
  useEffect(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    setCheckInDate(formatDate(today))
    setCheckOutDate(formatDate(tomorrow))

    // 获取路由参数
    const params = router.params
    if (params && params.city) {
      console.log('从城市选择页返回，选择的城市:', params.city)
      setCurrentCity(params.city)
    }
    
    // 加载搜索历史
    loadSearchHistory()
  }, [])

  // 加载搜索历史
  const loadSearchHistory = useCallback(() => {
    try {
      const history = Taro.getStorageSync('searchHistory') || []
      setSearchHistory(history)
    } catch (error) {
      console.error('加载搜索历史失败:', error)
      setSearchHistory([])
    }
  }, [])

  // 保存搜索历史
  const saveSearchHistory = useCallback((keyword) => {
    if (!keyword.trim()) return

    try {
      let history = Taro.getStorageSync('searchHistory') || []
      // 移除重复项
      history = history.filter(item => item !== keyword)
      // 添加到开头
      history.unshift(keyword)
      // 限制历史记录数量
      if (history.length > 10) {
        history = history.slice(0, 10)
      }
      Taro.setStorageSync('searchHistory', history)
      setSearchHistory(history)
    } catch (error) {
      console.error('保存搜索历史失败:', error)
    }
  }, [])

  // 清除搜索历史
  const clearSearchHistory = useCallback(() => {
    try {
      Taro.removeStorageSync('searchHistory')
      setSearchHistory([])
    } catch (error) {
      console.error('清除搜索历史失败:', error)
    }
  }, [])

  // 获取搜索建议
  const getSearchSuggestions = useCallback((input) => {
    if (!input.trim()) {
      setSearchSuggestions([])
      return
    }

    // 模拟搜索建议
    const suggestions = [
      `${input}酒店`,
      `${input}民宿`,
      `${input}度假村`,
      `靠近${input}的酒店`,
      `在${input}附近的住宿`
    ]
    setSearchSuggestions(suggestions)
  }, [])

  // 处理搜索输入变化
  const handleKeywordChange = useCallback((e) => {
    const value = e.detail.value
    setKeyword(value)
    if (value.trim()) {
      getSearchSuggestions(value)
      setShowSearchSuggestions(true)
    } else {
      setShowSearchSuggestions(false)
    }
  }, [getSearchSuggestions])

  // 选择搜索建议
  const handleSelectSuggestion = useCallback((suggestion) => {
    setKeyword(suggestion)
    setShowSearchSuggestions(false)
  }, [])

  // 选择搜索历史
  const handleSelectHistory = useCallback((historyItem) => {
    setKeyword(historyItem)
    setShowSearchSuggestions(false)
  }, [])

  // 从后端API获取数据
  useEffect(() => {
    console.log('触发数据获取，当前城市:', currentCity)
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log('开始获取数据...')
        
        // 先获取广告列表
        try {
          const bannerResult = await bannerApi.getBanners()
          if (bannerResult.code === 0 && bannerResult.data) {
            setBanners(bannerResult.data)
          }
        } catch (error) {
          console.error('获取广告列表失败:', error)
          // 如果获取广告列表失败，使用默认数据
          setBanners([
            {
              id: 1,
              image_url: 'http://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20promotion%20banner%20with%20spring%20festival%20discount%20chinese%20new%20year&image_size=landscape_16_9',
              title: '春节特惠',
              description: '低至 8 折',
              target_type: 'hotel',
              target_id: '',
              url: ''
            },
            {
              id: 2,
              image_url: 'http://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20promotion%20banner%20for%20new%20users%20exclusive%20offer&image_size=landscape_16_9',
              title: '新用户专享',
              description: '首单立减',
              target_type: 'hotel',
              target_id: '',
              url: ''
            }
          ])
        }
        
        // 获取酒店列表
        console.log('开始获取酒店列表...')
        try {
          // 使用当前城市作为参数，如果还在定位中则使用北京
          const cityName = currentCity === '定位中...' ? '北京' : currentCity
          const hotelResult = await hotelApi.getHotelList({
            location: cityName,
            page: 1,
            pageSize: 10
          })
          console.log('酒店列表API返回结果:', hotelResult)
          if (hotelResult.code === 0 && hotelResult.data) {
            // 处理后端返回的数据结构
            const rawHotels = hotelResult.data.list || []
            
            // 转换酒店数据格式，包含用户要求的所有字段
            const formattedHotels = rawHotels.map(hotel => ({
              id: hotel.hotel_id,
              hotel_name_cn: hotel.hotel_name_cn,
              hotel_name_en: hotel.hotel_name_en,
              star_rating: hotel.star_rating,
              rating: hotel.rating,
              nearby_info: hotel.nearby_info,
              main_image_url: hotel.main_image_url,
              tags: hotel.tags || [],
              formatted_address: hotel.location_info ? hotel.location_info.formatted_address : '',
              favorite_count: hotel.favorite_count,
              booking_count: hotel.booking_count,
              review_count: hotel.review_count,
              min_price: hotel.min_price
            }))
            
            setHotels(formattedHotels)
          }
        } catch (error) {
          console.error('获取酒店列表失败:', error)
          setHotels([])
        }
      } catch (error) {
        console.error('获取数据失败:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [currentCity]) // 依赖于 currentCity，当城市变化时重新获取

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
      days.push({
        date: formatDate(currentDate),
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

  // 格式化日期函数
  const formatDate = useCallback((date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])

  // 计算住宿晚数
  const calculateNights = useCallback((checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0
    
    const startDate = new Date(checkIn)
    const endDate = new Date(checkOut)
    const timeDiff = endDate.getTime() - startDate.getTime()
    const nightCount = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    return nightCount
  }, [])

  const [starRating, setStarRating] = useState('')

  // 处理查询按钮点击
  const handleSearch = useCallback(() => {
    console.log('点击了查询按钮')
    
    try {
      // 保存搜索历史
      if (keyword.trim()) {
        saveSearchHistory(keyword)
      }
      
      // 构建查询参数
      const params = {
        city: currentCity === '定位中...' ? '北京' : currentCity,
        keyword: keyword,
        check_in_date: checkInDate || new Date().toISOString().split('T')[0],
        check_out_date: checkOutDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
        nights: calculateNights(checkInDate, checkOutDate) || 1,
        star_rating: starRating,
        max_min_price: maxMinPrice,
        rating: minRating,
        facilities: selectedFacilities,
        services: selectedServices
      }
      
      console.log('搜索参数:', params)
      
      // 使用本地缓存传递参数，避免URL编码问题
      Taro.setStorageSync('global_search_params', params)

      // 跳转到酒店列表页
      navigateTo({
        url: `/pages/hotel-list-new/hotel-list-new`
      })
      
    } catch (error) {
      console.log('搜索异常:', error)
      showToast({
        title: '搜索异常，请检查',
        icon: 'none'
      })
    }
  }, [currentCity, keyword, checkInDate, checkOutDate, calculateNights, starRating, maxMinPrice, minRating, selectedFacilities, selectedServices, saveSearchHistory])

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
  const handleCitySelect = (city) => {
    setCurrentCity(city.name)
    setShowCitySelector(false)
  }

  // 处理城市选择按钮点击
  const handleCityClick = () => {
    console.log('点击了城市选择按钮，显示城市选择器')
    setShowCitySelector(true)
  }

  // 处理Banner点击
  const handleBannerClick = useCallback(() => {
    // 跳转到酒店列表页面，用户可以从列表中选择酒店进入详情页面
    console.log('广告点击，准备跳转到酒店列表页面');
    try {
      // 使用正确的页面路径
      window.location.href = '#/pages/hotel-list-new/hotel-list-new';
      console.log('跳转成功');
    } catch (error) {
      console.log('跳转异常:', error);
    }
  }, [])

  // 自动轮播函数
  const startAutoCarousel = useCallback(() => {
    // 清除之前的定时器
    if (bannerTimer) {
      clearInterval(bannerTimer)
    }

    // 启动新的定时器，每3秒切换一次
    const timer = setInterval(() => {
      setCurrentBannerIndex(prevIndex => {
        return (prevIndex + 1) % banners.length
      })
    }, 3000)

    setBannerTimer(timer)
  }, [banners.length])

  // 监听banners变化，启动自动轮播
  useEffect(() => {
    if (banners.length > 1) {
      startAutoCarousel()
    }

    // 组件卸载时清除定时器
    return () => {
      if (bannerTimer) {
        clearInterval(bannerTimer)
      }
    }
  }, [banners.length, startAutoCarousel])

  // 监听currentBannerIndex变化，自动滚动
  useEffect(() => {
    if (banners.length > 1) {
      setTimeout(() => {
        const screenWidth = Taro.getSystemInfoSync().windowWidth
        if (scrollViewRef.current) {
          // 使用Taro的createSelectorQuery来获取ScrollView并滚动
          Taro.createSelectorQuery()
            .select('.banner-scroll')
            .node()
            .exec((res) => {
              if (res[0] && res[0].node) {
                res[0].node.scrollTo({
                  left: currentBannerIndex * screenWidth,
                  animated: true
                })
              }
            })
        }
      }, 100)
    }
  }, [currentBannerIndex, banners.length])

  // 处理快捷标签点击
  const handleTagClick = useCallback((item, type) => {
    console.log('点击标签', item, type)
    if (type === 'facility') {
      setSelectedFacilities(prev => {
        if (prev.includes(item.id)) {
          return prev.filter(t => t !== item.id)
        } else {
          return [...prev, item.id]
        }
      })
    } else if (type === 'service') {
      setSelectedServices(prev => {
        if (prev.includes(item.id)) {
          return prev.filter(t => t !== item.id)
        } else {
          return [...prev, item.id]
        }
      })
    }
  }, [])

  // 处理筛选条件点击
  const handleFilterClick = useCallback((filterType) => {
    console.log('点击筛选', filterType)
    setCurrentFilterType(filterType)
    
    // 不需要重置选中值，保持之前的选择状态
    
    setShowFilter(true)
  }, [])

  // 处理筛选选项点击
  const handleFilterOptionClick = useCallback((value) => {
    console.log('点击筛选选项', value)
    
    if (currentFilterType === 'facility') {
      // 设施类型支持多选
      setSelectedFacilities(prev => {
        if (prev.includes(value)) {
          return prev.filter(item => item !== value)
        } else {
          return [...prev, value]
        }
      })
    } else if (currentFilterType === 'service') {
      // 服务类型支持多选
      setSelectedServices(prev => {
        if (prev.includes(value)) {
          return prev.filter(item => item !== value)
        } else {
          return [...prev, value]
        }
      })
    } else if (currentFilterType === 'star') {
      setStarRating(prev => prev === value ? '' : value)
    } else if (currentFilterType === 'rating') {
      setMinRating(prev => prev === value ? '' : value)
    } else if (currentFilterType === 'price') {
      setMaxMinPrice(prev => prev === value ? '' : value)
    }
  }, [currentFilterType])

  // 处理日期选择
  const handleDateClick = useCallback(() => {
    console.log('点击日期选择')
    // 显示日历组件
    setShowCalendar(true)
  }, [])

  // 处理日历取消
  const handleCalendarCancel = useCallback(() => {
    setShowCalendar(false)
  }, [])

  // 处理日历确认
  const handleCalendarConfirm = useCallback(() => {
    // 确保有完整的日期范围
    if (checkInDate && checkOutDate) {
      setShowCalendar(false)
    } else {
      showModal({
        title: '提示',
        content: '请选择完整的入住和离店日期',
        showCancel: false
      })
    }
  }, [checkInDate, checkOutDate])

  return (
    <View className='index'>
      {/* 条件渲染：显示酒店列表或搜索页面 */}
      {showHotelList ? (
        /* 酒店列表内容 */
        <View className='hotel-list-page'>
          {/* 酒店列表头部 */}
          <View className='hotel-list-header'>
            <Button className='back-btn' onClick={handleBackToSearch}>
              返回
            </Button>
            <Text className='page-title'>酒店列表</Text>
          </View>
          
          {/* 搜索结果统计 */}
          <View className='search-result'>
            <Text>共找到 10 家酒店</Text>
          </View>
          
          {/* 酒店列表 */}
          <ScrollView className='hotel-list'>
            {/* 酒店项 1 */}
            <View className='hotel-item'>
              <Image className='hotel-image' src='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hotel%20exterior%20building%20architecture&image_size=square' />
              <View className='hotel-info'>
                <View className='hotel-header'>
                  <Text className='hotel-name'>北京王府井希尔顿酒店</Text>
                  <Button className='collect-btn'>收藏</Button>
                </View>
                <Text className='hotel-address'>北京市东城区王府井东街8号</Text>
                <View className='hotel-footer'>
                  <View className='hotel-price'>
                    <Text className='price-symbol'>¥</Text>
                    <Text className='price-value'>1288</Text>
                    <Text className='price-unit'>/晚</Text>
                  </View>
                  <View className='hotel-rating'>
                    <Text className='rating-value'>4.8</Text>
                    <Text className='rating-label'>分</Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* 酒店项 2 */}
            <View className='hotel-item'>
              <Image className='hotel-image' src='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20hotel%20facade%20with%20modern%20design&image_size=square' />
              <View className='hotel-info'>
                <View className='hotel-header'>
                  <Text className='hotel-name'>北京国贸大酒店</Text>
                  <Button className='collect-btn'>收藏</Button>
                </View>
                <Text className='hotel-address'>北京市朝阳区建国门外大街1号</Text>
                <View className='hotel-footer'>
                  <View className='hotel-price'>
                    <Text className='price-symbol'>¥</Text>
                    <Text className='price-value'>1588</Text>
                    <Text className='price-unit'>/晚</Text>
                  </View>
                  <View className='hotel-rating'>
                    <Text className='rating-value'>4.9</Text>
                    <Text className='rating-label'>分</Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* 酒店项 3 */}
            <View className='hotel-item'>
              <Image className='hotel-image' src='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20hotel%20building%20with%20glass%20facade&image_size=square' />
              <View className='hotel-info'>
                <View className='hotel-header'>
                  <Text className='hotel-name'>北京三里屯洲际酒店</Text>
                  <Button className='collect-btn'>收藏</Button>
                </View>
                <Text className='hotel-address'>北京市朝阳区三里屯北路1号</Text>
                <View className='hotel-footer'>
                  <View className='hotel-price'>
                    <Text className='price-symbol'>¥</Text>
                    <Text className='price-value'>1388</Text>
                    <Text className='price-unit'>/晚</Text>
                  </View>
                  <View className='hotel-rating'>
                    <Text className='rating-value'>4.7</Text>
                    <Text className='rating-label'>分</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      ) : (
        /* 首页搜索区域 */
        <>
          {/* 顶部导航栏 */}
          <View className='top-nav'>
            <View className='nav-left'>
              <Text className='nav-title'>易宿酒店</Text>
            </View>
            <View className='nav-right'>
              {Taro.getStorageSync('isLoggedIn') ? (
                <Text className='user-button' onClick={() => Taro.navigateTo({ url: '/pages/my/my' })}>我的</Text>
              ) : (
                <>
                  <Text className='login-button' onClick={() => Taro.navigateTo({ url: '/pages/login/login' })}>登录</Text>
                  <Text className='register-button' onClick={() => Taro.navigateTo({ url: '/pages/register/register' })}>注册</Text>
                </>
              )}
            </View>
          </View>

          {/* 顶部Banner轮播 */}
          <View className='banner-carousel'>
            <ScrollView 
              ref={scrollViewRef}
              className='banner-scroll'
              scrollX 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const offsetX = e.detail.scrollLeft
                const screenWidth = Taro.getSystemInfoSync().windowWidth
                const index = Math.round(offsetX / screenWidth)
                setCurrentBannerIndex(index)
              }}
              scrollEventThrottle={16}
            >
              {banners.length > 0 ? (
                banners.map((banner, index) => (
                  <View key={banner.id || index} className='banner-item' onClick={handleBannerClick} style={{cursor: 'pointer'}}>
                    <Image 
                      src={index === 0 ? "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20promotion%20banner%20with%20spring%20festival%20discount%20chinese%20new%20year&image_size=landscape_16_9" : "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20promotion%20banner%20for%20new%20users%20exclusive%20offer&image_size=landscape_16_9"} 
                      className='banner-image'
                      mode="aspectFill"
                    />
                    <View className='banner-text'>
                      {index === 0 ? '春节特惠' : '新用户专享'}
                      {index === 0 ? <Text className='banner-description'>低至 8 折</Text> : <Text className='banner-description'>首单立减</Text>}
                    </View>
                  </View>
                ))
              ) : (
                <>
                  <View className='banner-item' onClick={handleBannerClick} style={{cursor: 'pointer'}}>
                    <Image 
                      src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20promotion%20banner%20with%20spring%20festival%20discount%20chinese%20new%20year&image_size=landscape_16_9" 
                      className='banner-image'
                      mode="aspectFill"
                    />
                    <View className='banner-text'>
                      春节特惠
                      <Text className='banner-description'>低至 8 折</Text>
                    </View>
                  </View>
                  <View className='banner-item' onClick={handleBannerClick} style={{cursor: 'pointer'}}>
                    <Image 
                      src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20promotion%20banner%20for%20new%20users%20exclusive%20offer&image_size=landscape_16_9" 
                      className='banner-image'
                      mode="aspectFill"
                    />
                    <View className='banner-text'>
                      新用户专享
                      <Text className='banner-description'>首单立减</Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
            {/* 轮播指示器 */}
            {banners.length > 1 && (
              <View className='banner-indicators'>
                {banners.map((_, index) => (
                  <View 
                    key={index} 
                    className={`indicator ${currentBannerIndex === index ? 'active' : ''}`}
                  />
                ))}
              </View>
            )}
          </View>

          {/* 核心查询区域 */}
          <View className='search-container'>
            {/* 当前地点 */}
            <View className='location-bar' onClick={handleCityClick}>
              <Text className='location-icon'>📍</Text>
              <Text className='location-text'>{currentCity}</Text>
              <Text className='location-icon'>▾</Text>
            </View>

            {/* 日期选择框 */}
            <View className='date-container' onClick={handleDateClick}>
              <View className='date-item'>
                <Text className='date-label'>入住日期</Text>
                <Text className='date-value'>{checkInDate}</Text>
                <Text className='date-week'>周五</Text>
              </View>
              <View className='date-separator'>
                <Text className='date-night'>{calculateNights(checkInDate, checkOutDate)}晚</Text>
              </View>
              <View className='date-item'>
                <Text className='date-label'>离店日期</Text>
                <Text className='date-value'>{checkOutDate}</Text>
                <Text className='date-week'>周六</Text>
              </View>
            </View>

            {/* 关键字搜索框 */}
            <View className='search-input-container' style={{ position: 'relative', zIndex: 100 }}>
              <Text className='search-icon'>🔍</Text>
              <Input 
                className='search-input' 
                placeholder="输入酒店名称 / 品牌 / 位置" 
                value={keyword}
                onInput={handleKeywordChange}
                onFocus={() => {
                  if (!keyword.trim() && searchHistory.length > 0) {
                    setShowSearchSuggestions(true)
                  }
                }}
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

            {/* 搜索历史和建议 */}
            {showSearchSuggestions && (
              <View className='search-suggestions animate-fadeInUp' style={{ 
                position: 'absolute', 
                top: '100%', 
                left: '0', 
                right: '0', 
                marginTop: '8px', 
                backgroundColor: 'white', 
                borderRadius: '16px', 
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)', 
                zIndex: 1000, 
                maxHeight: '400px', 
                overflow: 'auto',
                border: '2px solid #f1f5f9'
              }}>
                {/* 搜索历史 */}
                {!keyword.trim() && searchHistory.length > 0 && (
                  <View style={{ padding: '16px' }}>
                    <View style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      marginBottom: '12px'
                    }}>
                      <Text style={{ 
                        fontSize: '15px', 
                        fontWeight: '600', 
                        color: '#333'
                      }}>搜索历史</Text>
                      <Text 
                        style={{ 
                          fontSize: '13px', 
                          color: '#1890ff', 
                          fontWeight: '500'
                        }}
                        onClick={clearSearchHistory}
                      >
                        清除
                      </Text>
                    </View>
                    <View style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '8px'
                    }}>
                      {searchHistory.map((item, index) => (
                        <View 
                          key={index} 
                          className={`animate-fadeInUp delay-${(index % 5) * 100}`}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '20px',
                            border: '1px solid #e2e8f0',
                            fontSize: '14px',
                            color: '#666',
                            cursor: 'pointer',
                            opacity: 0
                          }}
                          onClick={() => handleSelectHistory(item)}
                        >
                          {item}
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                
                {/* 搜索建议 */}
                {keyword.trim() && searchSuggestions.length > 0 && (
                  <View style={{ padding: '8px 0' }}>
                    {searchSuggestions.map((suggestion, index) => (
                      <View 
                        key={index} 
                        className={`animate-fadeInUp delay-${(index % 5) * 100}`}
                        style={{
                          padding: '16px 20px',
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          opacity: 0
                        }}
                        onClick={() => handleSelectSuggestion(suggestion)}
                      >
                        <Text style={{ 
                          fontSize: '14px', 
                          color: '#333',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <Text>🔍</Text>
                          {suggestion}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* 筛选条件栏 */}
            <View className='filter-bar'>
              <View className='filter-item' onClick={() => handleFilterClick('star')}>
                <Text>星级</Text>
                <Text className='filter-value'>{starRating ? `${starRating}星` : '不限'}</Text>
              </View>
              <View className='filter-divider'></View>
              <View className='filter-item' onClick={() => handleFilterClick('price')}>
                <Text>价格</Text>
                <Text className='filter-value'>{maxMinPrice ? `¥${maxMinPrice}以下` : '不限'}</Text>
              </View>
              <View className='filter-divider'></View>
              <View className='filter-item' onClick={() => handleFilterClick('rating')}>
                <Text>评分</Text>
                <Text className='filter-value'>{minRating ? `${minRating}分+` : '不限'}</Text>
              </View>
              <View className='filter-divider'></View>
              <View className='filter-item' onClick={() => handleFilterClick('facility')}>
                <Text>设施</Text>
                <Text className='filter-value'>{selectedFacilities.length > 0 ? `${selectedFacilities.length}项` : '不限'}</Text>
              </View>
              <View className='filter-divider'></View>
              <View className='filter-item' onClick={() => handleFilterClick('service')}>
                <Text>服务</Text>
                <Text className='filter-value'>{selectedServices.length > 0 ? `${selectedServices.length}项` : '不限'}</Text>
              </View>
            </View>

            {/* 快捷标签区 */}
            <ScrollView scrollX className='tags-container'>
              {availableFacilities.map(f => (
                <View 
                  key={f.id} 
                  className={`tag ${selectedFacilities.includes(f.id) ? 'tag-active' : ''}`} 
                  onClick={() => handleTagClick(f, 'facility')}
                >
                  {f.name}
                </View>
              ))}
              {availableServices.map(s => (
                <View 
                  key={s.id} 
                  className={`tag ${selectedServices.includes(s.id) ? 'tag-active' : ''}`} 
                  onClick={() => handleTagClick(s, 'service')}
                >
                  {s.name}
                </View>
              ))}
            </ScrollView>

            {/* 查询按钮 */}
            <Button className='search-button' onClick={handleSearch}>
              开始查询
            </Button>
          </View>

          {/* 精选推荐酒店列表 */}
          <View className='recommended-hotels'>
            <View className='recommended-header'>
              <Text className='recommended-title'>精选推荐</Text>
              <Text className='recommended-more' onClick={() => navigateTo({ url: '/pages/hotel-list/hotel-list' })}>查看更多</Text>
            </View>
            
            {loading ? (
              <View className='loading-container'>
                <Text className='loading-text'>加载中...</Text>
              </View>
            ) : hotels.length > 0 ? (
              <ScrollView scrollY className='hotel-list'>
                {hotels.map((hotel, index) => (
                  <View 
                    key={hotel.id} 
                    className={`hotel-item animate-fadeInUp delay-${(index % 5) * 100}`} 
                    onClick={() => navigateTo({ url: `/pages/hotel-detail/index?id=${hotel.id}` })}
                  >
                    <Image 
                      className='hotel-image' 
                      src={hotel.main_image_url && hotel.main_image_url.length > 0 ? hotel.main_image_url[0] : 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hotel%20exterior%20building%20architecture&image_size=landscape_4_3'} 
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

                      <Text className='hotel-address' style={{ marginTop: '4px' }}>{hotel.formatted_address}</Text>
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
                ))}
              </ScrollView>
            ) : (
              <View className='empty-container'>
                <Text className='empty-text'>暂无推荐酒店</Text>
              </View>
            )}
          </View>

          {/* 日历组件 */}
          {showCalendar && (
            <View className='calendar-container'>
              <View className='calendar-content'>
                <View className='calendar-header'>
                  <Text className='calendar-title'>选择日期</Text>
                  <Text className='calendar-close' onClick={handleCalendarCancel}>✕</Text>
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
                  {/* 自定义完整日历组件 */}
                  <View className='full-calendar'>
                    {/* 日历头部 */}
                    <View className='calendar-header-section'>
                      <Button className='month-nav-btn' onClick={handlePrevMonth}>
                        ◀
                      </Button>
                      <Text className='current-month'>
                        {currentYear}年{currentMonth}月
                      </Text>
                      <Button className='month-nav-btn' onClick={handleNextMonth}>
                        ▶
                      </Button>
                    </View>
                    
                    {/* 星期标题 */}
                    <View className='week-header'>
                      {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
                        <Text key={index} className='week-day'>
                          {day}
                        </Text>
                      ))}
                    </View>
                    
                    {/* 日期网格 */}
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

          {/* 城市选择器组件 */}
          {showCitySelector && (
            <View className='city-selector-container'>
              <View className='city-selector-content'>
                {/* 固定头部 */}
                <View className='city-selector-header'>
                  <Text className='city-selector-title'>选择城市</Text>
                  <Text className='city-selector-close' onClick={() => setShowCitySelector(false)}>✕</Text>
                </View>
                
                {/* 固定搜索框 */}
                <View className='city-search-box'>
                  <Text className='city-search-icon'>🔍</Text>
                  <Input 
                    className='city-search-input'
                    placeholder='输入城市名称搜索'
                    value={citySearchKeyword}
                    onInput={(e) => handleCitySearch(e.detail.value)}
                  />
                </View>
                
                {/* 可滚动的城市列表 */}
                <ScrollView 
                  className='city-list-container'
                  scrollY
                >
                  {citySearchKeyword ? (
                    /* 搜索结果 */
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
                    /* 热门城市和按字母排序的城市 */
                    <>
                      {/* 热门城市 */}
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
                      
                      {/* 按字母排序的城市 */}
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
          
          {/* 筛选弹窗 */}
          {showFilter && (
            <View className='filter-container'>
              <View className='filter-content'>
                <View className='filter-header'>
                  <Text className='filter-title'>
                    {currentFilterType === 'star' ? '选择星级' : 
                     currentFilterType === 'price' ? '价格范围' : 
                     currentFilterType === 'rating' ? '最低评分' :
                     currentFilterType === 'facility' ? '酒店设施' : '酒店服务'}
                  </Text>
                  <Text className='filter-close' onClick={() => setShowFilter(false)}>✕</Text>
                </View>
                
                <ScrollView className='filter-body' scrollY>
                  {currentFilterType === 'star' && (
                    <View className='filter-options'>
                      {[
                        { value: 5, label: '5星' },
                        { value: 4, label: '4星' },
                        { value: 3, label: '3星' },
                        { value: 2, label: '2星' }
                      ].map(item => (
                        <View 
                          key={item.value} 
                          className={`filter-option-item ${starRating === item.value ? 'filter-option-active' : ''}`}
                          onClick={() => handleFilterOptionClick(item.value)}
                        >
                          <Text>{item.label}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {currentFilterType === 'price' && (
                    <View className='filter-options'>
                      {[
                        { value: 150, label: '¥150以下' },
                        { value: 300, label: '¥300以下' },
                        { value: 500, label: '¥500以下' },
                        { value: 800, label: '¥800以下' },
                        { value: 1000, label: '¥1000以下' }
                      ].map(item => (
                        <View 
                          key={item.value} 
                          className={`filter-option-item ${maxMinPrice === item.value ? 'filter-option-active' : ''}`}
                          onClick={() => handleFilterOptionClick(item.value)}
                        >
                          <Text>{item.label}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {currentFilterType === 'rating' && (
                    <View className='filter-options'>
                      {[
                        { value: 4.8, label: '4.8分+' },
                        { value: 4.5, label: '4.5分+' },
                        { value: 4.0, label: '4.0分+' },
                        { value: 3.5, label: '3.5分+' }
                      ].map(item => (
                        <View 
                          key={item.value} 
                          className={`filter-option-item ${minRating === item.value ? 'filter-option-active' : ''}`}
                          onClick={() => handleFilterOptionClick(item.value)}
                        >
                          <Text>{item.label}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {currentFilterType === 'facility' && (
                    <View className='filter-options'>
                      {availableFacilities.map(f => (
                        <View 
                          key={f.id} 
                          className={`filter-option-item ${selectedFacilities.includes(f.id) ? 'filter-option-active' : ''}`}
                          onClick={() => handleFilterOptionClick(f.id)}
                        >
                          <Text>{f.name}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {currentFilterType === 'service' && (
                    <View className='filter-options'>
                      {availableServices.map(s => (
                        <View 
                          key={s.id} 
                          className={`filter-option-item ${selectedServices.includes(s.id) ? 'filter-option-active' : ''}`}
                          onClick={() => handleFilterOptionClick(s.id)}
                        >
                          <Text>{s.name}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </ScrollView>
                
                <View className='filter-footer'>
                  <Button className='filter-confirm-btn' onClick={() => setShowFilter(false)}>
                    确定
                  </Button>
                </View>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  )
}