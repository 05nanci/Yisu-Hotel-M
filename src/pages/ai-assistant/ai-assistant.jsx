import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Input, ScrollView, Image } from '@tarojs/components';
import { useRouter, navigateTo } from '@tarojs/taro';
import { aiApi } from '../../services/api';
import './ai-assistant.less';

// AI助手页面
export default function AIAssistant() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: '您好！我是酒店AI助手，有什么可以帮您的吗？',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);

  // 滚动到底部
  useEffect(() => {
    setTimeout(() => {
      try {
        // 使用Taro的滚动API
        const scrollView = scrollViewRef.current;
        if (scrollView) {
          // 对于H5环境，使用原生滚动
          scrollView.scrollTop = scrollView.scrollHeight;
        }
      } catch (error) {
        console.error('滚动到底部失败:', error);
      }
    }, 100);
  }, [messages]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      // 调用AI助手API
      const result = await aiApi.chat([
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        userMessage
      ]);

      if (result.code === 0 && result.data?.message) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.data.message.content,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // 后端返回错误，使用模拟数据
        const mockMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: getMockResponse(inputText.trim()),
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, mockMessage]);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      // 网络错误，使用模拟数据
      const mockMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getMockResponse(inputText.trim()),
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, mockMessage]);
    } finally {
      setLoading(false);
    }
  };

  // 获取模拟响应
  const getMockResponse = (userInput) => {
    if (userInput.includes('附近有哪些酒店')) {
      return '附近有多家优质酒店可供选择，包括：1. 豪华酒店 - 距离您约1公里，提供免费WiFi和停车场；2. 商务酒店 - 距离您约2公里，价格实惠，交通便利；3. 精品酒店 - 距离您约3公里，环境优雅，服务周到。您可以通过我们的预订系统查看详细信息并进行预订。';
    } else if (userInput.includes('如何预订酒店')) {
      return '预订酒店非常简单，您可以通过以下方式：1. 在我们的官网或APP上直接预订；2. 拨打客服电话进行预订；3. 前往酒店前台现场预订。预订时需要提供入住日期、离店日期、人数等信息，完成支付后即可收到预订确认。';
    } else if (userInput.includes('入住时间')) {
      return '酒店的入住时间通常为14:00后，退房时间为12:00前。如果您需要提前入住或延迟退房，可以与酒店前台联系，视酒店客房情况而定。';
    } else if (userInput.includes('停车场')) {
      return '是的，大多数酒店都提供停车场服务。具体情况可能因酒店而异，部分酒店可能需要收取停车费。建议您在预订时咨询酒店前台或查看酒店详情页面获取准确信息。';
    } else {
      return '您好！我是酒店AI助手，可以帮您解答酒店相关问题，如预订流程、酒店设施、入住政策等。请问有什么可以帮助您的吗？';
    }
  };

  // 快速问题
  const quickQuestions = [
    '附近有哪些酒店？',
    '如何预订酒店？',
    '酒店入住时间是几点？',
    '酒店有停车场吗？'
  ];

  const handleQuickQuestion = (question) => {
    setInputText(question);
    handleSendMessage();
  };

  return (
    <View className="ai-assistant-container">
      {/* 头部 */}
      <View className="ai-assistant-header">
        <View 
          className="back-button"
          onClick={() => navigateTo({ url: '/pages/index/index' })}
        >
          <Text className="back-icon">←</Text>
        </View>
        <Text className="header-title">AI助手</Text>
        <View className="header-right"></View>
      </View>

      {/* 聊天区域 */}
      <ScrollView 
        ref={scrollViewRef}
        className="chat-container"
        scrollY
        style={{ flex: 1 }}
      >
        {/* 欢迎信息 */}
        <View className="welcome-message">
          <Text className="welcome-text">
            您好！我是酒店AI助手，可以帮您解答酒店相关问题，如预订流程、酒店设施、入住政策等。
          </Text>
        </View>

        {/* 快速问题 */}
        <View className="quick-questions">
          <Text className="quick-questions-title">快速提问</Text>
          <View className="quick-questions-list">
            {quickQuestions.map((question, index) => (
              <View 
                key={index}
                className="quick-question-item"
                onClick={() => handleQuickQuestion(question)}
              >
                <Text className="quick-question-text">{question}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 消息列表 */}
        <View className="messages-list">
          {messages.map((message) => (
            <View 
              key={message.id}
              className={`message-item ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              {message.role === 'assistant' && (
                <View className="avatar-container">
                  <View className="avatar assistant-avatar">
                    <Text className="avatar-icon">AI</Text>
                  </View>
                </View>
              )}
              <View className="message-content">
                <Text className="message-text">{message.content}</Text>
                <Text className="message-timestamp">{message.timestamp}</Text>
              </View>
              {message.role === 'user' && (
                <View className="avatar-container">
                  <View className="avatar user-avatar">
                    <Text className="avatar-icon">您</Text>
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* 加载中 */}
          {loading && (
            <View className="message-item assistant-message">
              <View className="avatar-container">
                <View className="avatar assistant-avatar">
                  <Text className="avatar-icon">AI</Text>
                </View>
              </View>
              <View className="message-content">
                <View className="loading-indicator">
                  <View className="loading-dot"></View>
                  <View className="loading-dot"></View>
                  <View className="loading-dot"></View>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 输入区域 */}
      <View className="input-container">
        <Input
          className="input-field"
          placeholder="输入您的问题..."
          value={inputText}
          onInput={(e) => {
            const value = e.detail.value;
            setInputText(value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading) {
              handleSendMessage();
            }
          }}
          autoFocus={false}
          style={{
            flex: 1,
            height: '64rpx',
            border: '1rpx solid #e0e0e0',
            borderRadius: '32rpx',
            padding: '0 24rpx',
            fontSize: '26rpx',
            backgroundColor: '#f9f9f9',
            outline: 'none',
            zIndex: 1,
            userSelect: 'text',
            pointerEvents: 'auto'
          }}
        />
        <View 
          className={`send-button ${!inputText.trim() || loading ? 'disabled' : ''}`}
          onClick={handleSendMessage}
          style={{ pointerEvents: (!inputText.trim() || loading) ? 'none' : 'auto' }}
        >
          <Text className="send-icon">↑</Text>
        </View>
      </View>
    </View>
  );
}
