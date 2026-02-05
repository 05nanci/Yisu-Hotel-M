import { View, Text, Button, Image, Input, ScrollView } from '@tarojs/components'
import { useCallback, useState, useEffect } from 'react'
import { request, getLocation, showModal, navigateTo } from '@tarojs/taro'
import './index.less'

export default function Index () {
  // 状态管理
  const [currentCity, setCurrentCity] = useState('定位中...')
  const [keyword, setKeyword] = useState('')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [locationPermission, setLocationPermission] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  
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
    getCurrentLocation()
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

  // 获取当前位置
  const getCurrentLocation = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getLocation({
        type: 'wgs84',
        success: (res) => {
          console.log('获取位置成功', res)
          // 这里应该调用逆地理编码API获取城市名称
          // 模拟返回北京
          setCurrentCity('北京')
          setLocationPermission(true)
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
    // 构建查询参数
    const searchParams = {
      city: currentCity,
      keyword: keyword,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate
    }

    // 跳转到酒店列表页
    navigateTo({
      url: `/pages/hotel-list/hotel-list?params=${encodeURIComponent(JSON.stringify(searchParams))}`
    })
  }, [currentCity, keyword, checkInDate, checkOutDate])

  // 处理Banner点击
  const handleBannerClick = useCallback(() => {
    navigateTo({
      url: '/pages/hotel-detail/hotel-detail?id=1'
    })
  }, [])

  // 处理快捷标签点击
  const handleTagClick = useCallback((tag) => {
    console.log('点击标签', tag)
    // 这里可以根据标签更新筛选条件
  }, [])

  // 处理筛选条件点击
  const handleFilterClick = useCallback((filterType) => {
    console.log('点击筛选', filterType)
    // 这里可以跳转到详细筛选页
  }, [])

  // 处理日期选择
  const handleDateClick = useCallback(() => {
    console.log('点击日期选择')
    // 显示日历组件
    setShowCalendar(true)
  }, [])

  // 处理日期选择
  const handleDateSelect = useCallback((days) => {
    const today = new Date()
    const checkIn = new Date(today)
    const checkOut = new Date(today)
    checkOut.setDate(today.getDate() + days)

    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    setCheckInDate(formatDate(checkIn))
    setCheckOutDate(formatDate(checkOut))
    // 不自动关闭日历，让用户点击确定按钮关闭
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

  // 处理日期范围变化
  const handleDateRangeChange = useCallback((dates) => {
    if (dates && dates.length === 2) {
      const [start, end] = dates
      setCheckInDate(formatDate(new Date(start)))
      setCheckOutDate(formatDate(new Date(end)))
      // 不自动关闭日历，让用户点击确定按钮关闭
    }
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

  // 处理快捷选择天数
  const handleQuickSelect = useCallback((days) => {
    const today = new Date()
    const checkIn = formatDate(today)
    const checkOutDateObj = new Date(today)
    checkOutDateObj.setDate(today.getDate() + days)
    const checkOut = formatDate(checkOutDateObj)
    
    setCheckInDate(checkIn)
    setCheckOutDate(checkOut)
    setShowCalendar(false)
  }, [])

  // 处理日历取消
  const handleCalendarCancel = useCallback(() => {
    setShowCalendar(false)
  }, [])

  // 处理城市选择
  const handleCityClick = useCallback(() => {
    console.log('点击城市选择')
    // 这里应该跳转到城市选择页
  }, [])

  return (
    <View className='index'>
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
          <View className='tag' onClick={() => handleTagClick('亲子友好')}>亲子友好</View>
          <View className='tag' onClick={() => handleTagClick('免费停车场')}>免费停车场</View>
          <View className='tag' onClick={() => handleTagClick('含早餐')}>含早餐</View>
          <View className='tag' onClick={() => handleTagClick('豪华型')}>豪华型</View>
          <View className='tag' onClick={() => handleTagClick('商务出行')}>商务出行</View>
          <View className='tag' onClick={() => handleTagClick('近地铁')}>近地铁</View>
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
            
            {/* 快捷选择天数 */}
            <View className='calendar-quick-select'>
              <Text className='quick-select-title'>快捷选择</Text>
              <View className='quick-select-buttons'>
                <Button className='quick-select-btn' onClick={() => handleQuickSelect(1)}>
                  1天
                </Button>
                <Button className='quick-select-btn' onClick={() => handleQuickSelect(2)}>
                  2天
                </Button>
                <Button className='quick-select-btn' onClick={() => handleQuickSelect(3)}>
                  3天
                </Button>
                <Button className='quick-select-btn' onClick={() => handleQuickSelect(7)}>
                  7天
                </Button>
              </View>
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
              <Button className='calendar-cancel-btn' onClick={handleCalendarCancel}>
                取消
              </Button>
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
