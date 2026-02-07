import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Index () {
  useLoad(() => {
    console.log('Page loaded.')
  })

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
      <Text>Hello world!</Text>
    </View>
  )
}
