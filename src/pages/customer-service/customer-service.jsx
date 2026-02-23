import { View, Text, ScrollView, Input, Image, Button } from '@tarojs/components'
import { useState, useRef, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { aiApi } from '../../services/api'
import { searchKnowledgeBase } from '../../services/knowledge'
import './customer-service.less'

export default function CustomerServicePage () {
  // 状态管理
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'system',
      content: '欢迎来到易宿酒店客服中心，请问有什么可以帮助您的？',
      timestamp: new Date().toLocaleTimeString()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollViewRef = useRef(null)

  // 滚动到底部
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 滚动到底部
  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 999999, animated: true })
      }
    }, 100)
  }

  // 发送消息
  const sendMessage = async () => {
    if (!inputText.trim()) return

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputText.trim(),
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')

    // 使用后端AI聊天API
    setIsTyping(true)
    try {
      // 先在本地知识库中搜索
      const knowledgeResults = searchKnowledgeBase(inputText.trim())
      
      // 如果找到匹配的答案，直接使用知识库中的答案
      if (knowledgeResults.length > 0) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: knowledgeResults[0].answer,
          timestamp: new Date().toLocaleTimeString()
        }
        setMessages(prev => [...prev, botMessage])
        setIsTyping(false)
        return
      }

      // 构造API请求数据
      const apiMessages = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
      apiMessages.push({
        role: 'user',
        content: inputText.trim()
      })

      // 调用后端API
      const response = await aiApi.chat(apiMessages)
      console.log('AI聊天API响应:', response)

      // 处理API响应
      if (response.code === 0 && response.data) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: response.data.message?.content || '感谢您的咨询，我们会尽快为您处理。请问还有其他问题吗？',
          timestamp: new Date().toLocaleTimeString()
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        // API调用失败，显示错误信息
        const errorMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: '抱歉，客服服务暂时不可用，请稍后再试。',
          timestamp: new Date().toLocaleTimeString()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('AI聊天API调用失败:', error)
      // 网络错误，显示错误信息
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: '网络连接失败，请检查网络后重试。',
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  // 快速回复选项
  const quickReplies = [
    '如何预订酒店？',
    '取消订单如何操作？',
    '会员积分规则',
    '酒店设施详情'
  ]

  // 处理快速回复
  const handleQuickReply = (text) => {
    setInputText(text)
    sendMessage()
  }

  return (
    <View className='customer-service-page'>
      {/* 头部 */}
      <View className='cs-header'>
        <View className='back-button' onClick={() => Taro.navigateBack()}>
          <Text className='back-icon'>←</Text>
          <Text className='back-text'>返回</Text>
        </View>
        <Text className='header-title'>客服中心</Text>
        <View className='header-right'></View>
      </View>

      {/* 主体内容 */}
      <View className='cs-content'>
        {/* 聊天窗口 */}
        <ScrollView 
          ref={scrollViewRef}
          className='chat-wrapper'
          showsVerticalScrollIndicator={false}
        >
          {messages.map(message => (
            <View key={message.id} className={`message-item ${message.type}`}>
              {message.type !== 'system' && (
                <View className={`message-avatar ${message.type}`}>
                  <Text className='avatar-text'>
                    {message.type === 'user' ? '我' : '客'}
                  </Text>
                </View>
              )}
              <View className={`message-content ${message.type}`}>
                {message.type === 'system' && (
                  <Text className='system-label'>系统消息</Text>
                )}
                <Text className='message-text'>{message.content}</Text>
                <Text className='message-time'>{message.timestamp}</Text>
              </View>
            </View>
          ))}

          {/* 正在输入提示 */}
          {isTyping && (
            <View className='message-item bot'>
              <View className='message-avatar bot'>
                <Text className='avatar-text'>客</Text>
              </View>
              <View className='message-content bot'>
                <Text className='typing-indicator'>
                  <Text className='dot'>●</Text>
                  <Text className='dot'>●</Text>
                  <Text className='dot'>●</Text>
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* 快速回复选项 */}
        <View className='quick-replies'>
          {quickReplies.map((reply, index) => (
            <View 
              key={index} 
              className='quick-reply-item'
              onClick={() => handleQuickReply(reply)}
            >
              <Text className='quick-reply-text'>{reply}</Text>
            </View>
          ))}
        </View>

        {/* 输入区域 */}
        <View className='input-wrapper'>
          <Input 
            className='message-input'
            value={inputText}
            onInput={(e) => {
              const value = e.detail.value;
              setInputText(value);
            }}
            placeholder='请输入您的问题...'
            placeholderStyle={{ color: '#999' }}
            multiline
            autoFocus={false}
            style={{
              flex: 1,
              minHeight: '40px',
              maxHeight: '120px',
              fontSize: '14px',
              lineHeight: '1.4',
              padding: '10px',
              borderRadius: '16px',
              backgroundColor: '#f5f5f5',
              outline: 'none',
              zIndex: 1,
              resize: 'none',
              userSelect: 'text',
              pointerEvents: 'auto'
            }}
          />
          <View 
            className={`send-button ${inputText.trim() ? 'active' : ''}`}
            onClick={sendMessage}
            style={{ opacity: inputText.trim() ? 1 : 0.5 }}
          >
            <Text className='send-text'>发送</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
