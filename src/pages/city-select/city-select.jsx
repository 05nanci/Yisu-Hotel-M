import { View, Text, ScrollView, Input, Button } from '@tarojs/components'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, navigateTo, redirectTo, showToast, getCurrentPages, navigateBack, getStorageSync, setStorageSync } from '@tarojs/taro'
import './city-select.less'

export default function CitySelect () {
  const router = useRouter()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filteredCities, setFilteredCities] = useState([])
  const [currentLetter, setCurrentLetter] = useState('')
  const [showLetter, setShowLetter] = useState(false)
  const [searchHistory, setSearchHistory] = useState([])

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

  // 加载搜索历史
  const loadSearchHistory = useCallback(() => {
    try {
      const history = getStorageSync('citySearchHistory') || []
      setSearchHistory(history)
    } catch (error) {
      console.error('加载搜索历史失败:', error)
      setSearchHistory([])
    }
  }, [])

  // 保存搜索历史
  const saveSearchHistory = useCallback((cityName) => {
    if (!cityName.trim()) return
    try {
      let history = getStorageSync('citySearchHistory') || []
      history = history.filter(item => item !== cityName)
      history.unshift(cityName)
      if (history.length > 5) {
        history = history.slice(0, 5)
      }
      setStorageSync('citySearchHistory', history)
      setSearchHistory(history)
    } catch (error) {
      console.error('保存搜索历史失败:', error)
    }
  }, [])

  // 清除搜索历史
  const clearSearchHistory = useCallback(() => {
    try {
      setStorageSync('citySearchHistory', [])
      setSearchHistory([])
    } catch (error) {
      console.error('清除搜索历史失败:', error)
    }
  }, [])

  // 处理搜索
  const handleSearch = useCallback((keyword) => {
    setSearchKeyword(keyword)
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
  }, [])

  // 处理城市选择
  const handleCitySelect = useCallback((city) => {
    console.log('选择城市:', city)
    console.log('路由参数:', router.query)
    
    // 保存到搜索历史
    saveSearchHistory(city.name)
    
    // 获取返回URL，如果没有则默认返回首页
    let returnUrl = (router.query && router.query.returnUrl) || '/pages/index/index'
    console.log('返回URL:', returnUrl)
    
    // 确保返回URL包含/pages前缀
    if (!returnUrl.startsWith('/pages')) {
      returnUrl = `/pages${returnUrl}`
    }
    console.log('修正后的返回URL:', returnUrl)
    
    // 检查返回URL是否已经包含参数
    const separator = returnUrl.includes('?') ? '&' : '?'
    
    // 构建完整的跳转URL
    const jumpUrl = `${returnUrl}${separator}city=${encodeURIComponent(city.name)}&cityName=${encodeURIComponent(city.name)}`
    console.log('跳转URL:', jumpUrl)
    
    // 使用navigateTo跳转到指定页面
    try {
      navigateTo({
        url: jumpUrl,
        success: () => {
          console.log('跳转成功')
        },
        fail: (error) => {
          console.error('跳转失败:', error)
          // 如果navigateTo失败，尝试使用redirectTo
          redirectTo({
            url: jumpUrl,
            success: () => {
              console.log('使用redirectTo跳转成功')
            },
            fail: (error) => {
              console.error('使用redirectTo跳转失败:', error)
            }
          })
        }
      })
    } catch (error) {
      console.error('跳转异常:', error)
    }
  }, [router.query, saveSearchHistory])

  // 组件挂载时加载搜索历史
  useEffect(() => {
    loadSearchHistory()
  }, [loadSearchHistory])

  // 处理字母点击
  const handleLetterClick = useCallback((letter) => {
    setCurrentLetter(letter)
    setShowLetter(true)
    setTimeout(() => {
      setShowLetter(false)
    }, 500)
  }, [])

  // 渲染搜索历史
  const renderSearchHistory = () => {
    if (searchHistory.length === 0 || searchKeyword) {
      return null
    }

    return (
      <View className='city-section'>
        <View className='section-header'>
          <Text className='section-title'>搜索历史</Text>
          <Text className='clear-history' onClick={clearSearchHistory}>清除</Text>
        </View>
        <View className='history-cities'>
          {searchHistory.map((cityName, index) => (
            <View 
              key={index} 
              className='history-city-item'
              onClick={() => {
                // 查找对应的城市对象
                let targetCity = null
                Object.values(citiesData).forEach(cityList => {
                  const city = cityList.find(c => c.name === cityName)
                  if (city) {
                    targetCity = city
                  }
                })
                if (targetCity) {
                  handleCitySelect(targetCity)
                }
              }}
            >
              <Text>{cityName}</Text>
            </View>
          ))}
        </View>
      </View>
    )
  }

  // 渲染热门城市
  const renderHotCities = () => {
    return (
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
    )
  }

  // 渲染城市列表
  const renderCityList = () => {
    return (
      <>
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
    )
  }

  // 渲染搜索结果
  const renderSearchResults = () => {
    if (!searchKeyword || filteredCities.length === 0) {
      return null
    }

    return (
      <View className='search-results'>
        <Text className='section-title'>搜索结果</Text>
        <View className='city-list'>
          {filteredCities.map(city => (
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
    )
  }

  return (
    <View className='city-select'>
      {/* 头部 */}
      <View className='city-select-header'>
        <Text className='header-title'>城市选择</Text>
      </View>

      {/* 搜索框 */}
      <View className='search-box'>
        <Text className='search-icon'>🔍</Text>
        <Input 
          className='search-input'
          placeholder='输入城市名称搜索'
          value={searchKeyword}
          onChange={(e) => handleSearch(e.detail.value)}
        />
      </View>

      {/* 城市列表 */}
      <ScrollView 
        className='city-list-container'
        scrollY
        style={{ flex: 1 }}
      >
        {searchKeyword ? (
          renderSearchResults()
        ) : (
          <>
            {renderSearchHistory()}
            {renderHotCities()}
            {renderCityList()}
          </>
        )}
      </ScrollView>

      {/* 字母索引 */}
      <View className='letter-index'>
        {letters.map(letter => (
          <Text 
            key={letter} 
            className='letter-item'
            onClick={() => handleLetterClick(letter)}
          >
            {letter}
          </Text>
        ))}
      </View>

      {/* 字母提示 */}
      {showLetter && (
        <View className='letter-tip'>
          <Text>{currentLetter}</Text>
        </View>
      )}
    </View>
  )
}
