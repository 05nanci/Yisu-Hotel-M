import { View, Text, Button, Image, Input, ScrollView } from '@tarojs/components'
import { useCallback, useState, useEffect } from 'react'
import { request, getLocation, showModal, navigateTo, showToast, useRouter } from '@tarojs/taro'
import { hotelApi, locationApi } from '../../services/api'
import './index.less'

export default function Index () {
  const router = useRouter()
  // 状态管理
  const [currentCity, setCurrentCity] = useState('定位中...')
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
    } else {
      getCurrentLocation()
    }
  }, [])

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

  // 获取当前位置
  const getCurrentLocation = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getLocation({
        type: 'wgs84',
        success: async (res) => {
          console.log('获取位置成功', res)
          try {
            // 调用后端API根据坐标获取位置信息
            const locationData = await locationApi.getLocationByCoords(
              res.latitude, 
              res.longitude
            )
            
            if (locationData.success && locationData.data) {
              setCurrentCity(locationData.data.city || '未知城市')
              setLocationPermission(true)
            } else {
              // 模拟返回北京
              setCurrentCity('北京')
              setLocationPermission(true)
            }
          } catch (apiError) {
            console.log('获取位置信息失败', apiError)
            // 模拟返回北京
            setCurrentCity('北京')
            setLocationPermission(true)
          }
        },
        fail: (err) => {
          console.log('获取位置失败', err)
          showModal({
            title: '定位失败',
            content: '定位失败，请手动选择城市',
            showCancel: false
          })
          setCurrentCity('请选择城市')
        }
      })
    } catch (error) {
      console.log('位置权限错误', error)
      showModal({
        title: '需要位置权限',
        content: '为精准推荐酒店，需获取您的位置信息',
        confirmText: '允许',
        cancelText: '拒绝',
        success: (res) => {
          if (res.confirm) {
            getCurrentLocation()
          } else {
            setCurrentCity('请选择城市')
          }
        }
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // 处理查询按钮点击
  const handleSearch = useCallback(() => {
    console.log('点击了查询按钮')
    
    try {
      // 构建查询参数
      const params = {
        city: currentCity === '定位中...' ? '北京' : currentCity,
        keyword: keyword,
        checkInDate: checkInDate || new Date().toISOString().split('T')[0],
        checkOutDate: checkOutDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
        nights: calculateNights(checkInDate, checkOutDate) || 1
      }
      
      console.log('搜索参数:', params)
      
      // 跳转到酒店列表页
      navigateTo({
        url: `/pages/hotel-list/hotel-list?params=${encodeURIComponent(JSON.stringify(params))}`
      })
      
    } catch (error) {
      console.log('搜索异常:', error)
      showToast({
        title: '搜索异常，请检查',
        icon: 'none'
      })
    }
  }, [currentCity, keyword, checkInDate, checkOutDate, calculateNights])

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
    navigateTo({
      url: '/pages/hotel-detail/hotel-detail?id=1'
    })
  }, [])

  // 处理快捷标签点击
  const handleTagClick = useCallback((tag) => {
    console.log('点击标签', tag)
    // 实现标签的选择和取消选择
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        // 如果标签已选中，则取消选择
        return prev.filter(t => t !== tag)
      } else {
        // 如果标签未选中，则选择
        return [...prev, tag]
      }
    })
  }, [])

  // 处理筛选条件点击
  const handleFilterClick = useCallback((filterType) => {
    console.log('点击筛选', filterType)
    setCurrentFilterType(filterType)
    
    // 重置选中值
    setSelectedFilterValue('')
    
    // 如果是设施筛选，重置设施选中状态
    if (filterType === 'facility') {
      setSelectedFacilities([])
    }
    
    setShowFilter(true)
  }, [])

  // 处理筛选选项点击
  const handleFilterOptionClick = useCallback((value) => {
    console.log('点击筛选选项', value)
    
    if (currentFilterType === 'facility') {
      // 设施类型支持多选
      setSelectedFacilities(prev => {
        if (prev.includes(value)) {
          // 如果已选中，则取消选中
          return prev.filter(item => item !== value)
        } else {
          // 如果未选中，则添加选中
          return [...prev, value]
        }
      })
    } else {
      // 其他类型保持单选
      setSelectedFilterValue(value)
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
          {/* 顶部Banner */}
          <View className='banner' onClick={handleBannerClick}>
            <Image 
              src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20promotion%20banner%20with%20spring%20festival%20discount&image_size=landscape_16_9" 
              className='banner-image'
              mode="aspectFill"
            />
            <View className='banner-text'>春节特惠，低至 8 折</View>
          </View>

          {/* 核心查询区域 */}
          <View className='search-container'>
            {/* 当前地点 */}
            <View className='location-bar' onClick={handleCityClick}>
              <Text className='location-text'>{currentCity}</Text>
              <Text className='location-icon'>▾</Text>
            </View>

            {/* 关键字搜索框 */}
            <View className='search-input-container' style={{ position: 'relative', zIndex: 100 }}>
              <Text className='search-icon'>🔍</Text>
              <input 
                className='search-input' 
                placeholder="输入酒店名称 / 品牌 / 位置" 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onSubmit={handleSearch}
                type="text"
                autoComplete="off"
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

            {/* 日期选择框 */}
            <View className='date-container' onClick={handleDateClick}>
              <Text className='date-icon'>📅</Text>
              <Text className='date-text'>
                {checkInDate} - {checkOutDate} 共 {calculateNights(checkInDate, checkOutDate)} 晚
              </Text>
            </View>

            {/* 筛选条件栏 */}
            <View className='filter-bar'>
              <View className='filter-item' onClick={() => handleFilterClick('star')}>
                <Text>星级</Text>
                <Text className='filter-arrow'>▾</Text>
              </View>
              <View className='filter-item' onClick={() => handleFilterClick('price')}>
                <Text>价格</Text>
                <Text className='filter-arrow'>▾</Text>
              </View>
              <View className='filter-item' onClick={() => handleFilterClick('facility')}>
                <Text>设施</Text>
                <Text className='filter-arrow'>▾</Text>
              </View>
            </View>

            {/* 快捷标签区 */}
            <ScrollView scrollX className='tags-container'>
              <View className={`tag ${selectedTags.includes('亲子友好') ? 'tag-active' : ''}`} onClick={() => handleTagClick('亲子友好')}>亲子友好</View>
              <View className={`tag ${selectedTags.includes('免费停车场') ? 'tag-active' : ''}`} onClick={() => handleTagClick('免费停车场')}>免费停车场</View>
              <View className={`tag ${selectedTags.includes('含早餐') ? 'tag-active' : ''}`} onClick={() => handleTagClick('含早餐')}>含早餐</View>
              <View className={`tag ${selectedTags.includes('豪华型') ? 'tag-active' : ''}`} onClick={() => handleTagClick('豪华型')}>豪华型</View>
              <View className={`tag ${selectedTags.includes('商务出行') ? 'tag-active' : ''}`} onClick={() => handleTagClick('商务出行')}>商务出行</View>
              <View className={`tag ${selectedTags.includes('近地铁') ? 'tag-active' : ''}`} onClick={() => handleTagClick('近地铁')}>近地铁</View>
            </ScrollView>

            {/* 查询按钮 */}
              <Button className='search-button' onClick={handleSearch}>
                查询
              </Button>
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
                    {currentFilterType === 'star' ? '选择星级' : currentFilterType === 'price' ? '选择价格' : '选择设施'}
                  </Text>
                  <Text className='filter-close' onClick={() => setShowFilter(false)}>✕</Text>
                </View>
                
                <ScrollView className='filter-body' scrollY>
                  {currentFilterType === 'star' && (
                    <View className='filter-options'>
                      {['不限', '5星', '4星', '3星', '2星及以下'].map(star => (
                        <View 
                          key={star} 
                          className={`filter-option-item ${selectedFilterValue === star ? 'filter-option-active' : ''}`}
                          onClick={() => handleFilterOptionClick(star)}
                        >
                          <Text>{star}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {currentFilterType === 'price' && (
                    <View className='filter-options'>
                      {['不限', '¥500以下', '¥500-800', '¥800-1200', '¥1200-2000', '¥2000以上'].map(price => (
                        <View 
                          key={price} 
                          className={`filter-option-item ${selectedFilterValue === price ? 'filter-option-active' : ''}`}
                          onClick={() => handleFilterOptionClick(price)}
                        >
                          <Text>{price}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {currentFilterType === 'facility' && (
                    <View className='filter-options'>
                      {['免费WiFi', '免费停车场', '健身房', '游泳池', '餐厅', '会议室', '商务中心', 'SPA'].map(facility => (
                        <View 
                          key={facility} 
                          className={`filter-option-item ${selectedFacilities.includes(facility) ? 'filter-option-active' : ''}`}
                          onClick={() => handleFilterOptionClick(facility)}
                        >
                          <Text>{facility}</Text>
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
