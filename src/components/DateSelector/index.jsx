import { View, Text, ScrollView, Button } from '@tarojs/components'
import { useState, useEffect, useCallback } from 'react'
import './index.less'

export default function DateSelector ({ visible, onCancel, onConfirm, initialCheckIn, initialCheckOut }) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [checkInDate, setCheckInDate] = useState(initialCheckIn || '')
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOut || '')
  const [calendarDays, setCalendarDays] = useState([])

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
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
      })
    }
    
    setCalendarDays(days)
  }, [currentYear, currentMonth])

  // 格式化日期函数
  const formatDate = useCallback((date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])

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
    // 解析日期，获取年和月
    const selectedDate = new Date(date)
    const selectedYear = selectedDate.getFullYear()
    const selectedMonth = selectedDate.getMonth() + 1
    
    // 如果选择的是其他月份的日期，切换到对应的月份
    if (selectedYear !== currentYear || selectedMonth !== currentMonth) {
      setCurrentYear(selectedYear)
      setCurrentMonth(selectedMonth)
    }
    
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
  }, [checkInDate, checkOutDate, currentYear, currentMonth])

  // 计算住宿晚数
  const calculateNights = useCallback((checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0
    
    const startDate = new Date(checkIn)
    const endDate = new Date(checkOut)
    const timeDiff = endDate.getTime() - startDate.getTime()
    const nightCount = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    return nightCount
  }, [])

  // 处理确认
  const handleConfirm = useCallback(() => {
    if (checkInDate && checkOutDate) {
      onConfirm(checkInDate, checkOutDate, calculateNights(checkInDate, checkOutDate))
    }
  }, [checkInDate, checkOutDate, calculateNights, onConfirm])

  // 处理取消
  const handleCancel = useCallback(() => {
    onCancel()
  }, [onCancel])

  if (!visible) return null

  return (
    <View className='date-selector-overlay'>
      <View className='date-selector-content'>
        <View className='date-selector-header'>
          <Text className='date-selector-title'>选择日期</Text>
          <Text className='date-selector-close' onClick={handleCancel}>✕</Text>
        </View>
        
        <View className='date-range-info'>
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
        
        <View className='week-header'>
          {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
            <Text key={index} className='week-day'>
              {day}
            </Text>
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
                onClick={() => !isDisabled && handleDateCellClick(day.date)}
              >
                <Text className={`date-text ${isDisabled ? 'disabled-text' : ''} ${isOtherMonth ? 'disabled-text' : ''}`}>
                  {day.day}
                </Text>
              </View>
            )
          })}
        </View>
        
        <View className='date-selector-footer'>
          <Button className='date-selector-confirm-btn' onClick={handleConfirm}>
            确认
          </Button>
        </View>
      </View>
    </View>
  )
}
